import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { EmailService } from '../../infrastructure/email/email.service';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';

@Injectable()
export class AuthService {
  private resendAttempts = new Map<string, { count: number; lastAttempt: number }>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
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
      await this.emailService.sendVerificationEmail(user.email, user.fullName, user.tenantId, user.tenant.preferredLanguage);
      
      return new ApiResponseDto('VERIFICATION_SENT', 'Verification email sent successfully');
    } catch (error) {
      throw new BadRequestException({
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send verification email',
      });
    }
  }
}
