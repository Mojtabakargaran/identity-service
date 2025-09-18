import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

export interface IPasswordResetToken {
  tokenId: string;
  userId: string;
  tokenValue: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

@Entity('password_reset_tokens')
export class PasswordResetToken implements IPasswordResetToken {
  @PrimaryGeneratedColumn('uuid', { name: 'token_id' })
  tokenId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'token_value', type: 'varchar', length: 255, unique: true })
  tokenValue: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}