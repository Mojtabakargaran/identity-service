import { Controller, Get, Put, Post, Body, HttpStatus, HttpCode, Req, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ProfileCompletionResponseDto } from './dto/profile-completion-response.dto';
import { PhotoUploadResponseDto } from './dto/photo-upload-response.dto';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';
import { SessionAuthGuard } from '../../shared/guards/session-auth.guard';

@ApiTags('User Profile')
@Controller('api/v1/profile')
@UseGuards(SessionAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile data' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile data retrieved successfully',
    type: ApiResponseDto<ProfileResponseDto>
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User profile not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'System error occurred while retrieving profile data' 
  })
  async getProfile(@Req() req: Request): Promise<ApiResponseDto<ProfileResponseDto>> {
    // Extract userId from authenticated request (set by SessionAuthGuard)
    const userId = (req as any).user?.userId;
    if (!userId) {
      throw new BadRequestException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }
    
    return this.userService.getProfile(userId);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile completed successfully',
    type: ApiResponseDto<ProfileCompletionResponseDto>
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid data or validation errors' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Profile already completed' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Profile completion failed due to system error' 
  })
  async updateProfile(
    @Body() updateData: UpdateProfileDto,
    @Req() req: Request
  ): Promise<ApiResponseDto<ProfileCompletionResponseDto>> {
    // Extract userId from JWT token
    const userId = (req as any).user?.userId;
    if (!userId) {
      throw new BadRequestException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }

    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('User-Agent') || '';
    
    return this.userService.updateProfile(userId, updateData, ipAddress, userAgent);
  }

  @Post('photo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Profile photo file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile photo uploaded successfully',
    type: ApiResponseDto<PhotoUploadResponseDto>
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid file type, size, or dimensions' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required' 
  })
  @ApiResponse({ 
    status: 413, 
    description: 'File size exceeds maximum allowed size' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Photo upload failed due to system error' 
  })
  @UseInterceptors(FileInterceptor('photo', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException({
          code: 'INVALID_FILE_TYPE',
          message: 'Profile photo must be JPG, PNG, or GIF format',
        }), false);
      }
    },
  }))
  async uploadPhoto(
    @UploadedFile() file: any,
    @Req() req: Request
  ): Promise<ApiResponseDto<PhotoUploadResponseDto>> {
    if (!file) {
      throw new BadRequestException({
        code: 'MISSING_FILE',
        message: 'Profile photo file is required',
      });
    }

    // Extract userId from JWT token
    const userId = (req as any).user?.userId;
    if (!userId) {
      throw new BadRequestException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }

    // For now, we'll simulate storing the file and return a mock URL
    // In a real implementation, you would upload to a cloud storage service
    const photoUrl = `https://storage.example.com/photos/${userId}-${Date.now()}.${file.originalname.split('.').pop()}`;
    
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('User-Agent') || '';
    
    return this.userService.uploadProfilePhoto(
      userId, 
      photoUrl, 
      file.size, 
      file.mimetype, 
      ipAddress, 
      userAgent
    );
  }
}