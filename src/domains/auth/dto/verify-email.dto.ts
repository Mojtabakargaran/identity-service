import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Language } from '../../../shared/enums/language.enum';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email verification token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Language for response page', enum: Language, required: false })
  @IsOptional()
  @IsEnum(Language)
  lang?: Language;
}
