import { Injectable, NotFoundException, BadRequestException, ConflictException, GoneException, HttpException, HttpStatus, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../user/user.entity';
import { EmailVerificationToken } from './email-verification-token.entity';
import { EmailService } from '../../infrastructure/email/email.service';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailVerificationResponseDto } from './dto/email-verification-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDataDto } from './dto/login-response.dto';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';
import { Language } from '../../shared/enums/language.enum';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private resendAttempts = new Map<string, { count: number; lastAttempt: number }>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerificationToken)
    private emailVerificationTokenRepository: Repository<EmailVerificationToken>,
    private emailService: EmailService,
    private messagingService: MessagingService,
  ) {}

  async resendVerification(resendDto: ResendVerificationDto): Promise<ApiResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: resendDto.email },
      relations: ['tenant'],
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User with this email address not found',
      });
    }

    // Rate limiting: max 3 attempts per hour
    const now = Date.now();
    const attempts = this.resendAttempts.get(resendDto.email);
    
    if (attempts) {
      const hoursPassed = (now - attempts.lastAttempt) / (1000 * 60 * 60);
      
      if (hoursPassed < 1 && attempts.count >= 3) {
        throw new BadRequestException({
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Please wait before requesting another verification email',
        });
      }
      
      if (hoursPassed >= 1) {
        this.resendAttempts.set(resendDto.email, { count: 1, lastAttempt: now });
      } else {
        this.resendAttempts.set(resendDto.email, { 
          count: attempts.count + 1, 
          lastAttempt: now 
        });
      }
    } else {
      this.resendAttempts.set(resendDto.email, { count: 1, lastAttempt: now });
    }

    try {
      await this.emailService.sendVerificationEmail(user.email, user.fullName, user.tenantId, user.userId, user.tenant.preferredLanguage);
      
      return new ApiResponseDto('VERIFICATION_SENT', 'Verification email sent successfully');
    } catch (error) {
      throw new BadRequestException({
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send verification email',
      });
    }
  }

  async verifyEmail(verifyDto: VerifyEmailDto): Promise<ApiResponseDto<EmailVerificationResponseDto>> {
    // Validate token exists and not empty
    if (!verifyDto.token) {
      throw new BadRequestException({
        code: 'MISSING_TOKEN',
        message: 'Verification token is required',
      });
    }

    // Find the verification token
    const tokenRecord = await this.emailVerificationTokenRepository.findOne({
      where: { tokenValue: verifyDto.token },
      relations: ['user', 'user.tenant'],
    });

    if (!tokenRecord) {
      throw new NotFoundException({
        code: 'TOKEN_NOT_FOUND',
        message: 'Verification link not found',
      });
    }

    // Check if token is already used
    if (tokenRecord.usedAt) {
      throw new GoneException({
        code: 'TOKEN_ALREADY_USED',
        message: 'Verification link has already been used',
      });
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      throw new GoneException({
        code: 'TOKEN_EXPIRED',
        message: 'Verification link has expired',
      });
    }

    const user = tokenRecord.user;

    // Check if email is already verified
    if (user.emailVerifiedAt) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_VERIFIED',
        message: 'Email address is already verified',
      });
    }

    // Check account status
    if (user.status === UserStatus.SUSPENDED) {
      throw new HttpException(
        {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Account is no longer available',
        },
        HttpStatus.LOCKED,
      );
    }

    try {
      // Mark token as used
      tokenRecord.usedAt = new Date();
      await this.emailVerificationTokenRepository.save(tokenRecord);

      // Update user status and email verification
      const verifiedAt = new Date();
      user.emailVerifiedAt = verifiedAt;
      user.status = UserStatus.ACTIVE;
      await this.userRepository.save(user);

      // Publish email verified event
      await this.publishEmailVerifiedEvent(user, tokenRecord.tokenValue);

      const responseData = new EmailVerificationResponseDto(
        user.userId,
        user.email,
        verifiedAt,
        '/login',
      );

      return new ApiResponseDto('EMAIL_VERIFIED', 'Email address verified successfully', responseData);
    } catch (error) {
      // Publish verification failed event
      await this.publishEmailVerificationFailedEvent(user, tokenRecord.tokenValue, 'Database error during verification');

      throw new BadRequestException({
        code: 'VERIFICATION_FAILED',
        message: 'Email verification failed due to system error',
      });
    }
  }

  private async publishEmailVerifiedEvent(user: User, verificationToken: string): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'email.verified',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        verifiedAt: user.emailVerifiedAt?.toISOString() || new Date().toISOString(),
        verificationToken,
        ipAddress: '127.0.0.1', // TODO: Get actual IP from request
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private async publishEmailVerificationFailedEvent(user: User, verificationToken: string, failureReason: string): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'email.verification.failed',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        verificationToken,
        failureReason,
        ipAddress: '127.0.0.1', // TODO: Get actual IP from request
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<ApiResponseDto<LoginResponseDataDto>> {
    // Validate input
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException({
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Please complete all required fields',
      });
    }

    // Get user with tenant relation
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['tenant'],
    });

    // Check if account exists (generic error for security)
    if (!user) {
      await this.logFailedLogin(
        loginDto.email,
        null, // tenantId - null when user doesn't exist
        null, // userId - null when user doesn't exist
        'invalid_credentials',
        ipAddress,
        userAgent
      );
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.logFailedLogin(
        user.email,
        user.tenantId,
        user.userId,
        'account_locked',
        ipAddress,
        userAgent
      );
      throw new ForbiddenException({
        code: 'ACCOUNT_LOCKED',
        message: 'Account is temporarily locked. Please try again later or reset your password',
      });
    }

    // Check account status
    if (user.status !== UserStatus.ACTIVE) {
      await this.logFailedLogin(
        user.email,
        user.tenantId,
        user.userId,
        'account_not_verified',
        ipAddress,
        userAgent
      );
      throw new UnauthorizedException({
        code: 'ACCOUNT_NOT_VERIFIED',
        message: 'Account is not active. Please verify your email address',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user, ipAddress, userAgent);
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.resetFailedLogins(user);
    }

    // Create session
    const sessionData = this.createSession();
    
    // Determine language (user preference or tenant default)
    const language = loginDto.preferredLanguage || user.tenant.preferredLanguage;

    // Build response
    const responseData: LoginResponseDataDto = {
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        tenantId: user.tenantId,
        status: user.status,
      },
      tenant: {
        tenantId: user.tenant.tenantId,
        hospitalName: user.tenant.hospitalName,
        subdomain: user.tenant.subdomain,
        preferredLanguage: user.tenant.preferredLanguage,
      },
      session: sessionData,
    };

    // Publish successful login event
    await this.publishLoginSuccessEvent(user, language, ipAddress, userAgent);

    return new ApiResponseDto('LOGIN_SUCCESS', 'Login successful', responseData);
  }

  private async handleFailedLogin(user: User, ipAddress: string, userAgent: string): Promise<void> {
    user.failedLoginAttempts += 1;
    user.lastFailedLoginAt = new Date();

    // Lock account after 5 failed attempts (30 minutes)
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await this.userRepository.save(user);
      await this.publishAccountLockedEvent(user, ipAddress, userAgent);
    } else {
      await this.userRepository.save(user);
    }

    await this.logFailedLogin(
      user.email,
      user.tenantId,
      user.userId,
      'invalid_credentials',
      ipAddress,
      userAgent
    );
  }

  private async resetFailedLogins(user: User): Promise<void> {
    const wasLocked = !!user.lockedUntil;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastFailedLoginAt = null;
    await this.userRepository.save(user);

    if (wasLocked) {
      await this.publishAccountUnlockedEvent(user);
    }
  }

  private createSession(): { sessionId: string; expiresAt: string; csrfToken: string } {
    const sessionId = uuidv4();
    const csrfToken = uuidv4();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    return {
      sessionId,
      expiresAt: expiresAt.toISOString(),
      csrfToken,
    };
  }

  private async logFailedLogin(
    email: string, 
    tenantId: string | null, 
    userId: string | null, 
    failureReason: string, 
    ipAddress: string, 
    userAgent: string
  ): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'user.login.failed',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        email,
        tenantId,
        userId,
        failureReason,
        ipAddress,
        userAgent,
        attemptedAt: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private async publishLoginSuccessEvent(user: User, language: Language, ipAddress: string, userAgent: string): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'user.login.success',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        fullName: user.fullName,
        preferredLanguage: language,
        ipAddress,
        userAgent,
        loginTimestamp: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private async publishAccountLockedEvent(user: User, ipAddress: string, userAgent: string): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'user.account.locked',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        lockoutReason: 'FAILED_LOGIN_ATTEMPTS',
        lockedUntil: user.lockedUntil?.toISOString(),
        ipAddress,
        userAgent,
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private async publishAccountUnlockedEvent(user: User): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'user.account.unlocked',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        unlockReason: 'SUCCESSFUL_LOGIN',
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }
}
