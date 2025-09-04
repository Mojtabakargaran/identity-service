import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './tenant.entity';
import { User } from '../user/user.entity';
import { UserRole } from '../user/user-role.entity';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { EmailModule } from '../../infrastructure/email/email.module';
import { MessagingModule } from '../../infrastructure/messaging/messaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, User, UserRole]),
    EmailModule,
    MessagingModule,
  ],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
