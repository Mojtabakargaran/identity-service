import { ApiProperty } from '@nestjs/swagger';
import { HospitalType, AccreditationStatus, EmergencyServicesAvailability } from '../hospital-institutional-profile.entity';
import { DayOfWeek } from '../hospital-operating-hours.entity';

export class InstitutionalProfileDepartmentDto {
  @ApiProperty({ description: 'Department unique identifier' })
  departmentId: string;

  @ApiProperty({ description: 'Department name in English' })
  departmentNameEn: string;

  @ApiProperty({ description: 'Department name in Farsi' })
  departmentNameFa: string;
}

export class InstitutionalProfileOperatingHoursDto {
  @ApiProperty({ description: 'Operating hours unique identifier', required: false })
  operatingHoursId?: string;

  @ApiProperty({ description: 'Day of the week', enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Opening time in HH:MM format', required: false })
  startTime?: string | null;

  @ApiProperty({ description: 'Closing time in HH:MM format', required: false })
  endTime?: string | null;

  @ApiProperty({ description: 'Whether hospital is closed on this day' })
  isClosed: boolean;
}

export class InstitutionalProfileHospitalInfoDto {
  @ApiProperty({ description: 'Hospital type', enum: HospitalType, required: false })
  hospitalType?: HospitalType | null;

  @ApiProperty({ description: 'Total number of beds', required: false })
  totalBeds?: number | null;

  @ApiProperty({ description: 'Number of ICU beds', required: false })
  icuBeds?: number | null;

  @ApiProperty({ description: 'Number of operating rooms', required: false })
  operatingRooms?: number | null;

  @ApiProperty({ description: 'Number of emergency rooms', required: false })
  emergencyRooms?: number | null;

  @ApiProperty({ description: 'Hospital establishment date in YYYY-MM-DD format', required: false })
  establishmentDate?: string | null;

  @ApiProperty({ description: 'Hospital website URL', required: false })
  websiteUrl?: string | null;
}

export class InstitutionalProfileAccreditationDto {
  @ApiProperty({ description: 'Accreditation status', enum: AccreditationStatus, required: false })
  accreditationStatus?: AccreditationStatus | null;

  @ApiProperty({ description: 'Accreditation body name', required: false })
  accreditationBody?: string | null;

  @ApiProperty({ description: 'Accreditation expiry date in YYYY-MM-DD format', required: false })
  accreditationExpiryDate?: string | null;
}

export class InstitutionalProfileOperatingScheduleDto {
  @ApiProperty({ description: 'General operating start time in HH:MM format', required: false })
  generalOperatingStartTime?: string | null;

  @ApiProperty({ description: 'General operating end time in HH:MM format', required: false })
  generalOperatingEndTime?: string | null;

  @ApiProperty({ description: 'Emergency services availability', enum: EmergencyServicesAvailability, required: false })
  emergencyServicesAvailability?: EmergencyServicesAvailability | null;

  @ApiProperty({ description: 'Weekly operating hours', type: [InstitutionalProfileOperatingHoursDto] })
  weeklyHours: InstitutionalProfileOperatingHoursDto[];
}

export class InstitutionalProfileStatementsDto {
  @ApiProperty({ description: 'Hospital mission statement', required: false })
  missionStatement?: string | null;

  @ApiProperty({ description: 'Hospital vision statement', required: false })
  visionStatement?: string | null;

  @ApiProperty({ description: 'Hospital values statement', required: false })
  valuesStatement?: string | null;
}

export class InstitutionalProfileDataDto {
  @ApiProperty({ description: 'Profile unique identifier', required: false })
  profileId?: string | null;

  @ApiProperty({ description: 'Tenant unique identifier' })
  tenantId: string;

  @ApiProperty({ description: 'Whether profile is completed' })
  profileCompleted: boolean;

  @ApiProperty({ description: 'Profile completion timestamp', required: false })
  profileCompletedAt?: string | null;

  @ApiProperty({ description: 'Hospital information' })
  hospitalInfo: InstitutionalProfileHospitalInfoDto;

  @ApiProperty({ description: 'Accreditation information' })
  accreditation: InstitutionalProfileAccreditationDto;

  @ApiProperty({ description: 'Operating schedule information' })
  operatingSchedule: InstitutionalProfileOperatingScheduleDto;

  @ApiProperty({ description: 'Hospital statements' })
  statements: InstitutionalProfileStatementsDto;

  @ApiProperty({ description: 'Selected medical departments', type: [InstitutionalProfileDepartmentDto] })
  selectedDepartments: InstitutionalProfileDepartmentDto[];
}

export class InstitutionalProfileResponseDto {
  @ApiProperty({ description: 'Response code', example: 'INSTITUTIONAL_PROFILE_RETRIEVED' })
  code: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Institutional profile data' })
  data: InstitutionalProfileDataDto;
}