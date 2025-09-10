import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailVerificationToken } from '../../domains/auth/email-verification-token.entity';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailVerificationToken]),
    MessagingModule,
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
