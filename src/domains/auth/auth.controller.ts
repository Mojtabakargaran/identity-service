import { Controller, Post, Body, HttpStatus, HttpCode, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailVerificationResponseDto } from './dto/email-verification-response.dto';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully',
    type: EmailVerificationResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid token or missing token' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Token not found' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email already verified' 
  })
  @ApiResponse({ 
    status: 410, 
    description: 'Token expired or already used' 
  })
  @ApiResponse({ 
    status: 423, 
    description: 'Account suspended' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Verification failed due to system error' 
  })
  async verifyEmail(@Query() verifyDto: VerifyEmailDto): Promise<ApiResponseDto<EmailVerificationResponseDto>> {
    return this.authService.verifyEmail(verifyDto);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({ 
    status: 200, 
    description: 'Verification email sent successfully',
    type: ApiResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Rate limit exceeded' 
  })
  async resendVerification(@Body() resendDto: ResendVerificationDto): Promise<ApiResponseDto> {
    return this.authService.resendVerification(resendDto);
  }
}
