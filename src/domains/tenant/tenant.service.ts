import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Tenant } from './tenant.entity';
import { User, UserStatus } from '../user/user.entity';
import { UserRole, RoleType } from '../user/user-role.entity';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { EmailService } from '../../infrastructure/email/email.service';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private emailService: EmailService,
    private messagingService: MessagingService,
  ) {}

  async registerTenant(registerDto: RegisterTenantDto): Promise<ApiResponseDto> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException({
        code: 'EMAIL_EXISTS',
        message: 'An account with this email address already exists',
      });
    }

    // Check if hospital name already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { hospitalName: registerDto.hospitalName },
    });
    if (existingTenant) {
      throw new ConflictException({
        code: 'HOSPITAL_NAME_EXISTS',
        message: 'A hospital with this name is already registered',
      });
    }

    try {
      // Generate unique tenant ID and subdomain
      const tenantId = uuidv4();
      const subdomain = this.generateSubdomain(registerDto.hospitalName);

      // Hash password
      const passwordHash = await bcrypt.hash(registerDto.password, 12);

      // Create tenant
      const tenant = this.tenantRepository.create({
        tenantId,
        hospitalName: registerDto.hospitalName,
        subdomain,
        hospitalLicenseNumber: registerDto.hospitalLicenseNumber,
        hospitalAddressStreet: registerDto.hospitalAddressStreet,
        hospitalAddressCity: registerDto.hospitalAddressCity,
        hospitalAddressState: registerDto.hospitalAddressState,
        hospitalAddressPostalCode: registerDto.hospitalAddressPostalCode,
        hospitalContactPhone: registerDto.hospitalContactPhone,
        hospitalContactEmail: registerDto.hospitalContactEmail,
      });

      const savedTenant = await this.tenantRepository.save(tenant);

      // Create user
      const userId = uuidv4();
      const user = this.userRepository.create({
        userId,
        tenantId: savedTenant.tenantId,
        fullName: registerDto.fullName,
        email: registerDto.email,
        phoneNumber: registerDto.phoneNumber,
        passwordHash,
        status: UserStatus.PENDING_VERIFICATION,
        emailVerifiedAt: null,
      });

      const savedUser = await this.userRepository.save(user);

      // Assign owner role
      const userRole = this.userRoleRepository.create({
        userRoleId: uuidv4(),
        userId: savedUser.userId,
        roleType: RoleType.OWNER,
        assignedBy: null,
      });

      await this.userRoleRepository.save(userRole);

      // Send verification email
      try {
        await this.emailService.sendVerificationEmail(savedUser.email, savedUser.fullName, tenantId);
      } catch (emailError) {
        console.warn('Email verification sending failed:', emailError);
      }

      // Publish events
      await this.publishTenantRegisteredEvent(savedTenant, savedUser);
      await this.publishUserCreatedEvent(savedUser, RoleType.OWNER);

      return new ApiResponseDto('REGISTRATION_SUCCESS', 'Hospital registration completed successfully', {
        tenantId: savedTenant.tenantId,
        subdomain: savedTenant.subdomain,
        userId: savedUser.userId,
        status: savedUser.status,
      });
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException({
        code: 'TENANT_CREATION_FAILED',
        message: 'Registration temporarily unavailable',
      });
    }
  }

  private generateSubdomain(hospitalName: string): string {
    // Convert to lowercase, remove special chars, replace spaces with hyphens
    let subdomain = hospitalName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    // Add timestamp suffix to ensure uniqueness
    subdomain += '-' + Date.now().toString(36);
    
    return subdomain;
  }

  private async publishTenantRegisteredEvent(tenant: Tenant, owner: User): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'tenant.registered',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        tenantId: tenant.tenantId,
        hospitalName: tenant.hospitalName,
        subdomain: tenant.subdomain,
        ownerId: owner.userId,
        ownerEmail: owner.email,
        hospitalLicenseNumber: tenant.hospitalLicenseNumber,
        createdAt: tenant.createdAt.toISOString(),
      },
    };

    await this.messagingService.publishEvent('tenant-events', event);
  }

  private async publishUserCreatedEvent(user: User, roleType: RoleType): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'user.created',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roleType,
        createdAt: user.createdAt.toISOString(),
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }
}
