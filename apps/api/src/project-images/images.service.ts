import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { prepareImage } from '../media/prepare-image';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../common/prisma';
import { StorageService } from '../media/storage.service';
import { MAX_PROJECT_IMAGES } from '@buhariy/contracts';
@Injectable()
export class ImagesService {
  constructor(
    private db: PrismaService,
    private storage: StorageService,
  ) {}
  prepare(file: Express.Multer.File) {
    return prepareImage(file);
  }
  async upload(projectId: string, file: Express.Multer.File, replaceId?: string) {
    const data = await this.prepare(file),
      key = `projects/${projectId}/${randomUUID()}.webp`;
    const url = await this.storage.put(key, data, 'image/webp');
    let oldKey: string | undefined;
    try {
      const image = await this.db.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<
          { id: string }[]
        >`SELECT id FROM "Project" WHERE id = ${projectId} FOR UPDATE`;
        if (!rows.length) throw new NotFoundException();
        if (replaceId) {
          const old = await tx.projectImage.findFirst({ where: { id: replaceId, projectId } });
          if (!old) throw new NotFoundException();
          oldKey = old.key;
          return tx.projectImage.update({ where: { id: replaceId }, data: { key, url } });
        }
        const count = await tx.projectImage.count({ where: { projectId } });
        if (count >= MAX_PROJECT_IMAGES)
          throw new BadRequestException('Maximum 5 images per project');
        return tx.projectImage.create({
          data: { projectId, key, url, alt: '', sortOrder: count, isCover: count === 0 },
        });
      });
      if (oldKey) await this.storage.remove(oldKey);
      return image;
    } catch (e) {
      await this.storage.remove(key);
      throw e;
    }
  }
  async update(projectId: string, id: string, b: { alt?: string; isCover?: true }) {
    return this.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Project" WHERE id = ${projectId} FOR UPDATE`;
      const image = await tx.projectImage.findFirst({ where: { id, projectId } });
      if (!image) throw new NotFoundException();
      if (b.isCover)
        await tx.projectImage.updateMany({ where: { projectId }, data: { isCover: false } });
      return tx.projectImage.update({ where: { id }, data: b });
    });
  }
  async reorder(projectId: string, ids: string[]) {
    return this.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Project" WHERE id = ${projectId} FOR UPDATE`;
      const images = await tx.projectImage.findMany({ where: { projectId } });
      if (images.length !== ids.length || ids.some((id) => !images.some((i) => i.id === id)))
        throw new BadRequestException('Include every project image exactly once');
      await Promise.all(
        ids.map((id, sortOrder) => tx.projectImage.update({ where: { id }, data: { sortOrder } })),
      );
      return { success: true };
    });
  }
  async remove(projectId: string, id: string) {
    const key = await this.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Project" WHERE id = ${projectId} FOR UPDATE`;
      const image = await tx.projectImage.findFirst({ where: { id, projectId } });
      if (!image) throw new NotFoundException();
      await tx.projectImage.delete({ where: { id } });
      const remaining = await tx.projectImage.findMany({
        where: { projectId },
        orderBy: { sortOrder: 'asc' },
      });
      for (let n = 0; n < remaining.length; n++)
        await tx.projectImage.update({
          where: { id: remaining[n].id },
          data: { sortOrder: n, ...(image.isCover ? { isCover: n === 0 } : {}) },
        });
      return image.key;
    });
    await this.storage.remove(key);
    return { success: true };
  }
}
