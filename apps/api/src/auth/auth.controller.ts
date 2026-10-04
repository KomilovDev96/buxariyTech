import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { loginSchema, SafeUser } from '@buhariy/contracts';
import { Validate } from '../common/http';
import { AuthService } from './auth.service';
import { Public } from './security';
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  private cookies(res: Response, tokens: { access: string; refresh: string }) {
    const base = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax' as const,
    };
    res.cookie('bt_access', tokens.access, { ...base, path: '/', maxAge: 15 * 60000 });
    res.cookie('bt_refresh', tokens.refresh, { ...base, path: '/auth', maxAge: 7 * 86400000 });
    res.setHeader('Cache-Control', 'no-store');
  }
  @Public() @Throttle({ default: { limit: 8, ttl: 60000 } }) @Post('login') async login(
    @Body(new Validate(loginSchema)) b: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const t = await this.auth.login(b.email, b.password);
    this.cookies(res, t);
    return t.user;
  }
  @Public() @Post('refresh') async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const t = await this.auth.refresh(req.cookies?.bt_refresh);
    this.cookies(res, t);
    return t.user;
  }
  @Public() @Post('logout') async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(req.cookies?.bt_refresh);
    res.clearCookie('bt_access', { path: '/' });
    res.clearCookie('bt_refresh', { path: '/auth' });
    return { success: true };
  }
  @Get('me') me(@Req() req: Request & { user: SafeUser }) {
    return req.user;
  }
}
