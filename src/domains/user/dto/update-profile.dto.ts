import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Gender } from '../user.entity';

export class UpdateProfileDto {
  @ApiProperty({ 
    description: 'Date of birth in YYYY-MM-DD format', 
    example: '1985-05-15',
    type: 'string',
    format: 'date'
  })
  @IsDateString({}, { message: 'Please enter a valid date of birth' })
  dateOfBirth: string;

  @ApiProperty({ 
    description: 'Gender selection', 
    enum: Gender, 
    example: Gender.MALE 
  })
  @IsEnum(Gender, { message: 'Please select a valid gender' })
  gender: Gender;

  @ApiProperty({ 
    description: 'National identification number', 
    example: 'ID123456789',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100, { message: 'National ID number must not exceed 100 characters' })
  nationalIdNumber: string;

  @ApiProperty({ 
    description: 'Nationality', 
    example: 'American',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100, { message: 'Nationality must not exceed 100 characters' })
  nationality: string;

  @ApiProperty({ 
    description: 'Professional medical license number', 
    example: 'LIC789456123',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100, { message: 'Professional license number must not exceed 100 characters' })
  professionalLicenseNumber: string;

  @ApiProperty({ 
    description: 'Medical specialization', 
    example: 'Cardiology',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100, { message: 'Medical specialization must not exceed 100 characters' })
  medicalSpecialization: string;

  @ApiProperty({ 
    description: 'Years of professional experience', 
    example: 15,
    minimum: 0,
    maximum: 70
  })
  @IsInt({ message: 'Years of experience must be a valid number' })
  @Min(0, { message: 'Years of experience cannot be negative' })
  @Max(70, { message: 'Years of experience cannot exceed 70 years' })
  yearsOfExperience: number;

  @ApiProperty({ 
    description: 'Educational background description', 
    example: 'MD from Johns Hopkins University, Residency in Cardiology at Mayo Clinic'
  })
  @IsString()
  educationalBackground: string;
}