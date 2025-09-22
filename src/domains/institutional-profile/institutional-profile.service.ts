import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HospitalInstitutionalProfile, HospitalType, AccreditationStatus } from './hospital-institutional-profile.entity';
import { MedicalDepartment } from './medical-department.entity';
import { HospitalDepartment } from './hospital-department.entity';
import { HospitalOperatingHours, DayOfWeek } from './hospital-operating-hours.entity';
import { Tenant } from '../tenant/tenant.entity';
import { UpdateInstitutionalProfileDto } from './dto/update-institutional-profile.dto';
import { UpdateOperatingHoursDto, OperatingHoursResponseDto, OperatingHoursUpdateResponseDto } from './dto/operating-hours.dto';
import { DepartmentsListResponseDto } from './dto/departments-response.dto';
import { InstitutionalProfileResponseDto } from './dto/institutional-profile-response.dto';
import { InstitutionalProfileCompletionResponseDto } from './dto/institutional-profile-completion-response.dto';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';

@Injectable()
export class InstitutionalProfileService {
  constructor(
    @InjectRepository(HospitalInstitutionalProfile)
    private institutionalProfileRepository: Repository<HospitalInstitutionalProfile>,
    @InjectRepository(MedicalDepartment)
    private medicalDepartmentRepository: Repository<MedicalDepartment>,
    @InjectRepository(HospitalDepartment)
    private hospitalDepartmentRepository: Repository<HospitalDepartment>,
    @InjectRepository(HospitalOperatingHours)
    private operatingHoursRepository: Repository<HospitalOperatingHours>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private dataSource: DataSource,
    private messagingService: MessagingService,
  ) {}

  async getDepartments(): Promise<DepartmentsListResponseDto> {
    try {
      const departments = await this.medicalDepartmentRepository.find({
        where: { isActive: true },
        order: { departmentNameEn: 'ASC' },
      });

      return {
        code: 'DEPARTMENTS_RETRIEVED',
        message: 'Medical departments retrieved successfully',
        data: {
          departments: departments.map(dept => ({
            departmentId: dept.departmentId,
            departmentNameEn: dept.departmentNameEn,
            departmentNameFa: dept.departmentNameFa,
            description: dept.description,
            isActive: dept.isActive,
          })),
        },
      };
    } catch (error) {
      throw new BadRequestException({
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve medical departments',
      });
    }
  }

  async getInstitutionalProfile(tenantId: string): Promise<InstitutionalProfileResponseDto> {
    try {
      const tenant = await this.tenantRepository.findOne({
        where: { tenantId },
      });

      if (!tenant) {
        throw new NotFoundException({
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found',
        });
      }

      const profile = await this.institutionalProfileRepository.findOne({
        where: { tenantId },
      });

      const hospitalDepartments = await this.hospitalDepartmentRepository.find({
        where: { tenantId },
        relations: ['department'],
      });

      const operatingHours = await this.operatingHoursRepository.find({
        where: { tenantId },
        order: { dayOfWeek: 'ASC' },
      });

      if (!profile) {
        // Return empty profile structure for initial setup
        return {
          code: 'INSTITUTIONAL_PROFILE_RETRIEVED',
          message: 'Institutional profile data retrieved successfully',
          data: {
            profileId: null,
            tenantId: tenantId,
            profileCompleted: false,
            profileCompletedAt: null,
            hospitalInfo: {
              hospitalType: null,
              totalBeds: null,
              icuBeds: null,
              operatingRooms: null,
              emergencyRooms: null,
              establishmentDate: null,
              websiteUrl: null,
            },
            accreditation: {
              accreditationStatus: null,
              accreditationBody: null,
              accreditationExpiryDate: null,
            },
            operatingSchedule: {
              generalOperatingStartTime: null,
              generalOperatingEndTime: null,
              emergencyServicesAvailability: null,
              weeklyHours: operatingHours.map(oh => ({
                operatingHoursId: oh.operatingHoursId,
                dayOfWeek: oh.dayOfWeek,
                startTime: oh.startTime,
                endTime: oh.endTime,
                isClosed: oh.isClosed,
              })),
            },
            statements: {
              missionStatement: null,
              visionStatement: null,
              valuesStatement: null,
            },
            selectedDepartments: [],
          },
        };
      }

      return {
        code: 'INSTITUTIONAL_PROFILE_RETRIEVED',
        message: 'Institutional profile data retrieved successfully',
        data: {
          profileId: profile.profileId,
          tenantId: tenantId,
          profileCompleted: !!profile.profileCompletedAt,
          profileCompletedAt: profile.profileCompletedAt?.toISOString() || null,
          hospitalInfo: {
            hospitalType: profile.hospitalType,
            totalBeds: profile.totalBeds,
            icuBeds: profile.icuBeds,
            operatingRooms: profile.operatingRooms,
            emergencyRooms: profile.emergencyRooms,
            establishmentDate: profile.establishmentDate.toISOString().split('T')[0],
            websiteUrl: profile.websiteUrl,
          },
          accreditation: {
            accreditationStatus: profile.accreditationStatus,
            accreditationBody: profile.accreditationBody,
            accreditationExpiryDate: profile.accreditationExpiryDate?.toISOString().split('T')[0] || null,
          },
          operatingSchedule: {
            generalOperatingStartTime: profile.generalOperatingStartTime,
            generalOperatingEndTime: profile.generalOperatingEndTime,
            emergencyServicesAvailability: profile.emergencyServicesAvailability,
            weeklyHours: operatingHours.map(oh => ({
              operatingHoursId: oh.operatingHoursId,
              dayOfWeek: oh.dayOfWeek,
              startTime: oh.startTime,
              endTime: oh.endTime,
              isClosed: oh.isClosed,
            })),
          },
          statements: {
            missionStatement: profile.missionStatement,
            visionStatement: profile.visionStatement,
            valuesStatement: profile.valuesStatement,
          },
          selectedDepartments: hospitalDepartments.map(hd => ({
            departmentId: hd.department.departmentId,
            departmentNameEn: hd.department.departmentNameEn,
            departmentNameFa: hd.department.departmentNameFa,
          })),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve institutional profile',
      });
    }
  }

