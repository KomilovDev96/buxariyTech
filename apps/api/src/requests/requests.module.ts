import { Body, Controller, Get, Module, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { LeadInput, requestSchema, requestPatchSchema, noteSchema } from '@buhariy/contracts';
import { Public, Roles } from '../auth/security';
import { Validate, pagination } from '../common/http';
import { RequestsService } from './requests.service';
@Controller('requests')
export class PublicRequestsController {
  constructor(private service: RequestsService) {}
  @Public() @Throttle({ default: { limit: 3, ttl: 60000 } }) @Post() create(
    @Body(new Validate(requestSchema)) b: LeadInput,
  ) {
    return this.service.create(b);
  }
}
@Controller('admin/requests')
@Roles('ADMIN')
export class RequestsController {
  constructor(private service: RequestsService) {}
  @Get() list(@Query('page') p?: string, @Query('limit') l?: string, @Query('status') s?: string) {
    const q = pagination(p, l);
    return this.service.list(q.page, q.take, q.skip, s);
  }
  @Get(':id') get(@Param('id') id: string) {
    return this.service.get(id);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body(new Validate(requestPatchSchema)) b: z.infer<typeof requestPatchSchema>,
  ) {
    return this.service.update(id, b);
  }
  @Post(':id/notes') note(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
    @Body(new Validate(noteSchema)) b: { body: string },
  ) {
    return this.service.note(id, req.user.id, b.body);
  }
}
@Module({
  controllers: [PublicRequestsController, RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
