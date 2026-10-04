import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma';
import { ProjectInput } from '@buhariy/contracts';
import { StorageService } from '../media/storage.service';
export const projectInclude = {
  category: true,
  technologies: true,
  images: {
    orderBy: { sortOrder: 'asc' as const },
    select: { id: true, url: true, alt: true, sortOrder: true, isCover: true },
  },
};
@Injectable()
export class ProjectsService {
  constructor(
    private db: PrismaService,
    private storage: StorageService,
  ) {}
  async list(page: number, take: number, skip: number, admin = false, category?: string) {
    const where: Prisma.ProjectWhereInput = {
      ...(admin ? {} : { published: true }),
      ...(category ? { category: { slug: category } } : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.project.findMany({
        where,
        include: projectInclude,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        take,
        skip,
      }),
      this.db.project.count({ where }),
    ]);
    return { items, total, page, pages: Math.ceil(total / take) };
  }
  async get(slug: string) {
    const p = await this.db.project.findFirst({
      where: { slug, published: true },
      include: projectInclude,
    });
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }
  getAdmin(id: string) {
    return this.db.project.findUniqueOrThrow({ where: { id }, include: projectInclude });
  }
  create(input: ProjectInput) {
    const { technologyIds, ...data } = input;
    return this.db.project.create({
      data: { ...data, technologies: { connect: technologyIds.map((id) => ({ id })) } },
      include: projectInclude,
    });
  }
  update(id: string, input: Partial<ProjectInput>) {
    const { technologyIds, ...data } = input;
    return this.db.project.update({
      where: { id },
      data: {
        ...data,
        ...(technologyIds ? { technologies: { set: technologyIds.map((id) => ({ id })) } } : {}),
      },
      include: projectInclude,
    });
  }
  async remove(id: string) {
    const images = await this.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Project" WHERE id = ${id} FOR UPDATE`;
      const p = await tx.project.delete({ where: { id }, include: { images: true } });
      return p.images;
    });
    await Promise.all(images.map((i) => this.storage.remove(i.key)));
    return { success: true };
  }
}
