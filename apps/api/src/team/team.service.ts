import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma';
import { teamSchema } from '@buhariy/contracts';
import { z } from 'zod';
@Injectable()
export class TeamService {
  constructor(private db: PrismaService) {}
  list(published = false) {
    return this.db.teamMember.findMany({
      where: { ...(published ? { published: true } : {}) },
      orderBy: { order: 'asc' },
      take: 100,
    });
  }
  create(data: z.infer<typeof teamSchema>) {
    return this.db.teamMember.create({ data });
  }
  update(id: string, data: z.infer<typeof teamSchema>) {
    return this.db.teamMember.update({ where: { id }, data });
  }
  remove(id: string) {
    return this.db.teamMember.delete({ where: { id } });
  }
}
