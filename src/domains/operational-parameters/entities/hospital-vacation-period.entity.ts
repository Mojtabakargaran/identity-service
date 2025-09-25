import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenant/tenant.entity';
import { HospitalOperationalParameters } from './hospital-operational-parameters.entity';

@Entity('hospital_vacation_periods')
export class HospitalVacationPeriod {
  @PrimaryGeneratedColumn('uuid', { name: 'vacation_period_id' })
  vacationPeriodId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => HospitalOperationalParameters, (params) => params.vacationPeriods)
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'tenantId' })
  operationalParameters: HospitalOperationalParameters;
}