import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface IPasswordResetRateLimit {
  rateLimitId: string;
  email: string;
  ipAddress: string;
  requestCount: number;
  windowStart: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Entity('password_reset_rate_limits')
export class PasswordResetRateLimit implements IPasswordResetRateLimit {
  @PrimaryGeneratedColumn('uuid', { name: 'rate_limit_id' })
  rateLimitId: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'ip_address', type: 'inet' })
  ipAddress: string;

  @Column({ name: 'request_count', type: 'integer', default: 1 })
  requestCount: number;

  @Column({ name: 'window_start', type: 'timestamp' })
  windowStart: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}