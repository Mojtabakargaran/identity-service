import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsUUID, IsDateString, IsIn, Min, Max } from 'class-validator';

export class BasicSettingsDto {
  @IsString()
  timezone: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  fiscalYearStartMonth: number;

  @IsString()
  defaultCurrency: string;
}

export class AppointmentSettingsDto {
  @IsNumber()
  @Min(5)
  @Max(480)
  standardConsultationDurationMinutes: number;

  @IsNumber()
  @Min(5)
  @Max(240)
  standardAppointmentSlotDurationMinutes: number;

  @IsNumber()
  @Min(1)
  @Max(365)
  advanceBookingLimitDays: number;

  @IsNumber()
  @Min(1)
  @Max(168)
  cancellationDeadlineHours: number;

  @IsNumber()
  @Min(1)
  @Max(168)
  appointmentReminderTimingHours: number;
}

export class ScheduleSettingsDto {
  @IsOptional()
  @IsString()
  lunchBreakStartTime?: string;

  @IsOptional()
  @IsString()
  lunchBreakEndTime?: string;

  @IsNumber()
  @Min(5)
  @Max(120)
  patientCheckinWindowMinutes: number;

  @IsNumber()
  @Min(1)
  @Max(60)
  patientLateArrivalGracePeriodMinutes: number;
}

export class AlertSettingsDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  bedOccupancyAlertThresholdPercentage: number;

  @IsNumber()
  @Min(1)
  inventoryLowStockAlertThreshold: number;
}

export class EmergencySettingsDto {
  @IsOptional()
  @IsString()
  emergencyEvacuationProcedures?: string;
}

export class HolidayDto {
  @IsOptional()
  @IsUUID()
  holidayId?: string;

  @IsDateString()
  holidayDate: string;

  @IsString()
  holidayName: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class VacationPeriodDto {
  @IsOptional()
  @IsUUID()
  vacationPeriodId?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class VisitorHoursDto {
  @IsOptional()
  @IsUUID()
  visitorHoursId?: string;

  @IsString()
  areaType: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}

export class StaffRatioDto {
  @IsOptional()
  @IsUUID()
  staffRatioId?: string;

  @IsUUID()
  departmentId: string;

  @IsNumber()
  @Min(1)
  staffCount: number;

  @IsNumber()
  @Min(1)
  patientCount: number;
}

export class SaveOperationalParametersDto {
  @ValidateNested()
  @Type(() => BasicSettingsDto)
  basicSettings: BasicSettingsDto;

  @ValidateNested()
  @Type(() => AppointmentSettingsDto)
  appointmentSettings: AppointmentSettingsDto;

  @ValidateNested()
  @Type(() => ScheduleSettingsDto)
  scheduleSettings: ScheduleSettingsDto;

  @ValidateNested()
  @Type(() => AlertSettingsDto)
  alertSettings: AlertSettingsDto;

  @ValidateNested()
  @Type(() => EmergencySettingsDto)
  emergencySettings: EmergencySettingsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HolidayDto)
  holidays: HolidayDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VacationPeriodDto)
  vacationPeriods: VacationPeriodDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisitorHoursDto)
  visitorHours: VisitorHoursDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StaffRatioDto)
  staffRatios: StaffRatioDto[];
}