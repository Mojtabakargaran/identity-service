import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';
import { MedicalDepartment } from './medical-department.entity';

@Entity('hospital_departments')
export class HospitalDepartment {
  @PrimaryGeneratedColumn('uuid', { name: 'hospital_department_id' })
  hospitalDepartmentId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

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
}