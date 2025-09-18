import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateResetTokenDto {
  @ApiProperty({
    description: 'Password reset token to validate',
    example: 'abc123-def456-ghi789',
  })
  @IsString({ message: 'Password reset token is required' })
  token: string;

  @ApiProperty({
    description: 'Language for response page',
    example: 'en',
    enum: ['en', 'fa'],
    required: false,
  })
  @IsOptional()
  @IsIn(['en', 'fa'], { message: 'Language must be either "en" or "fa"' })
  lang?: string;
}