  async updateInstitutionalProfile(
    tenantId: string,
    userId: string,
    updateDto: UpdateInstitutionalProfileDto
  ): Promise<InstitutionalProfileCompletionResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Publish institutional profile completion started event
      await this.publishInstitutionalProfileStartedEvent(tenantId, userId);

      // Validate business rules
      await this.validateInstitutionalProfileData(updateDto);

      // Verify departments exist
      await this.validateDepartments(updateDto.selectedDepartmentIds);

      // Check if profile already exists and is complete
      const existingProfile = await queryRunner.manager.findOne(HospitalInstitutionalProfile, {
        where: { tenantId },
      });

      if (existingProfile && existingProfile.profileCompletedAt) {
        throw new ConflictException({
          code: 'INSTITUTIONAL_PROFILE_ALREADY_COMPLETE',
          message: 'Institutional profile is already complete',
        });
      }

      const now = new Date();
      let profile: HospitalInstitutionalProfile;

      if (existingProfile) {
        // Update existing profile
        Object.assign(existingProfile, {
          hospitalType: updateDto.hospitalType,
          totalBeds: updateDto.totalBeds,
          icuBeds: updateDto.icuBeds,
          operatingRooms: updateDto.operatingRooms,
          emergencyRooms: updateDto.emergencyRooms,
          establishmentDate: new Date(updateDto.establishmentDate),
          accreditationStatus: updateDto.accreditationStatus,
          accreditationBody: updateDto.accreditationBody,
          accreditationExpiryDate: updateDto.accreditationExpiryDate ? new Date(updateDto.accreditationExpiryDate) : null,
          generalOperatingStartTime: updateDto.generalOperatingStartTime,
          generalOperatingEndTime: updateDto.generalOperatingEndTime,
          emergencyServicesAvailability: updateDto.emergencyServicesAvailability,
          missionStatement: updateDto.missionStatement,
          visionStatement: updateDto.visionStatement,
          valuesStatement: updateDto.valuesStatement,
          websiteUrl: updateDto.websiteUrl,
          profileCompletedAt: now,
        });

        profile = await queryRunner.manager.save(existingProfile);
      } else {
        // Create new profile
        profile = queryRunner.manager.create(HospitalInstitutionalProfile, {
          tenantId,
          hospitalType: updateDto.hospitalType,
          totalBeds: updateDto.totalBeds,
          icuBeds: updateDto.icuBeds,
          operatingRooms: updateDto.operatingRooms,
          emergencyRooms: updateDto.emergencyRooms,
          establishmentDate: new Date(updateDto.establishmentDate),
          accreditationStatus: updateDto.accreditationStatus,
          accreditationBody: updateDto.accreditationBody,
          accreditationExpiryDate: updateDto.accreditationExpiryDate ? new Date(updateDto.accreditationExpiryDate) : null,
          generalOperatingStartTime: updateDto.generalOperatingStartTime,
          generalOperatingEndTime: updateDto.generalOperatingEndTime,
          emergencyServicesAvailability: updateDto.emergencyServicesAvailability,
          missionStatement: updateDto.missionStatement,
          visionStatement: updateDto.visionStatement,
          valuesStatement: updateDto.valuesStatement,
          websiteUrl: updateDto.websiteUrl,
          profileCompletedAt: now,
        });

        profile = await queryRunner.manager.save(profile);
      }

