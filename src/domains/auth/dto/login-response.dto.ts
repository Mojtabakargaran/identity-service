import { ApiProperty } from '@nestjs/swagger';
import { Language } from '../../../shared/enums/language.enum';

export class LoginUserDataDto {
  @ApiProperty({ description: 'User unique identifier' })
  userId: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User tenant ID' })
  tenantId: string;

  @ApiProperty({ description: 'Account status' })
  status: string;
}

export class LoginTenantDataDto {
  @ApiProperty({ description: 'Tenant unique identifier' })
  tenantId: string;

  @ApiProperty({ description: 'Hospital name' })
  hospitalName: string;

  @ApiProperty({ description: 'Tenant subdomain' })
  subdomain: string;

  @ApiProperty({ description: 'Tenant preferred language', enum: Language })
  preferredLanguage: Language;
}

export class LoginSessionDataDto {
  @ApiProperty({ description: 'Session identifier' })
  sessionId: string;

  @ApiProperty({ description: 'Session expiration time' })
  expiresAt: string;

  @ApiProperty({ description: 'CSRF token for session protection' })
  csrfToken: string;
}

export class LoginResponseDataDto {
  @ApiProperty({ description: 'User information' })
  user: LoginUserDataDto;

  @ApiProperty({ description: 'Tenant information' })
  tenant: LoginTenantDataDto;

  @ApiProperty({ description: 'Session information' })
  session: LoginSessionDataDto;
}