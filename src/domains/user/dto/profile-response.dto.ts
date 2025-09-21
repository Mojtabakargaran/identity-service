import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ description: 'User unique identifier', example: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'User full name', example: 'Dr. John Smith' })
  fullName: string;

  @ApiProperty({ description: 'User email address', example: 'john.smith@hospital.com' })
  email: string;

  @ApiProperty({ description: 'Whether profile is completed', example: true })
  profileCompleted: boolean;

  @ApiProperty({ 
    description: 'Profile completion timestamp', 
    example: '2025-09-20T10:30:00Z',
    nullable: true
  })
  profileCompletedAt: string | null;

  @ApiProperty({ description: 'Personal information' })
  personalInfo: {
    dateOfBirth: string | null;
    gender: string | null;
    nationalIdNumber: string | null;
    nationality: string | null;
  };

  @ApiProperty({ description: 'Professional information' })
  professionalInfo: {
    professionalLicenseNumber: string | null;
    medicalSpecialization: string | null;
    yearsOfExperience: number | null;
    educationalBackground: string | null;
  };

  @ApiProperty({ 
    description: 'Profile photo URL', 
    example: 'https://storage.example.com/photos/user-123.jpg',
    nullable: true
  })
  profilePhotoUrl: string | null;

  @ApiProperty({ description: 'Hospital address information' })
  hospitalAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}