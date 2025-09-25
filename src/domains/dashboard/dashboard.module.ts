import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Tenant } from '../tenant/tenant.entity';
import { User } from '../user/user.entity';
import { UserRole } from '../user/user-role.entity';
import { UserDashboardPreferences } from '../user/user-dashboard-preferences.entity';
import { HospitalInstitutionalProfile } from '../institutional-profile/hospital-institutional-profile.entity';
import { HospitalDepartment } from '../institutional-profile/hospital-department.entity';
import { HospitalOperationalParameters, HospitalHoliday } from '../operational-parameters/entities';
import { MessagingModule } from '../../infrastructure/messaging/messaging.module';
import { SessionAuthGuard } from '../../shared/guards/session-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      User,
      UserRole,
      UserDashboardPreferences,
      HospitalInstitutionalProfile,
      HospitalDepartment,
      HospitalOperationalParameters,
      HospitalHoliday,
    ]),
    MessagingModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, SessionAuthGuard],
  exports: [DashboardService],
})
export class DashboardModule {}