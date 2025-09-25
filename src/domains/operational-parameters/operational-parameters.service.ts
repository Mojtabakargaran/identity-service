import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { 
  HospitalOperationalParameters,
  HospitalHoliday,
  HospitalVacationPeriod,
  HospitalVisitorHours,
  HospitalStaffRatio 
} from './entities';
import { MedicalDepartment } from '../institutional-profile/medical-department.entity';
import { SaveOperationalParametersDto, GetOperationalParametersResponseDto, SaveOperationalParametersResponseDto } from './dto';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';
import * as crypto from 'crypto';

interface ValidationError {
  code: string;
  message: string;
}

@Injectable()
export class OperationalParametersService {
  constructor(
    @InjectRepository(HospitalOperationalParameters)
    private operationalParametersRepository: Repository<HospitalOperationalParameters>,
    @InjectRepository(HospitalHoliday)
    private holidayRepository: Repository<HospitalHoliday>,
    @InjectRepository(HospitalVacationPeriod)
    private vacationPeriodRepository: Repository<HospitalVacationPeriod>,
    @InjectRepository(HospitalVisitorHours)
    private visitorHoursRepository: Repository<HospitalVisitorHours>,
    @InjectRepository(HospitalStaffRatio)
    private staffRatioRepository: Repository<HospitalStaffRatio>,
    @InjectRepository(MedicalDepartment)
    private medicalDepartmentRepository: Repository<MedicalDepartment>,
    private dataSource: DataSource,
    private messagingService: MessagingService,
  ) {}

  async getOperationalParameters(tenantId: string, userId: string): Promise<GetOperationalParametersResponseDto> {
    try {
      // Publish configuration started event
      await this.publishConfigurationStartedEvent(tenantId, userId);

      const operationalParams = await this.operationalParametersRepository.findOne({
        where: { tenantId },
      });

      const holidays = await this.holidayRepository.find({
        where: { tenantId },
        order: { holidayDate: 'ASC' },
      });

      const vacationPeriods = await this.vacationPeriodRepository.find({
        where: { tenantId },
        order: { startDate: 'ASC' },
      });

      const visitorHours = await this.visitorHoursRepository.find({
        where: { tenantId },
        order: { areaType: 'ASC' },
      });

      const staffRatios = await this.staffRatioRepository.find({
        where: { tenantId },
        relations: ['department'],
        order: { department: { departmentNameEn: 'ASC' } },
      });

      return {
        code: 'OPERATIONAL_PARAMETERS_RETRIEVED',
        message: 'Operational parameters retrieved successfully',
        data: {
          operationalParametersId: operationalParams?.operationalParametersId || null,
          tenantId,
          basicSettings: {
            timezone: operationalParams?.timezone || null,
            fiscalYearStartMonth: operationalParams?.fiscalYearStartMonth || null,
            defaultCurrency: operationalParams?.defaultCurrency || null,
          },
          appointmentSettings: {
            standardConsultationDurationMinutes: operationalParams?.standardConsultationDurationMinutes || null,
            standardAppointmentSlotDurationMinutes: operationalParams?.standardAppointmentSlotDurationMinutes || null,
            advanceBookingLimitDays: operationalParams?.advanceBookingLimitDays || null,
            cancellationDeadlineHours: operationalParams?.cancellationDeadlineHours || null,
            appointmentReminderTimingHours: operationalParams?.appointmentReminderTimingHours || null,
          },
          scheduleSettings: {
            lunchBreakStartTime: operationalParams?.lunchBreakStartTime || null,
            lunchBreakEndTime: operationalParams?.lunchBreakEndTime || null,
            patientCheckinWindowMinutes: operationalParams?.patientCheckinWindowMinutes || null,
            patientLateArrivalGracePeriodMinutes: operationalParams?.patientLateArrivalGracePeriodMinutes || null,
          },
          alertSettings: {
            bedOccupancyAlertThresholdPercentage: operationalParams?.bedOccupancyAlertThresholdPercentage || null,
            inventoryLowStockAlertThreshold: operationalParams?.inventoryLowStockAlertThreshold || null,
          },
          emergencySettings: {
            emergencyEvacuationProcedures: operationalParams?.emergencyEvacuationProcedures || null,
          },
          holidays: holidays.map(holiday => ({
            holidayId: holiday.holidayId,
            holidayDate: holiday.holidayDate,
            holidayName: holiday.holidayName,
            description: holiday.description,
          })),
          vacationPeriods: vacationPeriods.map(period => ({
            vacationPeriodId: period.vacationPeriodId,
            startDate: period.startDate,
            endDate: period.endDate,
            description: period.description,
          })),
          visitorHours: visitorHours.map(hours => ({
            visitorHoursId: hours.visitorHoursId,
            areaType: hours.areaType,
            startTime: hours.startTime,
            endTime: hours.endTime,
          })),
          staffRatios: staffRatios.map(ratio => ({
            staffRatioId: ratio.staffRatioId,
            departmentId: ratio.departmentId,
            departmentNameEn: ratio.department.departmentNameEn,
            departmentNameFa: ratio.department.departmentNameFa,
            staffCount: ratio.staffCount,
            patientCount: ratio.patientCount,
          })),
        },
      };
    } catch (error) {
      throw new BadRequestException({
        code: 'DATABASE_ERROR',
        message: 'System error occurred while retrieving operational parameters',
      });
    }
  }

