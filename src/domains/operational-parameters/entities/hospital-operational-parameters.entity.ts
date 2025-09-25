import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Tenant } from '../../tenant/tenant.entity';
import { HospitalHoliday } from './hospital-holiday.entity';
import { HospitalVacationPeriod } from './hospital-vacation-period.entity';
import { HospitalVisitorHours } from './hospital-visitor-hours.entity';
import { HospitalStaffRatio } from './hospital-staff-ratio.entity';

@Entity('hospital_operational_parameters')
export class HospitalOperationalParameters {
  @PrimaryGeneratedColumn('uuid', { name: 'operational_parameters_id' })
  operationalParametersId: string;

  @Column({ name: 'tenant_id', type: 'uuid', unique: true })
  tenantId: string;

  @Column({ name: 'timezone', type: 'varchar', length: 100 })
  timezone: string;

  @Column({ name: 'fiscal_year_start_month', type: 'integer' })
  fiscalYearStartMonth: number;

  @Column({ name: 'default_currency', type: 'varchar', length: 10 })
  defaultCurrency: string;

  @Column({ name: 'standard_consultation_duration_minutes', type: 'integer' })
  standardConsultationDurationMinutes: number;

  @Column({ name: 'standard_appointment_slot_duration_minutes', type: 'integer' })
  standardAppointmentSlotDurationMinutes: number;

  @Column({ name: 'advance_booking_limit_days', type: 'integer' })
  advanceBookingLimitDays: number;

  @Column({ name: 'cancellation_deadline_hours', type: 'integer' })
  cancellationDeadlineHours: number;

  @Column({ name: 'lunch_break_start_time', type: 'time', nullable: true })
  lunchBreakStartTime: string | null;

  @Column({ name: 'lunch_break_end_time', type: 'time', nullable: true })
  lunchBreakEndTime: string | null;

  @Column({ name: 'patient_checkin_window_minutes', type: 'integer' })
  patientCheckinWindowMinutes: number;

  @Column({ name: 'patient_late_arrival_grace_period_minutes', type: 'integer' })
  patientLateArrivalGracePeriodMinutes: number;

  @Column({ name: 'appointment_reminder_timing_hours', type: 'integer' })
  appointmentReminderTimingHours: number;

  @Column({ name: 'bed_occupancy_alert_threshold_percentage', type: 'integer' })
  bedOccupancyAlertThresholdPercentage: number;

  @Column({ name: 'inventory_low_stock_alert_threshold', type: 'integer' })
  inventoryLowStockAlertThreshold: number;

  @Column({ name: 'emergency_evacuation_procedures', type: 'text', nullable: true })
  emergencyEvacuationProcedures: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => HospitalHoliday, (holiday) => holiday.operationalParameters)
  holidays: HospitalHoliday[];

  @OneToMany(() => HospitalVacationPeriod, (vacationPeriod) => vacationPeriod.operationalParameters)
  vacationPeriods: HospitalVacationPeriod[];

  @OneToMany(() => HospitalVisitorHours, (visitorHours) => visitorHours.operationalParameters)
  visitorHours: HospitalVisitorHours[];

  @OneToMany(() => HospitalStaffRatio, (staffRatio) => staffRatio.operationalParameters)
  staffRatios: HospitalStaffRatio[];
}