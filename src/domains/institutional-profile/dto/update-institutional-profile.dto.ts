import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsDateString, IsString, IsOptional, IsArray, IsUrl, Min, Max, ValidateNested, ArrayMinSize, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { HospitalType, AccreditationStatus, EmergencyServicesAvailability } from '../hospital-institutional-profile.entity';
import { DayOfWeek } from '../hospital-operating-hours.entity';

export class WeeklyOperatingHoursDto {
  @ApiProperty({ description: 'Day of the week', enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Opening time in HH:MM format', example: '08:00', required: false })
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Start time must be in HH:MM format' })
  startTime?: string;

  @ApiProperty({ description: 'Closing time in HH:MM format', example: '18:00', required: false })
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'End time must be in HH:MM format' })
  endTime?: string;

  @ApiProperty({ description: 'Whether hospital is closed on this day', default: false })
  @IsOptional()
  isClosed?: boolean;
}

export class UpdateInstitutionalProfileDto {
  @ApiProperty({ description: 'Hospital type', enum: HospitalType })
  @IsEnum(HospitalType)
  hospitalType: HospitalType;

  @ApiProperty({ description: 'Total number of beds', minimum: 1, maximum: 10000 })
  @IsInt()
  @Min(1, { message: 'Total beds must be at least 1' })
  @Max(10000, { message: 'Total beds cannot exceed 10,000' })
  totalBeds: number;

  @ApiProperty({ description: 'Number of ICU beds', minimum: 0 })
  @IsInt()
  @Min(0, { message: 'ICU beds cannot be negative' })
  icuBeds: number;

  @ApiProperty({ description: 'Number of operating rooms', minimum: 0 })
  @IsInt()
  @Min(0, { message: 'Operating rooms cannot be negative' })
  operatingRooms: number;

  @ApiProperty({ description: 'Number of emergency rooms', minimum: 0 })
  @IsInt()
  @Min(0, { message: 'Emergency rooms cannot be negative' })
  emergencyRooms: number;

  @ApiProperty({ description: 'Hospital establishment date', example: '1990-01-15' })
  @IsDateString({}, { message: 'Please enter a valid establishment date' })
  establishmentDate: string;

  @ApiProperty({ description: 'Accreditation status', enum: AccreditationStatus })
  @IsEnum(AccreditationStatus)
  accreditationStatus: AccreditationStatus;

  @ApiProperty({ description: 'Accreditation body name', required: false })
  @IsOptional()
  @IsString()
  accreditationBody?: string;

  @ApiProperty({ description: 'Accreditation expiry date', example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Please enter a valid accreditation expiry date' })
  accreditationExpiryDate?: string;

  @ApiProperty({ description: 'General operating start time', example: '08:00' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'General operating start time must be in HH:MM format' })
  generalOperatingStartTime: string;

  @ApiProperty({ description: 'General operating end time', example: '18:00' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'General operating end time must be in HH:MM format' })
  generalOperatingEndTime: string;

  @ApiProperty({ description: 'Emergency services availability', enum: EmergencyServicesAvailability })
  @IsEnum(EmergencyServicesAvailability)
  emergencyServicesAvailability: EmergencyServicesAvailability;

  @ApiProperty({ description: 'Hospital mission statement', required: false })
  @IsOptional()
  @IsString()
  missionStatement?: string;

  @ApiProperty({ description: 'Hospital vision statement', required: false })
  @IsOptional()
  @IsString()
  visionStatement?: string;

  @ApiProperty({ description: 'Hospital values statement', required: false })
  @IsOptional()
  @IsString()
  valuesStatement?: string;

  @ApiProperty({ description: 'Hospital website URL', example: 'https://hospital.com', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'Please enter a valid website URL' })
  websiteUrl?: string;

  @ApiProperty({ description: 'Selected medical department IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Please select at least one medical department' })
  @IsString({ each: true })
  selectedDepartmentIds: string[];

  @ApiProperty({ description: 'Weekly operating hours', type: [WeeklyOperatingHoursDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyOperatingHoursDto)
  weeklyOperatingHours: WeeklyOperatingHoursDto[];
}