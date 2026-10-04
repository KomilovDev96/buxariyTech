import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { z } from 'zod';
import {
  siteBlockDefaults,
  siteBlockKeys,
  contentLocales,
  siteBlockSchema,
  MAX_UPLOAD_BYTES,
} from '@buhariy/contracts';
import { PrismaService } from '../common/prisma';
import { Public, Roles } from '../auth/security';
import { Validate } from '../common/http';
import { StorageService } from '../media/storage.service';
import { prepareImage } from '../media/prepare-image';
import { randomUUID } from 'node:crypto';
const select = {
  key: true,
  locale: true,
  title: true,
  body: true,
  label: true,
  imageUrl: true,
  imageAlt: true,
} as const;
const paramsSchema = z
  .object({ key: z.enum(siteBlockKeys), locale: z.enum(contentLocales) })
  .strict();
type Params = z.infer<typeof paramsSchema>;
@Injectable()
class SiteBlocksService {
  constructor(
    private db: PrismaService,
    private storage: StorageService,
  ) {}
  async list() {
    const rows = await this.db.siteBlock.findMany({ select });
    return siteBlockDefaults.map((fallback) => {
      const row = rows.find((r) => r.key === fallback.key && r.locale === fallback.locale);
      return row ? { ...row, imageUrl: row.imageUrl || fallback.imageUrl } : fallback;
    });
  }
  save(p: Params, data: z.infer<typeof siteBlockSchema>) {
    return this.db.siteBlock.upsert({
      where: { key_locale: p },
      create: { ...p, ...data },
      update: data,
      select,
    });
  }
  async image(p: Params, file?: Express.Multer.File) {
    const imageKey = file ? `site/${p.key}/${p.locale}/${randomUUID()}.webp` : '';
    const imageUrl = file
      ? await this.storage.put(imageKey, await prepareImage(file), 'image/webp')
      : '';
    let oldKey = '';
    try {
      const block = await this.db.$transaction(async (tx) => {
        // Serializes uploads and removals even before a block's first row exists.
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`site:${p.key}:${p.locale}`}))::text`;
        const old = await tx.siteBlock.findUnique({ where: { key_locale: p } });
        oldKey = old?.imageKey || '';
        return tx.siteBlock.upsert({
          where: { key_locale: p },
          create: {
            ...siteBlockDefaults.find((b) => b.key === p.key && b.locale === p.locale)!,
            ...p,
            imageKey,
            imageUrl,
          },
          update: { imageKey, imageUrl },
          select,
        });
      });
      if (oldKey) await this.storage.remove(oldKey);
      return block;
    } catch (e) {
      if (imageKey) await this.storage.remove(imageKey);
      throw e;
    }
  }
}
@Controller('site-blocks')
class PublicSiteBlocksController {
  constructor(private service: SiteBlocksService) {}
  @Public() @Get() list() {
    return this.service.list();
  }
}
@Controller('admin/site-blocks')
@Roles('ADMIN', 'EDITOR')
class SiteBlocksController {
  constructor(private service: SiteBlocksService) {}
  @Get() list() {
    return this.service.list();
  }
  @Patch(':key/:locale') save(
    @Param(new Validate(paramsSchema)) p: Params,
    @Body(new Validate(siteBlockSchema)) b: z.infer<typeof siteBlockSchema>,
  ) {
    return this.service.save(p, b);
  }
  @Post(':key/:locale/image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } }))
  async upload(
    @Param(new Validate(paramsSchema)) p: Params,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) await prepareImage(file);
    return this.service.image(p, file);
  }
  @Delete(':key/:locale/image') remove(@Param(new Validate(paramsSchema)) p: Params) {
    return this.service.image(p);
  }
}
@Module({
  controllers: [PublicSiteBlocksController, SiteBlocksController],
  providers: [SiteBlocksService],
})
export class SiteBlocksModule {}
