import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionalProfileController } from './institutional-profile.controller';
import { InstitutionalProfileService } from './institutional-profile.service';
import { HospitalInstitutionalProfile } from './hospital-institutional-profile.entity';
import { MedicalDepartment } from './medical-department.entity';
import { HospitalDepartment } from './hospital-department.entity';
import { HospitalOperatingHours } from './hospital-operating-hours.entity';
import { Tenant } from '../tenant/tenant.entity';
import { User } from '../user/user.entity';
import { MessagingModule } from '../../infrastructure/messaging/messaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HospitalInstitutionalProfile,
      MedicalDepartment,
      HospitalDepartment,
      HospitalOperatingHours,
      Tenant,
      User
    ]),
    MessagingModule,
  ],
  controllers: [InstitutionalProfileController],
  providers: [InstitutionalProfileService],
  exports: [InstitutionalProfileService],
})
export class InstitutionalProfileModule {}