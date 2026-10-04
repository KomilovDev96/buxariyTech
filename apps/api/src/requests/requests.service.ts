import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma';
import { safeUser } from '../common/http';
import { NotificationService } from '../notifications/notifications.module';
import { LeadInput, requestPatchSchema } from '@buhariy/contracts';
import { z } from 'zod';
const include = {
  assignedTo: { select: safeUser },
  notes: {
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' as const },
  },
};
@Injectable()
export class RequestsService {
  constructor(
    private db: PrismaService,
    private notifications: NotificationService,
  ) {}
  async create(input: LeadInput) {
    const { website, ...data } = input;
    const policy = await this.db.privacyPolicy.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!policy || policy.version !== data.privacyPolicyVersion)
      throw new BadRequestException('Privacy policy changed. Reload the form and review it again.');
    const r = await this.db.clientRequest.create({ data: { ...data, consentAt: new Date() } });
    await this.notifications.newRequest(r.id);
    return { success: true, message: 'Arizangiz qabul qilindi' };
  }
  async list(page: number, take: number, skip: number, status?: string) {
    if (status && !Object.values(RequestStatus).includes(status as RequestStatus))
      throw new BadRequestException('Invalid status');
    const where: Prisma.ClientRequestWhereInput = status ? { status: status as RequestStatus } : {};
    const [items, total] = await this.db.$transaction([
      this.db.clientRequest.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.db.clientRequest.count({ where }),
    ]);
    return { items, total, page, pages: Math.ceil(total / take) };
  }
  get(id: string) {
    return this.db.clientRequest.findUniqueOrThrow({ where: { id }, include });
  }
  async update(id: string, data: z.infer<typeof requestPatchSchema>) {
    if (data.assignedToId) {
      const user = await this.db.user.findFirst({
        where: { id: data.assignedToId, active: true, role: 'ADMIN' },
      });
      if (!user) throw new BadRequestException('Assign an active administrator');
    }
    return this.db.clientRequest.update({ where: { id }, data, include });
  }
  note(id: string, authorId: string, body: string) {
    return this.db.requestNote.create({
      data: { requestId: id, authorId, body },
      include: { author: { select: { id: true, name: true } } },
    });
  }
}
