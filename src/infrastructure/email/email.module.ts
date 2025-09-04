import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [MessagingModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
