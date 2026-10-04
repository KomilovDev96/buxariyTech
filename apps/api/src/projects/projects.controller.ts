import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProjectInput, projectSchema, projectPatchSchema } from '@buhariy/contracts';
import { Public, Roles } from '../auth/security';
import { Validate, pagination } from '../common/http';
import { ProjectsService } from './projects.service';
@Controller('projects')
@Public()
export class ProjectsController {
  constructor(private service: ProjectsService) {}
  @Get() list(
    @Query('page') p?: string,
    @Query('limit') l?: string,
    @Query('category') c?: string,
  ) {
    const q = pagination(p, l);
    return this.service.list(q.page, q.take, q.skip, false, c);
  }
  @Get(':slug') get(@Param('slug') slug: string) {
    return this.service.get(slug);
  }
}
@Controller('admin/projects')
@Roles('ADMIN', 'EDITOR')
export class AdminProjectsController {
  constructor(private service: ProjectsService) {}
  @Get() list(@Query('page') p?: string, @Query('limit') l?: string) {
    const q = pagination(p, l);
    return this.service.list(q.page, q.take, q.skip, true);
  }
  @Get(':id') get(@Param('id') id: string) {
    return this.service.getAdmin(id);
  }
  @Post() create(@Body(new Validate(projectSchema)) b: ProjectInput) {
    return this.service.create(b);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body(new Validate(projectPatchSchema)) b: Partial<ProjectInput>,
  ) {
    return this.service.update(id, b);
  }
  @Delete(':id') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
