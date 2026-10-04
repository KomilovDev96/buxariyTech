import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma';
import { taxonomySchema } from '@buhariy/contracts';
import { z } from 'zod';
@Injectable()
export class CategoriesService {
  constructor(private db: PrismaService) {}
  list(published = false) {
    return this.db.category.findMany({ where: {}, orderBy: { name: 'asc' }, take: 100 });
  }
  create(data: z.infer<typeof taxonomySchema>) {
    return this.db.category.create({ data });
  }
  update(id: string, data: z.infer<typeof taxonomySchema>) {
    return this.db.category.update({ where: { id }, data });
  }
  remove(id: string) {
    return this.db.category.delete({ where: { id } });
  }
}
