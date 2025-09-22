import { ApiProperty } from '@nestjs/swagger';
import { Language } from '../../../shared/enums/language.enum';

export class LoginTenantInfoDto {
  @ApiProperty({ description: 'Hospital name' })
  hospitalName: string;

  @ApiProperty({ description: 'Tenant subdomain' })
  subdomain: string;

  @ApiProperty({ description: 'Tenant preferred language', enum: Language })
  preferredLanguage: Language;
}

export class LoginResponseDataDto {
  @ApiProperty({ description: 'User unique identifier' })
  userId: string;

  @ApiProperty({ description: 'Tenant unique identifier' })
  tenantId: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'Tenant information' })
  tenantInfo: LoginTenantInfoDto;

  @ApiProperty({ description: 'Session token' })
  sessionToken: string;

  @ApiProperty({ description: 'Session expiration time in ISO8601 format' })
  sessionExpiresAt: string;

  @ApiProperty({ description: 'CSRF token for session protection' })
  csrfToken: string;
}