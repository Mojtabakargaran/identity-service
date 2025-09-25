import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenant/tenant.entity';
import { HospitalOperationalParameters } from './hospital-operational-parameters.entity';

@Entity('hospital_visitor_hours')
export class HospitalVisitorHours {
  @PrimaryGeneratedColumn('uuid', { name: 'visitor_hours_id' })
  visitorHoursId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'area_type', type: 'varchar', length: 100 })
  areaType: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => HospitalOperationalParameters, (params) => params.visitorHours)
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'tenantId' })
  operationalParameters: HospitalOperationalParameters;
}