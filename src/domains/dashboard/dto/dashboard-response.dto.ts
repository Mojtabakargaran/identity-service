import { ApiProperty } from '@nestjs/swagger';

export class HospitalInfoDto {
  @ApiProperty({ description: 'Tenant unique identifier' })
  tenantId: string;

  @ApiProperty({ description: 'Hospital name' })
  hospitalName: string;

  @ApiProperty({ description: 'Hospital subdomain' })
  subdomain: string;

  @ApiProperty({ 
    description: 'Hospital preferred language',
    enum: ['en', 'fa']
  })
  preferredLanguage: 'en' | 'fa';
}

export class UserInfoDto {
  @ApiProperty({ description: 'User unique identifier' })
  userId: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ 
    description: 'User profile photo URL',
    required: false
  })
  profilePhotoUrl?: string | null;

  @ApiProperty({ 
    description: 'User role type',
    enum: ['owner', 'admin', 'staff']
  })
  roleType: 'owner' | 'admin' | 'staff';

  @ApiProperty({ description: 'Last login timestamp' })
  lastLoginAt: string;
}

export class SetupProgressDto {
  @ApiProperty({ description: 'Whether user profile is completed' })
  profileCompleted: boolean;

  @ApiProperty({ 
    description: 'Profile completion timestamp',
    required: false
  })
  profileCompletedAt?: string | null;

  @ApiProperty({ description: 'Whether institutional profile is completed' })
  institutionalProfileCompleted: boolean;

  @ApiProperty({ 
    description: 'Institutional profile completion timestamp',
    required: false
  })
  institutionalProfileCompletedAt?: string | null;

  @ApiProperty({ description: 'Whether operational parameters are configured' })
  operationalParametersConfigured: boolean;

  @ApiProperty({ 
    description: 'Operational parameters configuration timestamp',
    required: false
  })
  operationalParametersConfiguredAt?: string | null;
}

export class StatisticsDto {
  @ApiProperty({ description: 'Total number of beds' })
  totalBeds: number;

  @ApiProperty({ description: 'Total number of ICU beds' })
  icuBeds: number;

  @ApiProperty({ description: 'Total number of operating rooms' })
  operatingRooms: number;

  @ApiProperty({ description: 'Total number of emergency rooms' })
  emergencyRooms: number;

  @ApiProperty({ description: 'Total number of departments' })
  totalDepartments: number;

  @ApiProperty({ description: 'Total number of staff' })
  totalStaff: number;
}

export class OperationalInfoDto {
  @ApiProperty({ description: 'Hospital timezone' })
  timezone: string;

  @ApiProperty({ description: 'Default currency' })
  defaultCurrency: string;

  @ApiProperty({ description: 'Fiscal year start month (1-12)' })
  fiscalYearStartMonth: number;

  @ApiProperty({ 
    description: 'Hospital type',
    enum: ['general_hospital', 'specialty_hospital', 'teaching_hospital', 'research_hospital', 'community_hospital', 'private_clinic'],
    required: false
  })
  hospitalType?: string | null;

  @ApiProperty({ 
    description: 'Hospital establishment date',
    required: false
  })
  establishmentDate?: string | null;
}

export class UpcomingEventDto {
  @ApiProperty({ description: 'Holiday unique identifier' })
  holidayId: string;

  @ApiProperty({ description: 'Holiday date' })
  holidayDate: string;

  @ApiProperty({ description: 'Holiday name' })
  holidayName: string;

  @ApiProperty({ description: 'Holiday description' })
  description: string;
}

export class RecentActivityDto {
  @ApiProperty({ description: 'Audit log unique identifier' })
  auditLogId: string;

  @ApiProperty({ description: 'Action name' })
  actionName: string;

  @ApiProperty({ description: 'Action description' })
  description: string;

  @ApiProperty({ description: 'Entity type' })
  entityType: string;

  @ApiProperty({ description: 'Related entity identifier' })
  entityId: string;

  @ApiProperty({ description: 'Activity timestamp' })
  createdAt: string;
}

export class DashboardDataDto {
  @ApiProperty({ description: 'Hospital information' })
  hospitalInfo: HospitalInfoDto;

  @ApiProperty({ description: 'User information' })
  userInfo: UserInfoDto;

  @ApiProperty({ description: 'Setup progress information' })
  setupProgress: SetupProgressDto;

  @ApiProperty({ description: 'Hospital statistics' })
  statistics: StatisticsDto;

  @ApiProperty({ description: 'Operational information' })
  operationalInfo: OperationalInfoDto;

  @ApiProperty({ 
    description: 'Upcoming events and holidays',
    type: [UpcomingEventDto]
  })
  upcomingEvents: UpcomingEventDto[];

  @ApiProperty({ 
    description: 'Recent activity feed',
    type: [RecentActivityDto]
  })
  recentActivity: RecentActivityDto[];
}

export class DashboardResponseDto {
  @ApiProperty({ description: 'Response code', example: 'DASHBOARD_DATA_RETRIEVED' })
  code: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Dashboard data' })
  data: DashboardDataDto;
}