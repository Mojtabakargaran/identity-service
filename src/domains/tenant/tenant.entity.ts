import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid', { name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'hospital_name', type: 'varchar', length: 255, unique: true })
  hospitalName: string;

  @Column({ name: 'subdomain', type: 'varchar', length: 100, unique: true })
  subdomain: string;

  @Column({ name: 'hospital_license_number', type: 'varchar', length: 100 })
  hospitalLicenseNumber: string;

  @Column({ name: 'hospital_address_street', type: 'varchar', length: 255 })
  hospitalAddressStreet: string;

  @Column({ name: 'hospital_address_city', type: 'varchar', length: 100 })
  hospitalAddressCity: string;

  @Column({ name: 'hospital_address_state', type: 'varchar', length: 100 })
  hospitalAddressState: string;

  @Column({ name: 'hospital_address_postal_code', type: 'varchar', length: 20 })
  hospitalAddressPostalCode: string;

  @Column({ name: 'hospital_contact_phone', type: 'varchar', length: 20 })
  hospitalContactPhone: string;

  @Column({ name: 'hospital_contact_email', type: 'varchar', length: 255 })
  hospitalContactEmail: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];
}
