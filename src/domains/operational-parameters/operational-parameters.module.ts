import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationalParametersController } from './operational-parameters.controller';
import { OperationalParametersService } from './operational-parameters.service';
import {
  HospitalOperationalParameters,
  HospitalHoliday,
  HospitalVacationPeriod,
  HospitalVisitorHours,
  HospitalStaffRatio,
} from './entities';
import { MedicalDepartment } from '../institutional-profile/medical-department.entity';
import { User } from '../user/user.entity';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HospitalOperationalParameters,
      HospitalHoliday,
      HospitalVacationPeriod,
      HospitalVisitorHours,
      HospitalStaffRatio,
      MedicalDepartment,
      User, // Added User entity for SessionAuthGuard dependency injection
    ]),
    UserModule,
  ],
  controllers: [OperationalParametersController],
  providers: [OperationalParametersService, MessagingService],
  exports: [OperationalParametersService],
})
export class OperationalParametersModule {}