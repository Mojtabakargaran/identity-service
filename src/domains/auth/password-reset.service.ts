import { Injectable, BadRequestException, NotFoundException, GoneException, UnprocessableEntityException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { User } from '../user/user.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { PasswordResetRateLimit } from './password-reset-rate-limit.entity';
import { EmailService } from '../../infrastructure/email/email.service';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ValidateResetTokenDto } from './dto/validate-reset-token.dto';
import { ForgotPasswordResponseDto, ValidateResetTokenResponseDto, ResetPasswordResponseDto } from './dto/password-reset-response.dto';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordResetService {
  private readonly RATE_LIMIT_WINDOW_HOURS = 1;
  private readonly RATE_LIMIT_MAX_ATTEMPTS = 3;
  private readonly TOKEN_EXPIRY_HOURS = 24;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(PasswordResetRateLimit)
    private passwordResetRateLimitRepository: Repository<PasswordResetRateLimit>,
    private emailService: EmailService,
    private messagingService: MessagingService,
  ) {}

  async requestPasswordReset(
    forgotPasswordDto: ForgotPasswordDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<ApiResponseDto> {
    const { email } = forgotPasswordDto;

    // Check rate limiting
    await this.checkRateLimit(email, ipAddress);

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });

    if (!user) {
      // Generic response for security (don't reveal if email exists)
      await this.publishPasswordResetRequestedEvent(null, null, email, ipAddress, userAgent);
      return new ApiResponseDto('PASSWORD_RESET_SENT', 'If the email address exists in our system, you will receive reset instructions');
    }

    try {
      // Invalidate previous tokens
      await this.invalidatePreviousTokens(user.userId);

      // Generate secure token
      const tokenValue = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      // Create token record
      const resetToken = this.passwordResetTokenRepository.create({
        userId: user.userId,
        tokenValue,
        expiresAt,
      });

      await this.passwordResetTokenRepository.save(resetToken);

      // Send email
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.fullName,
        tokenValue,
        user.tenant.preferredLanguage,
      );

      // Publish events
      await this.publishPasswordResetRequestedEvent(user.userId, user.tenantId, email, ipAddress, userAgent);
      await this.publishPasswordResetEmailSentEvent(user, resetToken);

      return new ApiResponseDto('PASSWORD_RESET_SENT', 'Password reset instructions have been sent to your email address');
    } catch (error) {
      await this.publishPasswordResetFailedEvent(
        user.userId,
        user.tenantId,
        email,
        null,
        'email_delivery_failed',
        ipAddress,
        userAgent,
      );

      throw new HttpException(
        {
          code: 'EMAIL_DELIVERY_FAILED',
          message: 'Unable to send reset email. Please try again later',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateResetToken(
    validateDto: ValidateResetTokenDto,
  ): Promise<ApiResponseDto> {
    const { token } = validateDto;

    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { tokenValue: token },
      relations: ['user', 'user.tenant'],
    });

    if (!resetToken) {
      throw new NotFoundException({
        code: 'TOKEN_NOT_FOUND',
        message: 'Invalid password reset link. Please request a new one',
      });
    }

    if (resetToken.usedAt) {
      throw new GoneException({
        code: 'TOKEN_ALREADY_USED',
        message: 'This password reset link has already been used. Please request a new one if needed',
      });
    }

    if (resetToken.expiresAt < new Date()) {
      throw new GoneException({
        code: 'TOKEN_EXPIRED',
        message: 'This password reset link has expired. Please request a new one',
      });
    }

    // Check if account is locked
    if (resetToken.user.lockedUntil && resetToken.user.lockedUntil > new Date()) {
      throw new UnprocessableEntityException({
        code: 'ACCOUNT_LOCKED',
        message: 'Your account is currently locked. Please contact support',
      });
    }

    const responseData = {
      tokenValid: true,
      email: resetToken.user.email,
      expiresAt: resetToken.expiresAt.toISOString(),
    };

    return new ApiResponseDto('TOKEN_VALID', 'Reset token is valid', responseData);
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<ApiResponseDto> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException({
        code: 'PASSWORD_MISMATCH',
        message: 'Passwords do not match. Please try again',
      });
    }

    // Find and validate token
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { tokenValue: token },
      relations: ['user', 'user.tenant'],
    });

    if (!resetToken) {
      throw new NotFoundException({
        code: 'TOKEN_NOT_FOUND',
        message: 'Invalid password reset link. Please request a new one',
      });
    }

    if (resetToken.usedAt) {
      throw new GoneException({
        code: 'TOKEN_ALREADY_USED',
        message: 'This password reset link has already been used. Please request a new one if needed',
      });
    }

    if (resetToken.expiresAt < new Date()) {
      throw new GoneException({
        code: 'TOKEN_EXPIRED',
        message: 'This password reset link has expired. Please request a new one',
      });
    }

    // Check if account is locked
    if (resetToken.user.lockedUntil && resetToken.user.lockedUntil > new Date()) {
      await this.publishPasswordResetFailedEvent(
        resetToken.user.userId,
        resetToken.user.tenantId,
        resetToken.user.email,
        token,
        'account_locked',
        ipAddress,
        userAgent,
      );

      throw new UnprocessableEntityException({
        code: 'ACCOUNT_LOCKED',
        message: 'Your account is currently locked. Please contact support',
      });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, resetToken.user.passwordHash);
    if (isSamePassword) {
      await this.publishPasswordResetFailedEvent(
        resetToken.user.userId,
        resetToken.user.tenantId,
        resetToken.user.email,
        token,
        'same_as_current',
        ipAddress,
        userAgent,
      );

      throw new BadRequestException({
        code: 'SAME_AS_CURRENT',
        message: 'New password cannot be the same as your current password',
      });
    }

    try {
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password and reset failed login attempts
      await this.userRepository.update(resetToken.user.userId, {
        passwordHash: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastFailedLoginAt: null,
      });

      // Mark token as used
      await this.passwordResetTokenRepository.update(resetToken.tokenId, {
        usedAt: new Date(),
      });

      // Publish success event
      await this.publishPasswordResetCompletedEvent(resetToken.user, token, ipAddress, userAgent);

      const responseData = {
        userId: resetToken.user.userId,
        email: resetToken.user.email,
        resetAt: new Date().toISOString(),
        redirectUrl: '/login',
      };

      return new ApiResponseDto('PASSWORD_RESET_SUCCESS', 'Your password has been successfully reset', responseData);
    } catch (error) {
      await this.publishPasswordResetFailedEvent(
        resetToken.user.userId,
        resetToken.user.tenantId,
        resetToken.user.email,
        token,
        'password_update_failed',
        ipAddress,
        userAgent,
      );

      throw new HttpException(
        {
          code: 'PASSWORD_UPDATE_FAILED',
          message: 'Password reset failed due to system error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async checkRateLimit(email: string, ipAddress: string): Promise<void> {
    const windowStart = new Date(Date.now() - this.RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000);

    // Check for existing rate limit record
    let rateLimit = await this.passwordResetRateLimitRepository.findOne({
      where: [
        { email, windowStart: MoreThan(windowStart) },
        { ipAddress, windowStart: MoreThan(windowStart) },
      ],
    });

    if (rateLimit && rateLimit.requestCount >= this.RATE_LIMIT_MAX_ATTEMPTS) {
      await this.publishRateLimitExceededEvent(email, null, ipAddress, rateLimit.requestCount, rateLimit.windowStart);

      throw new HttpException(
        {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many reset requests. Please try again later',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Update or create rate limit record
    if (rateLimit) {
      await this.passwordResetRateLimitRepository.update(rateLimit.rateLimitId, {
        requestCount: rateLimit.requestCount + 1,
      });
    } else {
      const newRateLimit = this.passwordResetRateLimitRepository.create({
        email,
        ipAddress,
        requestCount: 1,
        windowStart: new Date(),
      });
      await this.passwordResetRateLimitRepository.save(newRateLimit);
    }
  }

  private async invalidatePreviousTokens(userId: string): Promise<void> {
    await this.passwordResetTokenRepository.update(
      { userId, usedAt: IsNull() },
      { usedAt: new Date() },
    );
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Event publishing methods
  private async publishPasswordResetRequestedEvent(
    userId: string | null,
    tenantId: string | null,
    email: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'password.reset.requested',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId,
        tenantId,
        email,
        ipAddress,
        userAgent,
        requestedAt: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private async publishPasswordResetEmailSentEvent(
    user: User,
    resetToken: PasswordResetToken,
  ): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'password.reset.email.sent',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        resetToken: resetToken.tokenValue,
        expiresAt: resetToken.expiresAt.toISOString(),
        requestedAt: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('notification-events', event);
  }

  private async publishPasswordResetCompletedEvent(
    user: User,
    resetToken: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'password.reset.completed',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: user.userId,
        tenantId: user.tenantId,
        email: user.email,
        resetToken,
        ipAddress,
        userAgent,
        resetAt: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private async publishPasswordResetFailedEvent(
    userId: string,
    tenantId: string,
    email: string,
    resetToken: string | null,
    failureReason: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'password.reset.failed',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId,
        tenantId,
        email,
        resetToken,
        failureReason,
        ipAddress,
        userAgent,
        attemptedAt: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }

  private async publishRateLimitExceededEvent(
    email: string,
    tenantId: string | null,
    ipAddress: string,
    requestCount: number,
    windowStart: Date,
  ): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'password.reset.rate.limit.exceeded',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        email,
        tenantId,
        ipAddress,
        userAgent: 'Unknown',
        requestCount,
        windowStart: windowStart.toISOString(),
        blockedAt: new Date().toISOString(),
      },
    };

    await this.messagingService.publishEvent('user-events', event);
  }
}