      // Update hospital departments
      await queryRunner.manager.delete(HospitalDepartment, { tenantId });
      const hospitalDepartments = updateDto.selectedDepartmentIds.map(departmentId =>
        queryRunner.manager.create(HospitalDepartment, {
          tenantId,
          departmentId,
        })
      );
      await queryRunner.manager.save(hospitalDepartments);

      // Update operating hours
      await queryRunner.manager.delete(HospitalOperatingHours, { tenantId });
      const operatingHours = updateDto.weeklyOperatingHours.map(oh =>
        queryRunner.manager.create(HospitalOperatingHours, {
          tenantId,
          dayOfWeek: oh.dayOfWeek,
          startTime: oh.isClosed ? null : oh.startTime,
          endTime: oh.isClosed ? null : oh.endTime,
          isClosed: oh.isClosed || false,
        })
      );
      await queryRunner.manager.save(operatingHours);

      await queryRunner.commitTransaction();

      // Publish success event
      await this.publishInstitutionalProfileCompletedEvent(tenantId, userId, profile.profileId);

      return {
        code: 'INSTITUTIONAL_PROFILE_COMPLETED',
        message: 'Institutional profile completed successfully',
        data: {
          profileId: profile.profileId,
          tenantId: tenantId,
          profileCompleted: true,
          profileCompletedAt: profile.profileCompletedAt!.toISOString(),
          redirectUrl: '/document-upload',
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      // Publish failure event
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.publishInstitutionalProfileFailedEvent(tenantId, userId, errorMessage);

      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      
      throw new BadRequestException({
        code: 'INSTITUTIONAL_PROFILE_UPDATE_FAILED',
        message: 'Failed to update institutional profile',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async getOperatingHours(tenantId: string): Promise<OperatingHoursResponseDto> {
    try {
      const profile = await this.institutionalProfileRepository.findOne({
        where: { tenantId },
      });

      const operatingHours = await this.operatingHoursRepository.find({
        where: { tenantId },
        order: { dayOfWeek: 'ASC' },
      });

      if (!profile && operatingHours.length === 0) {
        throw new NotFoundException({
          code: 'OPERATING_HOURS_NOT_FOUND',
          message: 'Operating hours not found',
        });
      }

      return {
        code: 'OPERATING_HOURS_RETRIEVED',
        message: 'Operating hours retrieved successfully',
        data: {
          tenantId: tenantId,
          generalOperatingStartTime: profile?.generalOperatingStartTime || '08:00',
          generalOperatingEndTime: profile?.generalOperatingEndTime || '18:00',
          emergencyServicesAvailability: profile?.emergencyServicesAvailability || 'not_available',
          weeklyHours: operatingHours.map(oh => ({
            operatingHoursId: oh.operatingHoursId,
            dayOfWeek: oh.dayOfWeek,
            startTime: oh.startTime,
            endTime: oh.endTime,
            isClosed: oh.isClosed,
          })),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve operating hours',
      });
    }
  }

  async updateOperatingHours(tenantId: string, updateDto: UpdateOperatingHoursDto): Promise<OperatingHoursUpdateResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate operating hours
      this.validateOperatingHours(updateDto);

      // Update general operating hours in profile
      const profile = await queryRunner.manager.findOne(HospitalInstitutionalProfile, {
        where: { tenantId },
      });

      if (profile) {
        profile.generalOperatingStartTime = updateDto.generalOperatingStartTime;
        profile.generalOperatingEndTime = updateDto.generalOperatingEndTime;
        profile.emergencyServicesAvailability = updateDto.emergencyServicesAvailability as any;
        await queryRunner.manager.save(profile);
      }

      // Update weekly operating hours
      await queryRunner.manager.delete(HospitalOperatingHours, { tenantId });
      const operatingHours = updateDto.weeklyOperatingHours.map(oh =>
        queryRunner.manager.create(HospitalOperatingHours, {
          tenantId,
          dayOfWeek: oh.dayOfWeek,
          startTime: oh.isClosed ? null : oh.startTime,
          endTime: oh.isClosed ? null : oh.endTime,
          isClosed: oh.isClosed || false,
        })
      );
      await queryRunner.manager.save(operatingHours);

      await queryRunner.commitTransaction();

      return {
        code: 'OPERATING_HOURS_UPDATED',
        message: 'Operating hours updated successfully',
        data: {
          tenantId: tenantId,
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException({
        code: 'OPERATING_HOURS_UPDATE_FAILED',
        message: 'Failed to update operating hours',
      });
    } finally {
      await queryRunner.release();
    }
  }

  private async validateInstitutionalProfileData(updateDto: UpdateInstitutionalProfileDto): Promise<void> {
    // Validate bed capacity
    if (updateDto.icuBeds > updateDto.totalBeds) {
      throw new BadRequestException({
        code: 'INVALID_BED_CAPACITY',
        message: 'ICU beds cannot exceed total beds',
      });
    }

    if (updateDto.totalBeds > 10000) {
      throw new BadRequestException({
        code: 'UNREALISTIC_CAPACITY',
        message: 'Total beds cannot exceed 10,000',
      });
    }

    // Validate establishment date
    const establishmentDate = new Date(updateDto.establishmentDate);
    const currentDate = new Date();
    const minDate = new Date('1800-01-01');
    
    if (establishmentDate > currentDate) {
      throw new BadRequestException({
        code: 'INVALID_ESTABLISHMENT_DATE',
        message: 'Establishment date cannot be in the future',
      });
    }

    if (establishmentDate < minDate) {
      throw new BadRequestException({
        code: 'INVALID_ESTABLISHMENT_DATE',
        message: 'Please enter a valid establishment date',
      });
    }

    // Validate accreditation expiry date
    if (updateDto.accreditationStatus === AccreditationStatus.ACCREDITED) {
      if (!updateDto.accreditationExpiryDate) {
        throw new BadRequestException({
          code: 'INVALID_ACCREDITATION_EXPIRY',
          message: 'Accreditation expiry date is required for accredited hospitals',
        });
      }

      const expiryDate = new Date(updateDto.accreditationExpiryDate);
      if (expiryDate <= currentDate) {
        throw new BadRequestException({
          code: 'INVALID_ACCREDITATION_EXPIRY',
          message: 'Accreditation expiry date must be in the future',
        });
      }
    }

    // Validate operating hours
    this.validateOperatingHours({
      generalOperatingStartTime: updateDto.generalOperatingStartTime,
      generalOperatingEndTime: updateDto.generalOperatingEndTime,
      weeklyOperatingHours: updateDto.weeklyOperatingHours,
    });
  }

  private validateOperatingHours(operatingHours: { generalOperatingStartTime: string; generalOperatingEndTime: string; weeklyOperatingHours: any[] }): void {
    // Validate general operating hours
    if (operatingHours.generalOperatingStartTime >= operatingHours.generalOperatingEndTime) {
      throw new BadRequestException({
        code: 'INVALID_OPERATING_HOURS',
        message: 'General operating start time must be before end time',
      });
    }

    // Validate weekly operating hours
    for (const oh of operatingHours.weeklyOperatingHours) {
      if (!oh.isClosed && oh.startTime && oh.endTime) {
        if (oh.startTime >= oh.endTime) {
          throw new BadRequestException({
            code: 'INVALID_OPERATING_HOURS',
            message: `Operating hours for ${oh.dayOfWeek} are invalid: start time must be before end time`,
          });
        }
      }
    }
  }

  private async validateDepartments(departmentIds: string[]): Promise<void> {
    const departments = await this.medicalDepartmentRepository.findByIds(departmentIds);
    
    if (departments.length !== departmentIds.length) {
      throw new BadRequestException({
        code: 'INVALID_DEPARTMENTS',
        message: 'One or more selected departments are invalid',
      });
    }

    const inactiveDepartments = departments.filter(dept => !dept.isActive);
    if (inactiveDepartments.length > 0) {
      throw new BadRequestException({
        code: 'INVALID_DEPARTMENTS',
        message: 'One or more selected departments are not active',
      });
    }
  }

  private async publishInstitutionalProfileStartedEvent(tenantId: string, userId: string): Promise<void> {
    const event = {
      eventId: this.generateEventId(),
      eventType: 'institutional.profile.completion.started',
      timestamp: new Date().toISOString(),
      tenantId,
      userId,
      version: '1.0',
      source: 'identity-service',
      data: {
        tenantId,
        userId,
        initiatedAt: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('institutional-events', event);
  }

  private async publishInstitutionalProfileCompletedEvent(tenantId: string, userId: string, profileId: string): Promise<void> {
    const event = {
      eventId: this.generateEventId(),
      eventType: 'institutional.profile.completed',
      timestamp: new Date().toISOString(),
      tenantId,
      userId,
      version: '1.0',
      source: 'identity-service',
      data: {
        tenantId,
        userId,
        profileId,
        completedAt: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('institutional-events', event);
  }

  private async publishInstitutionalProfileFailedEvent(tenantId: string, userId: string, errorReason: string): Promise<void> {
    const event = {
      eventId: this.generateEventId(),
      eventType: 'institutional.profile.completion.failed',
      timestamp: new Date().toISOString(),
      tenantId,
      userId,
      version: '1.0',
      source: 'identity-service',
      data: {
        tenantId,
        userId,
        errorReason,
        failedAt: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('institutional-events', event);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}