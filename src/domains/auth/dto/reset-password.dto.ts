import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'abc123-def456-ghi789',
  })
  @IsString({ message: 'Password reset token is required' })
  @IsNotEmpty({ message: 'Password reset token is required' })
  token: string;

  @ApiProperty({
    description: 'New password for the user account',
    example: 'MySecureP@ssw0rd',
    minLength: 8,
  })
  @IsString({ message: 'Password is required' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation of the new password',
    example: 'MySecureP@ssw0rd',
  })
  @IsString({ message: 'Password confirmation is required' })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  confirmPassword: string;
}