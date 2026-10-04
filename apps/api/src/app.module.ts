import { SolutionsModule } from './solutions/solutions.module';
import { SiteBlocksModule } from './site-blocks/site-blocks.module';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './common/prisma';
import { AuditInterceptor } from './common/http';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/security';
import { ProjectsModule } from './projects/projects.module';
import { ImagesModule } from './project-images/images.controller';
import { StorageModule } from './media/storage.service';
import { ServicesModule } from './services/services.module';
import { TeamModule } from './team/team.module';
import { CategoriesModule } from './categories/categories.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { RequestsModule } from './requests/requests.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';
@Module({
  imports: [
    DatabaseModule,
    StorageModule,
    NotificationsModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    AuthModule,
    ProjectsModule,
    ImagesModule,
    ServicesModule,
    TeamModule,
    CategoriesModule,
    TechnologiesModule,
    RequestsModule,
    UsersModule,
    SettingsModule,
    SiteBlocksModule,
    SolutionsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
