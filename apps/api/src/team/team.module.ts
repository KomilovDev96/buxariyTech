import { Body, Controller, Delete, Get, Module, Param, Patch, Post } from '@nestjs/common';
import { teamSchema } from '@buhariy/contracts';
import { z } from 'zod';
import { Public, Roles } from '../auth/security';
import { Validate } from '../common/http';
import { TeamService } from './team.service';
@Controller('team')
@Public()
export class PublicTeamController {
  constructor(private service: TeamService) {}
  @Get() list() {
    return this.service.list(true);
  }
}

@Controller('admin/team')
@Roles('ADMIN', 'EDITOR')
export class TeamController {
  constructor(private service: TeamService) {}
  @Get() list() {
    return this.service.list();
  }
  @Post() create(@Body(new Validate(teamSchema)) b: z.infer<typeof teamSchema>) {
    return this.service.create(b);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body(new Validate(teamSchema)) b: z.infer<typeof teamSchema>,
  ) {
    return this.service.update(id, b);
  }
  @Delete(':id') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
@Module({ controllers: [TeamController, PublicTeamController], providers: [TeamService] })
export class TeamModule {}
