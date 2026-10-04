import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma';
import { serviceSchema } from '@buhariy/contracts';
import { z } from 'zod';
@Injectable()
export class ServicesService {
  constructor(private db: PrismaService) {}
  list(published = false) {
    return this.db.service.findMany({
      where: { ...(published ? { published: true } : {}) },
      orderBy: { order: 'asc' },
      take: 100,
    });
  }
  create(data: z.infer<typeof serviceSchema>) {
    return this.db.service.create({ data });
  }
  update(id: string, data: z.infer<typeof serviceSchema>) {
    return this.db.service.update({ where: { id }, data });
  }
  remove(id: string) {
    return this.db.service.delete({ where: { id } });
  }
  getPublic(slug: string) {
    return this.db.service.findFirstOrThrow({ where: { slug, published: true } });
  }
}
