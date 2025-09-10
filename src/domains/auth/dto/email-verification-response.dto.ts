import { ApiProperty } from '@nestjs/swagger';

export class EmailVerificationResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Verification timestamp' })
  verifiedAt: string;

  @ApiProperty({ description: 'Redirect URL' })
  redirectUrl: string;

  constructor(userId: string, email: string, verifiedAt: Date, redirectUrl: string = '/login') {
    this.userId = userId;
    this.email = email;
    this.verifiedAt = verifiedAt.toISOString();
    this.redirectUrl = redirectUrl;
  }
}
