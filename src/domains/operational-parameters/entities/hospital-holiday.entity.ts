import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenant/tenant.entity';
import { HospitalOperationalParameters } from './hospital-operational-parameters.entity';

@Entity('hospital_holidays')
export class HospitalHoliday {
  @PrimaryGeneratedColumn('uuid', { name: 'holiday_id' })
  holidayId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'holiday_date', type: 'date' })
  holidayDate: string;

  @Column({ name: 'holiday_name', type: 'varchar', length: 255 })
  holidayName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => HospitalOperationalParameters, (params) => params.holidays)
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'tenantId' })
  operationalParameters: HospitalOperationalParameters;
}