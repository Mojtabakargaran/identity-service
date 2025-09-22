import { ApiProperty } from '@nestjs/swagger';

export class InstitutionalProfileCompletionResponseDto {
  @ApiProperty({ description: 'Response code', example: 'INSTITUTIONAL_PROFILE_COMPLETED' })
  code: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Profile completion data' })
  data: {
    profileId: string;
    tenantId: string;
    profileCompleted: boolean;
    profileCompletedAt: string;
    redirectUrl: string;
  };
}