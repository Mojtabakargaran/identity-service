import { ApiProperty } from '@nestjs/swagger';

export class PhotoUploadResponseDto {
  @ApiProperty({ description: 'User unique identifier', example: 'uuid' })
  userId: string;

  @ApiProperty({ 
    description: 'Uploaded photo URL', 
    example: 'https://storage.example.com/photos/user-123.jpg'
  })
  profilePhotoUrl: string;

  @ApiProperty({ 
    description: 'Upload timestamp', 
    example: '2025-09-20T10:30:00Z'
  })
  uploadedAt: string;
}