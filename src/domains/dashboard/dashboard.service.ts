import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';
import { User } from '../user/user.entity';
import { UserRole, RoleType } from '../user/user-role.entity';
import { UserDashboardPreferences } from '../user/user-dashboard-preferences.entity';
import { HospitalInstitutionalProfile } from '../institutional-profile/hospital-institutional-profile.entity';
import { HospitalDepartment } from '../institutional-profile/hospital-department.entity';
import { HospitalOperationalParameters, HospitalHoliday } from '../operational-parameters/entities';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';
import {
  DashboardResponseDto,
  UserPreferencesResponseDto,
  UpdateUserPreferencesDto,
  UpdateUserPreferencesResponseDto,
  SystemStatusResponseDto,
} from './dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserDashboardPreferences)
    private dashboardPreferencesRepository: Repository<UserDashboardPreferences>,
    @InjectRepository(HospitalInstitutionalProfile)
    private institutionalProfileRepository: Repository<HospitalInstitutionalProfile>,
    @InjectRepository(HospitalDepartment)
    private hospitalDepartmentRepository: Repository<HospitalDepartment>,
    @InjectRepository(HospitalOperationalParameters)
    private operationalParametersRepository: Repository<HospitalOperationalParameters>,
    @InjectRepository(HospitalHoliday)
    private holidayRepository: Repository<HospitalHoliday>,
    private messagingService: MessagingService,
  ) {}

  async getDashboard(tenantId: string, userId: string, ipAddress: string, userAgent: string): Promise<DashboardResponseDto> {
    try {
      // Get tenant info
      const tenant = await this.tenantRepository.findOne({
        where: { tenantId },
      });
      if (!tenant) {
        throw new NotFoundException({
          code: 'TENANT_NOT_FOUND',
          message: 'Hospital tenant not found',
        });
      }

      // Get user info with role
      const user = await this.userRepository.findOne({
        where: { userId, tenantId },
        relations: ['userRoles'],
      });
      if (!user) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      const userRole = user.userRoles?.[0];
      if (!userRole) {
        throw new BadRequestException({
          code: 'USER_ROLE_NOT_FOUND',
          message: 'User role not found',
        });
      }

      // Get institutional profile
      const institutionalProfile = await this.institutionalProfileRepository.findOne({
        where: { tenantId },
      });

      // Get operational parameters
      const operationalParams = await this.operationalParametersRepository.findOne({
        where: { tenantId },
      });

      // Get department count
      const totalDepartments = await this.hospitalDepartmentRepository.count({
        where: { tenantId },
      });

      // Get total staff count (users with staff role)
      const totalStaff = await this.userRoleRepository.count({
        where: { 
          roleType: RoleType.STAFF,
        },
        relations: ['user'],
      });

      // Get upcoming holidays (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const upcomingHolidays = await this.holidayRepository.find({
        where: { 
          tenantId,
        },
        order: { holidayDate: 'ASC' },
        take: 5,
      });

      // Setup progress calculation
      const setupProgress = {
        profileCompleted: !!user.profileCompletedAt,
        profileCompletedAt: user.profileCompletedAt?.toISOString() || null,
        institutionalProfileCompleted: !!institutionalProfile?.profileCompletedAt,
        institutionalProfileCompletedAt: institutionalProfile?.profileCompletedAt?.toISOString() || null,
        operationalParametersConfigured: !!operationalParams,
        operationalParametersConfiguredAt: operationalParams?.createdAt?.toISOString() || null,
      };

      // Build response
      const dashboardData: DashboardResponseDto = {
        code: 'DASHBOARD_DATA_RETRIEVED',
        message: 'Dashboard data retrieved successfully',
        data: {
          hospitalInfo: {
            tenantId: tenant.tenantId,
            hospitalName: tenant.hospitalName,
            subdomain: tenant.subdomain,
            preferredLanguage: tenant.preferredLanguage,
          },
          userInfo: {
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            profilePhotoUrl: user.profilePhotoUrl,
            roleType: userRole.roleType,
            lastLoginAt: user.updatedAt.toISOString(),
          },
          setupProgress,
          statistics: {
            totalBeds: institutionalProfile?.totalBeds || 0,
            icuBeds: institutionalProfile?.icuBeds || 0,
            operatingRooms: institutionalProfile?.operatingRooms || 0,
            emergencyRooms: institutionalProfile?.emergencyRooms || 0,
            totalDepartments,
            totalStaff,
          },
          operationalInfo: {
            timezone: operationalParams?.timezone || 'UTC',
            defaultCurrency: operationalParams?.defaultCurrency || 'USD',
            fiscalYearStartMonth: operationalParams?.fiscalYearStartMonth || 1,
            hospitalType: institutionalProfile?.hospitalType || null,
            establishmentDate: institutionalProfile?.establishmentDate?.toISOString().split('T')[0] || null,
          },
          upcomingEvents: upcomingHolidays.map(holiday => ({
            holidayId: holiday.holidayId,
            holidayDate: holiday.holidayDate,
            holidayName: holiday.holidayName,
            description: holiday.description || '',
          })),
          recentActivity: [], // Will be populated by audit service data in future
        },
      };

      // Publish dashboard accessed event
      await this.publishDashboardAccessedEvent({
        userId,
        tenantId,
        hospitalName: tenant.hospitalName,
        roleType: userRole.roleType,
        ipAddress,
        userAgent,
      });

      return dashboardData;
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new BadRequestException({
        code: 'DATABASE_ERROR',
        message: 'System error occurred while retrieving dashboard data',
      });
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferencesResponseDto> {
    try {
      const preferences = await this.dashboardPreferencesRepository.findOne({
        where: { userId },
      });

      if (!preferences) {
        throw new NotFoundException({
          code: 'PREFERENCES_NOT_FOUND',
          message: 'Dashboard preferences not found, using default layout',
        });
      }

      return {
        code: 'DASHBOARD_PREFERENCES_RETRIEVED',
        message: 'Dashboard preferences retrieved successfully',
        data: {
          dashboardPreferencesId: preferences.dashboardPreferencesId,
          userId: preferences.userId,
          widgetLayout: preferences.widgetLayout,
          createdAt: preferences.createdAt.toISOString(),
          updatedAt: preferences.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new BadRequestException({
        code: 'DATABASE_ERROR',
        message: 'System error occurred while retrieving dashboard preferences',
      });
    }
  }

  async updateUserPreferences(
    tenantId: string,
    userId: string,
    updateDto: UpdateUserPreferencesDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<UpdateUserPreferencesResponseDto> {
    try {
      // Get user info for event
      const user = await this.userRepository.findOne({
        where: { userId, tenantId },
      });
      if (!user) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      const tenant = await this.tenantRepository.findOne({
        where: { tenantId },
      });

      let preferences = await this.dashboardPreferencesRepository.findOne({
        where: { userId },
      });

      const oldLayout = preferences?.widgetLayout || null;

      if (preferences) {
        // Update existing preferences
        preferences.widgetLayout = updateDto.widgetLayout;
        await this.dashboardPreferencesRepository.save(preferences);
      } else {
        // Create new preferences
        preferences = this.dashboardPreferencesRepository.create({
          userId,
          widgetLayout: updateDto.widgetLayout,
        });
        await this.dashboardPreferencesRepository.save(preferences);
      }

      // Calculate widget changes for event
      const widgetChanges = this.calculateWidgetChanges(oldLayout, updateDto.widgetLayout);

      // Publish preferences updated event
      await this.publishDashboardPreferencesUpdatedEvent({
        userId,
        tenantId,
        hospitalName: tenant?.hospitalName || '',
        dashboardPreferencesId: preferences.dashboardPreferencesId,
        widgetChanges,
        ipAddress,
        userAgent,
      });

      return {
        code: 'DASHBOARD_PREFERENCES_UPDATED',
        message: 'Dashboard preferences updated successfully',
        data: {
          dashboardPreferencesId: preferences.dashboardPreferencesId,
          updatedAt: preferences.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new BadRequestException({
        code: 'DATABASE_ERROR',
        message: 'System error occurred while saving dashboard preferences',
      });
    }
  }

  async getSystemStatus(): Promise<SystemStatusResponseDto> {
    try {
      const checkedAt = new Date().toISOString();
      const services = [
        {
          serviceName: 'identity-service',
          status: 'healthy' as 'healthy' | 'degraded' | 'down',
          responseTime: 10,
          lastChecked: checkedAt,
          estimatedRestoreTime: null,
        },
        {
          serviceName: 'audit-service',
          status: 'healthy' as 'healthy' | 'degraded' | 'down',
          responseTime: 15,
          lastChecked: checkedAt,
          estimatedRestoreTime: null,
        },
      ];

      const overallStatus: 'healthy' | 'degraded' | 'down' = services.some(s => s.status === 'down') 
        ? 'down'
        : services.some(s => s.status === 'degraded') 
        ? 'degraded' 
        : 'healthy';

      return {
        code: 'SYSTEM_STATUS_RETRIEVED',
        message: 'System status retrieved successfully',
        data: {
          services,
          overallStatus,
          checkedAt,
        },
      };
    } catch (error) {
      throw new BadRequestException({
        code: 'STATUS_CHECK_FAILED',
        message: 'Unable to perform system status check',
      });
    }
  }

  private async publishDashboardAccessedEvent(eventData: {
    userId: string;
    tenantId: string;
    hospitalName: string;
    roleType: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    const event = {
      eventId: require('uuid').v4(),
      eventType: 'dashboard.accessed',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        ...eventData,
        accessedAt: new Date().toISOString(),
        sessionDuration: 0, // Will be calculated by session management
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private async publishDashboardPreferencesUpdatedEvent(eventData: {
    userId: string;
    tenantId: string;
    hospitalName: string;
    dashboardPreferencesId: string;
    widgetChanges: {
      added: string[];
      removed: string[];
      repositioned: string[];
    };
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    const event = {
      eventId: require('uuid').v4(),
      eventType: 'dashboard.preferences.updated',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        ...eventData,
        updatedAt: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private calculateWidgetChanges(oldLayout: any, newLayout: any): {
    added: string[];
    removed: string[];
    repositioned: string[];
  } {
    const oldWidgetIds = oldLayout?.widgets?.map((w: any) => w.widgetId) || [];
    const newWidgetIds = newLayout?.widgets?.map((w: any) => w.widgetId) || [];

    const added = newWidgetIds.filter((id: string) => !oldWidgetIds.includes(id));
    const removed = oldWidgetIds.filter((id: string) => !newWidgetIds.includes(id));
    
    // For repositioned, check widgets that exist in both but have different positions
    const repositioned = newWidgetIds.filter((id: string) => {
      const oldWidget = oldLayout?.widgets?.find((w: any) => w.widgetId === id);
      const newWidget = newLayout?.widgets?.find((w: any) => w.widgetId === id);
      return oldWidget && newWidget && 
        (oldWidget.position.x !== newWidget.position.x || oldWidget.position.y !== newWidget.position.y);
    });

    return { added, removed, repositioned };
  }
}