  async saveOperationalParameters(
    tenantId: string,
    userId: string,
    dto: SaveOperationalParametersDto,
  ): Promise<SaveOperationalParametersResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate business rules
      await this.validateOperationalParameters(dto, tenantId);

      // Save or update operational parameters
      const savedParams = await this.saveMainParameters(tenantId, dto, queryRunner);

      // Save related entities
      await this.saveHolidays(tenantId, dto.holidays, queryRunner);
      await this.saveVacationPeriods(tenantId, dto.vacationPeriods, queryRunner);
      await this.saveVisitorHours(tenantId, dto.visitorHours, queryRunner);
      await this.saveStaffRatios(tenantId, dto.staffRatios, queryRunner);

      await queryRunner.commitTransaction();

      // Publish success event
      await this.publishConfigurationSuccessEvent(tenantId, userId, savedParams, dto);

      return {
        code: 'OPERATIONAL_PARAMETERS_SAVED',
        message: 'Operational parameters saved successfully',
        data: {
          operationalParametersId: savedParams.operationalParametersId,
          tenantId,
          savedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      // Publish failure event
      await this.publishConfigurationFailureEvent(tenantId, userId, error);
      
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async validateOperationalParameters(dto: SaveOperationalParametersDto, tenantId: string): Promise<void> {
    const errors: ValidationError[] = [];

    // Validate lunch break times
    if (dto.scheduleSettings.lunchBreakStartTime && dto.scheduleSettings.lunchBreakEndTime) {
      if (dto.scheduleSettings.lunchBreakStartTime >= dto.scheduleSettings.lunchBreakEndTime) {
        errors.push({ code: 'INVALID_LUNCH_BREAK', message: 'Lunch break end time must be after start time' });
      }
    }

    // Validate vacation periods
    for (const vacation of dto.vacationPeriods) {
      if (vacation.startDate >= vacation.endDate) {
        errors.push({ code: 'INVALID_DATE_RANGE', message: 'Vacation end date must be after start date' });
      }
    }

    // Check for overlapping vacation periods
    for (let i = 0; i < dto.vacationPeriods.length; i++) {
      for (let j = i + 1; j < dto.vacationPeriods.length; j++) {
        if (this.isOverlapping(dto.vacationPeriods[i], dto.vacationPeriods[j])) {
          errors.push({ code: 'OVERLAPPING_VACATION', message: 'Vacation periods cannot overlap' });
        }
      }
    }

    // Validate visitor hours
    for (const visitorHour of dto.visitorHours) {
      if (visitorHour.startTime >= visitorHour.endTime) {
        errors.push({ code: 'INVALID_VISITOR_HOURS', message: 'Visitor end time must be after start time' });
      }
    }

    // Check for duplicate holidays
    const holidayDates = dto.holidays.map(h => h.holidayDate);
    const duplicateHolidays = holidayDates.filter((date, index) => holidayDates.indexOf(date) !== index);
    if (duplicateHolidays.length > 0) {
      errors.push({ code: 'DUPLICATE_HOLIDAY', message: 'Holiday already exists for the selected date' });
    }

    // Check for duplicate area types in visitor hours
    const areaTypes = dto.visitorHours.map(v => v.areaType);
    const duplicateAreaTypes = areaTypes.filter((type, index) => areaTypes.indexOf(type) !== index);
    if (duplicateAreaTypes.length > 0) {
      errors.push({ code: 'DUPLICATE_AREA_TYPE', message: 'Visitor hours already configured for this area type' });
    }

    // Check for duplicate departments in staff ratios
    const departmentIds = dto.staffRatios.map(s => s.departmentId);
    const duplicateDepartments = departmentIds.filter((id, index) => departmentIds.indexOf(id) !== index);
    if (duplicateDepartments.length > 0) {
      errors.push({ code: 'DUPLICATE_DEPARTMENT_RATIO', message: 'Staff ratio already configured for this department' });
    }

    // Validate departments exist
    const uniqueDepartmentIds = [...new Set(departmentIds)];
    if (uniqueDepartmentIds.length > 0) {
      const existingDepartments = await this.medicalDepartmentRepository.find({
        where: { departmentId: In(uniqueDepartmentIds) },
      });
      if (existingDepartments.length !== uniqueDepartmentIds.length) {
        errors.push({ code: 'DEPARTMENT_NOT_FOUND', message: 'One or more departments not found' });
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: errors[0].code,
        message: errors[0].message,
        validationErrors: errors,
      });
    }
  }

  private isOverlapping(period1: any, period2: any): boolean {
    return period1.startDate <= period2.endDate && period2.startDate <= period1.endDate;
  }

  private async saveMainParameters(
    tenantId: string,
    dto: SaveOperationalParametersDto,
    queryRunner: any,
  ): Promise<HospitalOperationalParameters> {
    let operationalParams = await this.operationalParametersRepository.findOne({
      where: { tenantId },
    });

    if (!operationalParams) {
      operationalParams = this.operationalParametersRepository.create({ tenantId });
    }

    // Update all fields
    operationalParams.timezone = dto.basicSettings.timezone;
    operationalParams.fiscalYearStartMonth = dto.basicSettings.fiscalYearStartMonth;
    operationalParams.defaultCurrency = dto.basicSettings.defaultCurrency;
    operationalParams.standardConsultationDurationMinutes = dto.appointmentSettings.standardConsultationDurationMinutes;
    operationalParams.standardAppointmentSlotDurationMinutes = dto.appointmentSettings.standardAppointmentSlotDurationMinutes;
    operationalParams.advanceBookingLimitDays = dto.appointmentSettings.advanceBookingLimitDays;
    operationalParams.cancellationDeadlineHours = dto.appointmentSettings.cancellationDeadlineHours;
    operationalParams.appointmentReminderTimingHours = dto.appointmentSettings.appointmentReminderTimingHours;
    operationalParams.lunchBreakStartTime = dto.scheduleSettings.lunchBreakStartTime || null;
    operationalParams.lunchBreakEndTime = dto.scheduleSettings.lunchBreakEndTime || null;
    operationalParams.patientCheckinWindowMinutes = dto.scheduleSettings.patientCheckinWindowMinutes;
    operationalParams.patientLateArrivalGracePeriodMinutes = dto.scheduleSettings.patientLateArrivalGracePeriodMinutes;
    operationalParams.bedOccupancyAlertThresholdPercentage = dto.alertSettings.bedOccupancyAlertThresholdPercentage;
    operationalParams.inventoryLowStockAlertThreshold = dto.alertSettings.inventoryLowStockAlertThreshold;
    operationalParams.emergencyEvacuationProcedures = dto.emergencySettings.emergencyEvacuationProcedures || null;

    return await queryRunner.manager.save(HospitalOperationalParameters, operationalParams);
  }

  private async saveHolidays(tenantId: string, holidays: any[], queryRunner: any): Promise<void> {
    // Remove existing holidays not in the new list
    const existingHolidays = await queryRunner.manager.find(HospitalHoliday, { where: { tenantId } });
    const newHolidayIds = holidays.filter(h => h.holidayId).map(h => h.holidayId);
    
    for (const existing of existingHolidays) {
      if (!newHolidayIds.includes(existing.holidayId)) {
        await queryRunner.manager.remove(HospitalHoliday, existing);
      }
    }

    // Save or update holidays
    for (const holidayDto of holidays) {
      let holiday;
      if (holidayDto.holidayId) {
        holiday = await queryRunner.manager.findOne(HospitalHoliday, { 
          where: { holidayId: holidayDto.holidayId, tenantId } 
        });
      }
      
      if (!holiday) {
        holiday = queryRunner.manager.create(HospitalHoliday, { tenantId });
      }

      holiday.holidayDate = holidayDto.holidayDate;
      holiday.holidayName = holidayDto.holidayName;
      holiday.description = holidayDto.description || null;

      await queryRunner.manager.save(HospitalHoliday, holiday);
    }
  }

  private async saveVacationPeriods(tenantId: string, vacationPeriods: any[], queryRunner: any): Promise<void> {
    // Remove existing vacation periods not in the new list
    const existingPeriods = await queryRunner.manager.find(HospitalVacationPeriod, { where: { tenantId } });
    const newPeriodIds = vacationPeriods.filter(p => p.vacationPeriodId).map(p => p.vacationPeriodId);
    
    for (const existing of existingPeriods) {
      if (!newPeriodIds.includes(existing.vacationPeriodId)) {
        await queryRunner.manager.remove(HospitalVacationPeriod, existing);
      }
    }

    // Save or update vacation periods
    for (const periodDto of vacationPeriods) {
      let period;
      if (periodDto.vacationPeriodId) {
        period = await queryRunner.manager.findOne(HospitalVacationPeriod, { 
          where: { vacationPeriodId: periodDto.vacationPeriodId, tenantId } 
        });
      }
      
      if (!period) {
        period = queryRunner.manager.create(HospitalVacationPeriod, { tenantId });
      }

      period.startDate = periodDto.startDate;
      period.endDate = periodDto.endDate;
      period.description = periodDto.description || null;

      await queryRunner.manager.save(HospitalVacationPeriod, period);
    }
  }

  private async saveVisitorHours(tenantId: string, visitorHours: any[], queryRunner: any): Promise<void> {
    // Remove existing visitor hours not in the new list
    const existingHours = await queryRunner.manager.find(HospitalVisitorHours, { where: { tenantId } });
    const newHourIds = visitorHours.filter(h => h.visitorHoursId).map(h => h.visitorHoursId);
    
    for (const existing of existingHours) {
      if (!newHourIds.includes(existing.visitorHoursId)) {
        await queryRunner.manager.remove(HospitalVisitorHours, existing);
      }
    }

    // Save or update visitor hours
    for (const hoursDto of visitorHours) {
      let hours;
      if (hoursDto.visitorHoursId) {
        hours = await queryRunner.manager.findOne(HospitalVisitorHours, { 
          where: { visitorHoursId: hoursDto.visitorHoursId, tenantId } 
        });
      }
      
      if (!hours) {
        hours = queryRunner.manager.create(HospitalVisitorHours, { tenantId });
      }

      hours.areaType = hoursDto.areaType;
      hours.startTime = hoursDto.startTime;
      hours.endTime = hoursDto.endTime;

      await queryRunner.manager.save(HospitalVisitorHours, hours);
    }
  }

  private async saveStaffRatios(tenantId: string, staffRatios: any[], queryRunner: any): Promise<void> {
    // Remove existing staff ratios not in the new list
    const existingRatios = await queryRunner.manager.find(HospitalStaffRatio, { where: { tenantId } });
    const newRatioIds = staffRatios.filter(r => r.staffRatioId).map(r => r.staffRatioId);
    
    for (const existing of existingRatios) {
      if (!newRatioIds.includes(existing.staffRatioId)) {
        await queryRunner.manager.remove(HospitalStaffRatio, existing);
      }
    }

    // Save or update staff ratios
    for (const ratioDto of staffRatios) {
      let ratio;
      if (ratioDto.staffRatioId) {
        ratio = await queryRunner.manager.findOne(HospitalStaffRatio, { 
          where: { staffRatioId: ratioDto.staffRatioId, tenantId } 
        });
      }
      
      if (!ratio) {
        ratio = queryRunner.manager.create(HospitalStaffRatio, { tenantId });
      }

      ratio.departmentId = ratioDto.departmentId;
      ratio.staffCount = ratioDto.staffCount;
      ratio.patientCount = ratioDto.patientCount;

      await queryRunner.manager.save(HospitalStaffRatio, ratio);
    }
  }

  private async publishConfigurationStartedEvent(tenantId: string, userId: string): Promise<void> {
    try {
      const event = {
        eventId: crypto.randomUUID(),
        eventType: 'operational.parameters.configuration.started',
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          tenantId,
          userId,
          startedAt: new Date().toISOString(),
        },
      };
      await this.messagingService.publishEvent('operational-events', event);
    } catch (error) {
      // Log but don't fail the operation
      console.warn('Failed to publish configuration started event:', error.message);
    }
  }

