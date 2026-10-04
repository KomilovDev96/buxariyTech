import { Body, Controller, Delete, Get, Module, Param, Patch, Post } from '@nestjs/common';
import { taxonomySchema } from '@buhariy/contracts';
import { z } from 'zod';
import { Public, Roles } from '../auth/security';
import { Validate } from '../common/http';
import { TechnologiesService } from './technologies.service';

@Controller('admin/technologies')
@Roles('ADMIN', 'EDITOR')
export class TechnologiesController {
  constructor(private service: TechnologiesService) {}
  @Get() list() {
    return this.service.list();
  }
  @Post() create(@Body(new Validate(taxonomySchema)) b: z.infer<typeof taxonomySchema>) {
    return this.service.create(b);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body(new Validate(taxonomySchema)) b: z.infer<typeof taxonomySchema>,
  ) {
    return this.service.update(id, b);
  }
  @Delete(':id') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
@Module({ controllers: [TechnologiesController], providers: [TechnologiesService] })
export class TechnologiesModule {}
