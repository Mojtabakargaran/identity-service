import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenant/tenant.entity';
import { MedicalDepartment } from '../../institutional-profile/medical-department.entity';
import { HospitalOperationalParameters } from './hospital-operational-parameters.entity';

@Entity('hospital_staff_ratios')
export class HospitalStaffRatio {
  @PrimaryGeneratedColumn('uuid', { name: 'staff_ratio_id' })
  staffRatioId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @Column({ name: 'staff_count', type: 'integer' })
  staffCount: number;

  @Column({ name: 'patient_count', type: 'integer' })
  patientCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => MedicalDepartment, { eager: true })
  @JoinColumn({ name: 'department_id' })
  department: MedicalDepartment;

  @ManyToOne(() => HospitalOperationalParameters, (params) => params.staffRatios)
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'tenantId' })
  operationalParameters: HospitalOperationalParameters;
}