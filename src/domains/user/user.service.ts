import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Tenant } from '../tenant/tenant.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ProfileCompletionResponseDto } from './dto/profile-completion-response.dto';
import { PhotoUploadResponseDto } from './dto/photo-upload-response.dto';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private messagingService: MessagingService,
  ) {}

  async getProfile(userId: string): Promise<ApiResponseDto<ProfileResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: ['tenant'],
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User profile not found',
      });
    }

    const profileCompleted = !!user.profileCompletedAt;

    const profileData: ProfileResponseDto = {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      profileCompleted,
      profileCompletedAt: user.profileCompletedAt?.toISOString() || null,
      personalInfo: {
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null,
        gender: user.gender || null,
        nationalIdNumber: user.nationalIdNumber || null,
        nationality: user.nationality || null,
      },
      professionalInfo: {
        professionalLicenseNumber: user.professionalLicenseNumber || null,
        medicalSpecialization: user.medicalSpecialization || null,
        yearsOfExperience: user.yearsOfExperience || null,
        educationalBackground: user.educationalBackground || null,
      },
      profilePhotoUrl: user.profilePhotoUrl || null,
      hospitalAddress: {
        street: user.tenant.hospitalAddressStreet,
        city: user.tenant.hospitalAddressCity,
        state: user.tenant.hospitalAddressState,
        postalCode: user.tenant.hospitalAddressPostalCode,
      },
    };

    return new ApiResponseDto('PROFILE_DATA_RETRIEVED', 'Profile data retrieved successfully', profileData);
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto, ipAddress: string, userAgent: string): Promise<ApiResponseDto<ProfileCompletionResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: ['tenant'],
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User profile not found',
      });
    }

    if (user.profileCompletedAt) {
      throw new ConflictException({
        code: 'PROFILE_ALREADY_COMPLETE',
        message: 'Profile is already completed',
      });
    }

    // Validate date of birth
    const birthDate = new Date(updateData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (birthDate > today) {
      throw new BadRequestException({
        code: 'FUTURE_DATE_OF_BIRTH',
        message: 'Date of birth cannot be in the future',
      });
    }

    if (actualAge < 18 || actualAge > 100) {
      throw new BadRequestException({
        code: 'INVALID_AGE',
        message: 'Date of birth indicates age under 18 or over 100',
      });
    }

    // Publish profile completion started event
    await this.publishProfileCompletionStartedEvent(user, ipAddress, userAgent);

    try {
      // Update user profile
      const profileCompletedAt = new Date();
      
      await this.userRepository.update(userId, {
        dateOfBirth: birthDate,
        gender: updateData.gender,
        nationalIdNumber: updateData.nationalIdNumber,
        nationality: updateData.nationality,
        professionalLicenseNumber: updateData.professionalLicenseNumber,
        medicalSpecialization: updateData.medicalSpecialization,
        yearsOfExperience: updateData.yearsOfExperience,
        educationalBackground: updateData.educationalBackground,
        profileCompletedAt,
      });

      // Publish profile completed event
      await this.publishProfileCompletedEvent(user, updateData, ipAddress, userAgent, profileCompletedAt);

      const responseData: ProfileCompletionResponseDto = {
        userId: user.userId,
        profileCompleted: true,
        profileCompletedAt: profileCompletedAt.toISOString(),
        redirectUrl: '/hospital-setup',
      };

      return new ApiResponseDto('PROFILE_COMPLETED', 'Profile completed successfully', responseData);
    } catch (error) {
      // Publish profile completion failed event
      await this.publishProfileCompletionFailedEvent(
        user,
        'PROFILE_UPDATE_FAILED',
        'Profile completion failed due to system error',
        [],
        ipAddress,
        userAgent
      );
      
      throw new BadRequestException({
        code: 'PROFILE_UPDATE_FAILED',
        message: 'Profile completion failed due to system error',
      });
    }
  }

  async uploadProfilePhoto(userId: string, photoUrl: string, fileSize: number, fileType: string, ipAddress: string, userAgent: string): Promise<ApiResponseDto<PhotoUploadResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User profile not found',
      });
    }

    const uploadedAt = new Date();

    await this.userRepository.update(userId, {
      profilePhotoUrl: photoUrl,
    });

    // Publish photo uploaded event
    await this.publishPhotoUploadedEvent(user, photoUrl, fileSize, fileType, ipAddress, userAgent, uploadedAt);

    const responseData: PhotoUploadResponseDto = {
      userId: user.userId,
      profilePhotoUrl: photoUrl,
      uploadedAt: uploadedAt.toISOString(),
    };

    return new ApiResponseDto('PHOTO_UPLOADED', 'Profile photo uploaded successfully', responseData);
  }

  private async publishProfileCompletionStartedEvent(user: User, ipAddress: string, userAgent: string): Promise<void> {
    const event = {
      eventId: crypto.randomUUID(),
      eventType: 'profile.completion.started',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        fullName: user.fullName,
        ipAddress,
        userAgent,
        startedAt: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private async publishProfileCompletedEvent(
    user: User,
    updateData: UpdateProfileDto,
    ipAddress: string,
    userAgent: string,
    completedAt: Date
  ): Promise<void> {
    const event = {
      eventId: crypto.randomUUID(),
      eventType: 'profile.completed',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        fullName: user.fullName,
        profileData: {
          personalInfoCompleted: true,
          professionalInfoCompleted: true,
          photoUploaded: !!user.profilePhotoUrl,
        },
        completedAt: completedAt.toISOString(),
        ipAddress,
        userAgent,
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private async publishPhotoUploadedEvent(
    user: User,
    photoUrl: string,
    fileSize: number,
    fileType: string,
    ipAddress: string,
    userAgent: string,
    uploadedAt: Date
  ): Promise<void> {
    const event = {
      eventId: crypto.randomUUID(),
      eventType: 'profile.photo.uploaded',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        photoUrl,
        fileSize,
        fileType,
        uploadedAt: uploadedAt.toISOString(),
        ipAddress,
        userAgent,
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private async publishProfileCompletionFailedEvent(
    user: User,
    errorCode: string,
    errorMessage: string,
    validationErrors: any[],
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    const event = {
      eventId: crypto.randomUUID(),
      eventType: 'profile.completion.failed',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        errorCode,
        errorMessage,
        validationErrors,
        failedAt: new Date().toISOString(),
        ipAddress,
        userAgent,
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }
}