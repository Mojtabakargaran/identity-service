import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export interface IUserDashboardPreferences {
  dashboardPreferencesId: string;
  userId: string;
  widgetLayout: any;
  createdAt: Date;
  updatedAt: Date;
}

@Entity('user_dashboard_preferences')
export class UserDashboardPreferences implements IUserDashboardPreferences {
  @PrimaryGeneratedColumn('uuid', { name: 'dashboard_preferences_id' })
  dashboardPreferencesId: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'widget_layout', type: 'jsonb' })
  widgetLayout: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}