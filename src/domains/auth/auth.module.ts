import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { EmailVerificationToken } from './email-verification-token.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from '../../infrastructure/email/email.module';
import { MessagingModule } from '../../infrastructure/messaging/messaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerificationToken]),
    EmailModule,
    MessagingModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
