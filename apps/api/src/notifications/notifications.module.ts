import { Global, Injectable, Logger, Module } from '@nestjs/common';
@Injectable()
export class NotificationService {
  private logger = new Logger('Notifications');
  async newRequest(id: string) {
    this.logger.log({ event: 'request_received', requestId: id });
  }
}
@Global()
@Module({ providers: [NotificationService], exports: [NotificationService] })
export class NotificationsModule {}
