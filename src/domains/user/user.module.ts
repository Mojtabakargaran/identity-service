import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Tenant } from '../tenant/tenant.entity';
import { MessagingModule } from '../../infrastructure/messaging/messaging.module';
import { SessionAuthGuard } from '../../shared/guards/session-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant]),
    MessagingModule,
  ],
  controllers: [UserController],
  providers: [UserService, SessionAuthGuard],
  exports: [UserService],
})
export class UserModule {}