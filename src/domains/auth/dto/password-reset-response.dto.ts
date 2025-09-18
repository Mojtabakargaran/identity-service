import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Response code',
    example: 'PASSWORD_RESET_SENT',
  })
  code: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Password reset instructions have been sent to your email address',
  })
  message: string;
}

export class ValidateResetTokenResponseDto {
  @ApiProperty({
    description: 'Response code',
    example: 'TOKEN_VALID',
  })
  code: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Reset token is valid',
  })
  message: string;

  @ApiProperty({
    description: 'Token validation data',
  })
  data: {
    tokenValid: boolean;
    email: string;
    expiresAt: string;
  };
}

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Response code',
    example: 'PASSWORD_RESET_SUCCESS',
  })
  code: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Your password has been successfully reset',
  })
  message: string;

  @ApiProperty({
    description: 'Password reset completion data',
  })
  data: {
    userId: string;
    email: string;
    resetAt: string;
    redirectUrl: string;
  };
}