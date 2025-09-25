export class HolidayResponseDto {
  holidayId: string;
  holidayDate: string;
  holidayName: string;
  description?: string | null;
}

export class VacationPeriodResponseDto {
  vacationPeriodId: string;
  startDate: string;
  endDate: string;
  description?: string | null;
}

export class VisitorHoursResponseDto {
  visitorHoursId: string;
  areaType: string;
  startTime: string;
  endTime: string;
}

export class StaffRatioResponseDto {
  staffRatioId: string;
  departmentId: string;
  departmentNameEn: string;
  departmentNameFa: string;
  staffCount: number;
  patientCount: number;
}

export class BasicSettingsResponseDto {
  timezone?: string | null;
  fiscalYearStartMonth?: number | null;
  defaultCurrency?: string | null;
}

export class AppointmentSettingsResponseDto {
  standardConsultationDurationMinutes?: number | null;
  standardAppointmentSlotDurationMinutes?: number | null;
  advanceBookingLimitDays?: number | null;
  cancellationDeadlineHours?: number | null;
  appointmentReminderTimingHours?: number | null;
}

export class ScheduleSettingsResponseDto {
  lunchBreakStartTime?: string | null;
  lunchBreakEndTime?: string | null;
  patientCheckinWindowMinutes?: number | null;
  patientLateArrivalGracePeriodMinutes?: number | null;
}

export class AlertSettingsResponseDto {
  bedOccupancyAlertThresholdPercentage?: number | null;
  inventoryLowStockAlertThreshold?: number | null;
}

export class EmergencySettingsResponseDto {
  emergencyEvacuationProcedures?: string | null;
}

export class OperationalParametersDataDto {
  operationalParametersId?: string | null;
  tenantId: string;
  basicSettings: BasicSettingsResponseDto;
  appointmentSettings: AppointmentSettingsResponseDto;
  scheduleSettings: ScheduleSettingsResponseDto;
  alertSettings: AlertSettingsResponseDto;
  emergencySettings: EmergencySettingsResponseDto;
  holidays: HolidayResponseDto[];
  vacationPeriods: VacationPeriodResponseDto[];
  visitorHours: VisitorHoursResponseDto[];
  staffRatios: StaffRatioResponseDto[];
}

export class GetOperationalParametersResponseDto {
  code: string;
  message: string;
  data: OperationalParametersDataDto;
}

export class SaveOperationalParametersDataDto {
  operationalParametersId: string;
  tenantId: string;
  savedAt: string;
}

export class SaveOperationalParametersResponseDto {
  code: string;
  message: string;
  data: SaveOperationalParametersDataDto;
}