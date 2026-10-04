import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Module,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { z } from 'zod';
import { userSchema, userPatchSchema } from '@buhariy/contracts';
import { PrismaService } from '../common/prisma';
import { Validate, safeUser } from '../common/http';
import { Roles } from '../auth/security';
@Controller('admin/users')
@Roles('ADMIN')
export class UsersController {
  constructor(private db: PrismaService) {}
  @Get() list() {
    return this.db.user.findMany({ select: safeUser, orderBy: { name: 'asc' }, take: 100 });
  }
  @Post() async create(@Body(new Validate(userSchema)) b: z.infer<typeof userSchema>) {
    const { password, ...data } = b;
    return this.db.user.create({
      data: { ...data, passwordHash: await argon2.hash(password, { type: argon2.argon2id }) },
      select: safeUser,
    });
  }
  @Patch(':id') async update(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
    @Body(new Validate(userPatchSchema)) b: z.infer<typeof userPatchSchema>,
  ) {
    if (id === req.user.id && (b.active === false || b.role === 'EDITOR'))
      throw new BadRequestException('You cannot remove your own administrator access');
    const { password, ...data } = b;
    return this.db.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id },
        data: {
          ...data,
          ...(password
            ? { passwordHash: await argon2.hash(password, { type: argon2.argon2id }) }
            : {}),
        },
        select: safeUser,
      });
      if (password || b.active === false || b.role)
        await tx.session.deleteMany({ where: { userId: id } });
      return u;
    });
  }
}
@Module({ controllers: [UsersController] })
export class UsersModule {}
