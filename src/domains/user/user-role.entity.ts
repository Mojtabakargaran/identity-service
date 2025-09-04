import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum RoleType {
  OWNER = 'owner',
  ADMIN = 'admin',
  STAFF = 'staff',
}

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid', { name: 'user_role_id' })
  userRoleId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'role_type', type: 'enum', enum: RoleType })
  roleType: RoleType;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
  assignedBy: string | null;

  @ManyToOne(() => User, (user) => user.userRoles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_by' })
  assignedByUser: User | null;
}
