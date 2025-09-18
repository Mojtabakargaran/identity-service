import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { EmailVerificationToken } from './email-verification-token.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { PasswordResetRateLimit } from './password-reset-rate-limit.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { EmailModule } from '../../infrastructure/email/email.module';
import { MessagingModule } from '../../infrastructure/messaging/messaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerificationToken, PasswordResetToken, PasswordResetRateLimit]),
    EmailModule,
    MessagingModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordResetService],
  exports: [AuthService, PasswordResetService],
})
export class AuthModule {}
