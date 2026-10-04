import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController, AdminProjectsController } from './projects.controller';
@Module({
  controllers: [ProjectsController, AdminProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
