import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  PipeTransform,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ZodType } from 'zod';
import { Response } from 'express';
import { tap } from 'rxjs';
import { PrismaService } from './prisma';
export class Validate implements PipeTransform {
  constructor(private schema: ZodType) {}
  transform(value: unknown) {
    const r = this.schema.safeParse(value);
    if (!r.success)
      throw new BadRequestException(
        r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      );
    return r.data;
  }
}
export function pagination(page?: string, limit?: string) {
  const p = Number(page || 1),
    l = Number(limit || 12);
  if (!Number.isInteger(p) || p < 1 || p > 100000 || !Number.isInteger(l) || l < 1 || l > 100)
    throw new BadRequestException('Invalid pagination');
  return { page: p, take: l, skip: (p - 1) * l };
}
export const safeUser = { id: true, email: true, name: true, role: true, active: true } as const;
@Catch()
export class Errors implements ExceptionFilter {
  private logger = new Logger('HTTP');
  catch(error: unknown, host: ArgumentsHost) {
    let status = 500,
      code = 'INTERNAL_ERROR',
      message = 'Something went wrong. Please try again.';
    if (error instanceof HttpException) {
      status = error.getStatus();
      message = error.message;
      code =
        (
          {
            400: 'VALIDATION_ERROR',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            413: 'UPLOAD_TOO_LARGE',
            429: 'RATE_LIMITED',
          } as Record<number, string>
        )[status] || 'REQUEST_ERROR';
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        status = 409;
        code = 'CONFLICT';
        message = 'This value already exists';
      } else if (error.code === 'P2025') {
        status = 404;
        code = 'NOT_FOUND';
        message = 'Record not found';
      } else if (error.code === 'P2003') {
        status = 400;
        code = 'INVALID_RELATION';
        message = 'Related record is missing or in use';
      }
    }
    if (status === 500)
      this.logger.error({
        event: 'server_error',
        type: error instanceof Error ? error.name : 'Unknown',
      });
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ success: false, code, message });
  }
}
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private db: PrismaService) {}
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest();
    return next.handle().pipe(
      tap({
        next: () => {
          if (req.user && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            void this.db.auditLog
              .create({
                data: {
                  userId: req.user.id,
                  action: req.method,
                  entity: req.route?.path || req.path,
                  entityId: req.params?.id,
                },
              })
              .catch(() => new Logger('Audit').error('Audit write failed'));
          }
        },
      }),
    );
  }
}
