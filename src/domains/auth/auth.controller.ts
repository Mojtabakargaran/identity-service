import { Controller, Post, Body, HttpStatus, HttpCode, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { EmailVerificationResponseDto } from './dto/email-verification-response.dto';
import { LoginResponseDataDto } from './dto/login-response.dto';
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hospital owner login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: ApiResponseDto<LoginResponseDataDto>
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid email format or missing required fields' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials or account not verified' 
  })
  @ApiResponse({ 
    status: 423, 
    description: 'Account temporarily locked' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Rate limit exceeded' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Session creation failed or database error' 
  })
  async login(@Body() loginDto: LoginDto, @Req() req: Request): Promise<ApiResponseDto<LoginResponseDataDto>> {
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    return this.authService.login(loginDto, ipAddress, userAgent);
  }
}
