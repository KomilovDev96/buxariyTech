import { Body, Controller, Delete, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { solutionSchema, contentLocales, type BusinessSolution } from '@buhariy/contracts';
import { z } from 'zod';
import { PrismaService } from '../common/prisma';
import { Public, Roles } from '../auth/security';
import { Validate } from '../common/http';
const querySchema = z.object({ locale: z.enum(contentLocales).default('uz') }).strict();
@Controller('solutions')
@Public()
class PublicSolutionsController {
  constructor(private db: PrismaService) {}
  @Get() list(@Query(new Validate(querySchema)) query: z.infer<typeof querySchema>) {
    return this.db.businessSolution.findMany({
      where: { published: true, locale: query.locale },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { title: 'asc' }],
      take: 100,
    });
  }
}
@Controller('admin/solutions')
@Roles('ADMIN', 'EDITOR')
class SolutionsController {
  constructor(private db: PrismaService) {}
  @Get() list() {
    return this.db.businessSolution.findMany({
      orderBy: [{ order: 'asc' }, { locale: 'asc' }, { title: 'asc' }],
      take: 300,
    });
  }
  @Post() create(@Body(new Validate(solutionSchema)) data: Omit<BusinessSolution, 'id'>) {
    return this.db.businessSolution.create({ data });
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body(new Validate(solutionSchema)) data: Omit<BusinessSolution, 'id'>,
  ) {
    return this.db.businessSolution.update({ where: { id }, data });
  }
  @Delete(':id') remove(@Param('id') id: string) {
    return this.db.businessSolution.delete({ where: { id } });
  }
}
@Module({ controllers: [PublicSolutionsController, SolutionsController] })
export class SolutionsModule {}
