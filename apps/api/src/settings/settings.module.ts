import { Body, Controller, Get, Module, Patch, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { settingSchema, policySchema } from '@buhariy/contracts';
import { PrismaService } from '../common/prisma';
import { Public, Roles } from '../auth/security';
import { Validate } from '../common/http';
@Controller()
export class PublicSettingsController {
  constructor(private db: PrismaService) {}
  @Public() @Get('settings') settings() {
    return this.db.setting.findMany({
      where: { public: true },
      select: { key: true, value: true },
    });
  }
  @Public() @Get('privacy') privacy() {
    return this.db.privacyPolicy.findFirstOrThrow({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  @Public() @Get('health') async health() {
    await this.db.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }
}
@Controller('admin')
@Roles('ADMIN')
export class SettingsController {
  constructor(private db: PrismaService) {}
  @Get('settings') list() {
    return this.db.setting.findMany({ orderBy: { key: 'asc' } });
  }
  @Patch('settings') save(@Body(new Validate(settingSchema)) b: z.infer<typeof settingSchema>) {
    return this.db.setting.upsert({ where: { key: b.key }, create: b, update: b });
  }
  @Get('privacy') policies() {
    return this.db.privacyPolicy.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }
  @Post('privacy') policy(@Body(new Validate(policySchema)) b: z.infer<typeof policySchema>) {
    return this.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(840101)::text`;
      if (b.active)
        await tx.privacyPolicy.updateMany({ where: { active: true }, data: { active: false } });
      return tx.privacyPolicy.create({ data: b });
    });
  }
}
@Controller('admin/dashboard')
@Roles('ADMIN', 'EDITOR')
export class DashboardController {
  constructor(private db: PrismaService) {}
  @Get() async stats(@Req() req: { user: { role: string } }) {
    const [projects, published, team] = await Promise.all([
      this.db.project.count(),
      this.db.project.count({ where: { published: true } }),
      this.db.teamMember.count(),
    ]);
    const admin = req.user.role === 'ADMIN';
    const [newRequests, inProgress, activity] = admin
      ? await Promise.all([
          this.db.clientRequest.count({ where: { status: 'NEW' } }),
          this.db.clientRequest.count({
            where: {
              status: { in: ['REVIEWING', 'CONTACTED', 'DISCUSSION', 'PROPOSAL', 'NEGOTIATION'] },
            },
          }),
          this.db.auditLog.findMany({
            take: 8,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
          }),
        ])
      : [0, 0, []];
    return {
      projects,
      published,
      drafts: projects - published,
      team,
      newRequests,
      inProgress,
      activity,
    };
  }
}
@Module({ controllers: [PublicSettingsController, SettingsController, DashboardController] })
export class SettingsModule {}
