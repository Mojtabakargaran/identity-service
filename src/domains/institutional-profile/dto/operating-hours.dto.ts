import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '../hospital-operating-hours.entity';

export class UpdateOperatingHoursItemDto {
  @ApiProperty({ description: 'Day of the week', enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Opening time in HH:MM format', example: '08:00', required: false })
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Start time must be in HH:MM format' })
  startTime?: string | null;

  @ApiProperty({ description: 'Closing time in HH:MM format', example: '18:00', required: false })
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'End time must be in HH:MM format' })
  endTime?: string | null;

  @ApiProperty({ description: 'Whether hospital is closed on this day', default: false })
  @IsOptional()
  isClosed?: boolean;
}

export class UpdateOperatingHoursDto {
  @ApiProperty({ description: 'General operating start time', example: '08:00' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'General operating start time must be in HH:MM format' })
  generalOperatingStartTime: string;

  @ApiProperty({ description: 'General operating end time', example: '18:00' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'General operating end time must be in HH:MM format' })
  generalOperatingEndTime: string;

  @ApiProperty({ description: 'Emergency services availability', enum: ['24_7', 'limited_hours', 'not_available'] })
  emergencyServicesAvailability: '24_7' | 'limited_hours' | 'not_available';

  @ApiProperty({ description: 'Weekly operating hours', type: [UpdateOperatingHoursItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOperatingHoursItemDto)
  weeklyOperatingHours: UpdateOperatingHoursItemDto[];
}

export class OperatingHoursItemDto {
  @ApiProperty({ description: 'Operating hours unique identifier' })
  operatingHoursId: string;

  @ApiProperty({ description: 'Day of the week', enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Opening time in HH:MM format', example: '08:00', required: false })
  startTime?: string | null;

  @ApiProperty({ description: 'Closing time in HH:MM format', example: '18:00', required: false })
  endTime?: string | null;

  @ApiProperty({ description: 'Whether hospital is closed on this day', default: false })
  isClosed: boolean;
}

export class OperatingHoursResponseDto {
  @ApiProperty({ description: 'Response code', example: 'OPERATING_HOURS_RETRIEVED' })
  code: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Operating hours data' })
  data: {
    tenantId: string;
    generalOperatingStartTime: string;
    generalOperatingEndTime: string;
    emergencyServicesAvailability: '24_7' | 'limited_hours' | 'not_available';
    weeklyHours: OperatingHoursItemDto[];
  };
}

export class OperatingHoursUpdateResponseDto {
  @ApiProperty({ description: 'Response code', example: 'OPERATING_HOURS_UPDATED' })
  code: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Update confirmation data' })
  data: {
    tenantId: string;
    updatedAt: string;
  };
}