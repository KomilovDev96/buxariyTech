import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma';
import { safeUser } from '../common/http';
import { createHash, randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
@Injectable()
export class AuthService {
  private logger = new Logger('Auth');
  private dummy = argon2.hash(randomBytes(32).toString('hex'), { type: argon2.argon2id });
  constructor(
    private db: PrismaService,
    private jwt: JwtService,
  ) {}
  async login(email: string, password: string) {
    const user = await this.db.user.findUnique({ where: { email } });
    const valid = await argon2.verify(user?.passwordHash || (await this.dummy), password);
    if (!valid || !user?.active) {
      this.logger.warn({ event: 'login_failed' });
      throw new UnauthorizedException('Email or password is incorrect');
    }
    const refresh = randomBytes(48).toString('base64url');
    const session = await this.db.session.create({
      data: {
        userId: user.id,
        refreshHash: hash(refresh),
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    this.logger.log({ event: 'login_success', userId: user.id });
    return this.tokens(user.id, session.id, refresh);
  }
  async refresh(token: string) {
    if (!token) throw new UnauthorizedException();
    const refresh = randomBytes(48).toString('base64url');
    const session = await this.db.$transaction(async (tx) => {
      const old = await tx.session.findUnique({
        where: { refreshHash: hash(token) },
        include: { user: { select: { active: true } } },
      });
      if (!old || !old.user.active || old.expiresAt.getTime() < Date.now())
        throw new UnauthorizedException('Session expired');
      const updated = await tx.session.updateMany({
        where: { id: old.id, refreshHash: hash(token) },
        data: { refreshHash: hash(refresh) },
      });
      if (updated.count !== 1) throw new UnauthorizedException('Session already refreshed');
      return old;
    });
    return this.tokens(session.userId, session.id, refresh);
  }
  private async tokens(userId: string, sid: string, refresh: string) {
    return {
      access: await this.jwt.signAsync({ sub: userId, sid }),
      refresh,
      user: await this.db.user.findUniqueOrThrow({ where: { id: userId }, select: safeUser }),
    };
  }
  async logout(token: string) {
    if (token) await this.db.session.deleteMany({ where: { refreshHash: hash(token) } });
    return { success: true };
  }
}