  private async publishConfigurationSuccessEvent(
    tenantId: string,
    userId: string,
    params: HospitalOperationalParameters,
    dto: SaveOperationalParametersDto,
  ): Promise<void> {
    try {
      const event = {
        eventId: crypto.randomUUID(),
        eventType: 'operational.parameters.configured',
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          operationalParametersId: params.operationalParametersId,
          tenantId,
          userId,
          timezone: params.timezone,
          fiscalYearStartMonth: params.fiscalYearStartMonth,
          defaultCurrency: params.defaultCurrency,
          holidaysCount: dto.holidays.length,
          vacationPeriodsCount: dto.vacationPeriods.length,
          visitorHoursCount: dto.visitorHours.length,
          staffRatiosCount: dto.staffRatios.length,
          configuredAt: new Date().toISOString(),
        },
      };
      await this.messagingService.publishEvent('operational-events', event);
    } catch (error) {
      console.warn('Failed to publish configuration success event:', error.message);
    }
  }

  private async publishConfigurationFailureEvent(tenantId: string, userId: string, error: any): Promise<void> {
    try {
      const event = {
        eventId: crypto.randomUUID(),
        eventType: 'operational.parameters.configuration.failed',
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          tenantId,
          userId,
          errorCode: error?.response?.code || 'UNKNOWN_ERROR',
          errorMessage: error?.message || 'Unknown error occurred',
          validationErrors: error?.response?.validationErrors || [],
          failedAt: new Date().toISOString(),
        },
      };
      await this.messagingService.publishEvent('operational-events', event);
    } catch (publishError) {
      console.warn('Failed to publish configuration failure event:', publishError.message);
    }
  }
}