import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';

export enum HospitalType {
  GENERAL_HOSPITAL = 'general_hospital',
  SPECIALTY_HOSPITAL = 'specialty_hospital',
  TEACHING_HOSPITAL = 'teaching_hospital',
  RESEARCH_HOSPITAL = 'research_hospital',
  COMMUNITY_HOSPITAL = 'community_hospital',
  PRIVATE_CLINIC = 'private_clinic',
}

export enum AccreditationStatus {
  ACCREDITED = 'accredited',
  PENDING = 'pending',
  NOT_ACCREDITED = 'not_accredited',
}

export enum EmergencyServicesAvailability {
  TWENTY_FOUR_SEVEN = '24_7',
  LIMITED_HOURS = 'limited_hours',
  NOT_AVAILABLE = 'not_available',
}

@Entity('hospital_institutional_profiles')
export class HospitalInstitutionalProfile {
  @PrimaryGeneratedColumn('uuid', { name: 'profile_id' })
  profileId: string;

  @Column({ name: 'tenant_id', type: 'uuid', unique: true })
  tenantId: string;

  @Column({
    name: 'hospital_type',
    type: 'enum',
    enum: HospitalType,
  })
  hospitalType: HospitalType;

  @Column({ name: 'total_beds', type: 'integer' })
  totalBeds: number;

  @Column({ name: 'icu_beds', type: 'integer' })
  icuBeds: number;

  @Column({ name: 'operating_rooms', type: 'integer' })
  operatingRooms: number;

  @Column({ name: 'emergency_rooms', type: 'integer' })
  emergencyRooms: number;

  @Column({ name: 'establishment_date', type: 'date' })
  establishmentDate: Date;

  @Column({
    name: 'accreditation_status',
    type: 'enum',
    enum: AccreditationStatus,
  })
  accreditationStatus: AccreditationStatus;

  @Column({ name: 'accreditation_body', type: 'varchar', length: 255, nullable: true })
  accreditationBody: string | null;

  @Column({ name: 'accreditation_expiry_date', type: 'date', nullable: true })
  accreditationExpiryDate: Date | null;

  @Column({ name: 'general_operating_start_time', type: 'time' })
  generalOperatingStartTime: string;

  @Column({ name: 'general_operating_end_time', type: 'time' })
  generalOperatingEndTime: string;

  @Column({
    name: 'emergency_services_availability',
    type: 'enum',
    enum: EmergencyServicesAvailability,
  })
  emergencyServicesAvailability: EmergencyServicesAvailability;

  @Column({ name: 'mission_statement', type: 'text', nullable: true })
  missionStatement: string | null;

  @Column({ name: 'vision_statement', type: 'text', nullable: true })
  visionStatement: string | null;

  @Column({ name: 'values_statement', type: 'text', nullable: true })
  valuesStatement: string | null;

  @Column({ name: 'website_url', type: 'varchar', length: 500, nullable: true })
  websiteUrl: string | null;

  @Column({ name: 'profile_completed_at', type: 'timestamp', nullable: true })
  profileCompletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Tenant, { eager: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}