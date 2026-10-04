import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma';
import { safeUser } from '../common/http';
import { Role } from '@prisma/client';
export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwt: JwtService,
    private db: PrismaService,
  ) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const allowed = [process.env.ADMIN_ORIGIN, process.env.WEB_ORIGIN];
      if (!req.headers.origin || !allowed.includes(req.headers.origin))
        throw new ForbiddenException('Origin not allowed');
    }
    if (this.reflector.getAllAndOverride('public', [ctx.getHandler(), ctx.getClass()])) return true;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; sid: string }>(
        req.cookies?.bt_access || '',
      );
      const s = await this.db.session.findFirst({
        where: {
          id: payload.sid,
          userId: payload.sub,
          expiresAt: { gt: new Date() },
          user: { active: true },
        },
        include: { user: { select: safeUser } },
      });
      if (!s) throw new Error();
      req.user = s.user;
      req.sessionId = s.id;
    } catch {
      throw new UnauthorizedException('Please sign in');
    }
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (roles && !roles.includes(req.user.role))
      throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
