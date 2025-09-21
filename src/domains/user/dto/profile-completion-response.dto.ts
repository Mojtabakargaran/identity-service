import { ApiProperty } from '@nestjs/swagger';

export class ProfileCompletionResponseDto {
  @ApiProperty({ description: 'User unique identifier', example: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Whether profile is completed', example: true })
  profileCompleted: boolean;

  @ApiProperty({ 
    description: 'Profile completion timestamp', 
    example: '2025-09-20T10:30:00Z'
  })
  profileCompletedAt: string;

  @ApiProperty({ 
    description: 'Redirect URL after completion', 
    example: '/hospital-setup'
  })
  redirectUrl: string;
}