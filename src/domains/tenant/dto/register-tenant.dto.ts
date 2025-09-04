import { IsString, IsEmail, IsNotEmpty, MinLength, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
  @ApiProperty({ description: 'Full name of the hospital owner' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ description: 'Email address of the hospital owner' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number of the hospital owner' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, { message: 'Please enter a valid phone number' })
  phoneNumber: string;

  @ApiProperty({ description: 'Password for the account (min 8 chars, mixed case, numbers, special chars)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase letters, lowercase letters, numbers, and special characters'
  })
  password: string;

  @ApiProperty({ description: 'Hospital name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9\s\-\.\']+$/, { message: 'Hospital name must be in latin characters only' })
  hospitalName: string;

  @ApiProperty({ description: 'Hospital license number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  hospitalLicenseNumber: string;

  @ApiProperty({ description: 'Hospital street address' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  hospitalAddressStreet: string;

  @ApiProperty({ description: 'Hospital city' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  hospitalAddressCity: string;

  @ApiProperty({ description: 'Hospital state' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  hospitalAddressState: string;

  @ApiProperty({ description: 'Hospital postal code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  hospitalAddressPostalCode: string;

  @ApiProperty({ description: 'Hospital contact phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, { message: 'Please enter a valid phone number' })
  hospitalContactPhone: string;

  @ApiProperty({ description: 'Hospital contact email address' })
  @IsEmail()
  @IsNotEmpty()
  hospitalContactEmail: string;
}
