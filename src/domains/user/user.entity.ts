import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';
import { UserRole } from './user-role.entity';

export enum UserStatus {
  ACTIVE = 'active',
  PENDING_VERIFICATION = 'pending_verification',
  SUSPENDED = 'suspended',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ name: 'failed_login_attempts', type: 'integer', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @Column({ name: 'last_failed_login_at', type: 'timestamp', nullable: true })
  lastFailedLoginAt: Date | null;

  // Profile completion fields for P1UC05
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender | null;

  @Column({ name: 'national_id_number', type: 'varchar', length: 100, nullable: true })
  nationalIdNumber: string | null;

  @Column({ name: 'nationality', type: 'varchar', length: 100, nullable: true })
  nationality: string | null;

  @Column({ name: 'professional_license_number', type: 'varchar', length: 100, nullable: true })
  professionalLicenseNumber: string | null;

  @Column({ name: 'medical_specialization', type: 'varchar', length: 100, nullable: true })
  medicalSpecialization: string | null;

  @Column({ name: 'years_of_experience', type: 'integer', nullable: true })
  yearsOfExperience: number | null;

  @Column({ name: 'educational_background', type: 'text', nullable: true })
  educationalBackground: string | null;

  @Column({ name: 'profile_photo_url', type: 'varchar', length: 500, nullable: true })
  profilePhotoUrl: string | null;

  @Column({ name: 'profile_completed_at', type: 'timestamp', nullable: true })
  profileCompletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];
}
