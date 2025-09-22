import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('medical_departments')
export class MedicalDepartment {
  @PrimaryGeneratedColumn('uuid', { name: 'department_id' })
  departmentId: string;

  @Column({ name: 'department_name_en', type: 'varchar', length: 255, unique: true })
  departmentNameEn: string;

  @Column({ name: 'department_name_fa', type: 'varchar', length: 255, unique: true })
  departmentNameFa: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}