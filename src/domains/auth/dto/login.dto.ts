import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { Language } from '../../../shared/enums/language.enum';

export class LoginDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', example: 'SecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ 
    description: 'Preferred UI language', 
    enum: Language, 
    example: Language.ENGLISH,
    required: false 
  })
  @IsEnum(Language)
  @IsOptional()
  preferredLanguage?: Language;
}