import { Body, Controller, Delete, Get, Module, Param, Patch, Post } from '@nestjs/common';
import { serviceSchema } from '@buhariy/contracts';
import { z } from 'zod';
import { Public, Roles } from '../auth/security';
import { Validate } from '../common/http';
import { ServicesService } from './services.service';
@Controller('services')
@Public()
export class PublicServicesController {
  constructor(private service: ServicesService) {}
  @Get() list() {
    return this.service.list(true);
  }
  @Get(':slug') get(@Param('slug') slug: string) {
    return this.service.getPublic(slug);
  }
}

@Controller('admin/services')
@Roles('ADMIN', 'EDITOR')
export class ServicesController {
  constructor(private service: ServicesService) {}
  @Get() list() {
    return this.service.list();
  }
  @Post() create(@Body(new Validate(serviceSchema)) b: z.infer<typeof serviceSchema>) {
    return this.service.create(b);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body(new Validate(serviceSchema)) b: z.infer<typeof serviceSchema>,
  ) {
    return this.service.update(id, b);
  }
  @Delete(':id') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
@Module({
  controllers: [ServicesController, PublicServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
