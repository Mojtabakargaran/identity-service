import { Controller, Get, Put, Body, HttpStatus, HttpCode, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { InstitutionalProfileService } from './institutional-profile.service';
import { UpdateInstitutionalProfileDto } from './dto/update-institutional-profile.dto';
import { UpdateOperatingHoursDto, OperatingHoursResponseDto, OperatingHoursUpdateResponseDto } from './dto/operating-hours.dto';
import { DepartmentsListResponseDto } from './dto/departments-response.dto';
import { InstitutionalProfileResponseDto } from './dto/institutional-profile-response.dto';
import { InstitutionalProfileCompletionResponseDto } from './dto/institutional-profile-completion-response.dto';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';
import { SessionAuthGuard } from '../../shared/guards/session-auth.guard';

@ApiTags('Institutional Profile')
@Controller('api/v1/institutional-profile')
@UseGuards(SessionAuthGuard)
export class InstitutionalProfileController {
  constructor(private readonly institutionalProfileService: InstitutionalProfileService) {}

  @Get('departments')
  @ApiOperation({ summary: 'Get available medical departments' })
  @ApiResponse({ 
    status: 200, 
    description: 'Medical departments retrieved successfully',
    type: DepartmentsListResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Database error occurred' 
  })
  async getDepartments(): Promise<DepartmentsListResponseDto> {
    return this.institutionalProfileService.getDepartments();
  }

  @Get()
  @ApiOperation({ summary: 'Get hospital institutional profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Institutional profile retrieved successfully',
    type: InstitutionalProfileResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tenant not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Database error occurred' 
  })
  async getInstitutionalProfile(@Req() req: Request): Promise<InstitutionalProfileResponseDto> {
    const tenantId = (req as any).user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }
    
    return this.institutionalProfileService.getInstitutionalProfile(tenantId);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete or update hospital institutional profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Institutional profile completed successfully',
    type: InstitutionalProfileCompletionResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid data provided' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Institutional profile already complete' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'System error occurred' 
  })
  async updateInstitutionalProfile(
    @Req() req: Request,
    @Body() updateDto: UpdateInstitutionalProfileDto
  ): Promise<InstitutionalProfileCompletionResponseDto> {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.userId;
    
    if (!tenantId || !userId) {
      throw new BadRequestException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }
    
    return this.institutionalProfileService.updateInstitutionalProfile(tenantId, userId, updateDto);
  }

  @Get('operating-hours')
  @ApiOperation({ summary: 'Get hospital operating hours' })
  @ApiResponse({ 
    status: 200, 
    description: 'Operating hours retrieved successfully',
    type: OperatingHoursResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Operating hours not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Database error occurred' 
  })
  async getOperatingHours(@Req() req: Request): Promise<OperatingHoursResponseDto> {
    const tenantId = (req as any).user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }
    
    return this.institutionalProfileService.getOperatingHours(tenantId);
  }

  @Put('operating-hours')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update hospital operating hours' })
  @ApiResponse({ 
    status: 200, 
    description: 'Operating hours updated successfully',
    type: OperatingHoursUpdateResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid operating hours data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'System error occurred' 
  })
  async updateOperatingHours(
    @Req() req: Request,
    @Body() updateDto: UpdateOperatingHoursDto
  ): Promise<OperatingHoursUpdateResponseDto> {
    const tenantId = (req as any).user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }
    
    return this.institutionalProfileService.updateOperatingHours(tenantId, updateDto);
  }
}