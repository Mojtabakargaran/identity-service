import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { SessionAuthGuard } from '../../shared/guards/session-auth.guard';
import {
  DashboardResponseDto,
  UserPreferencesResponseDto,
  UpdateUserPreferencesDto,
  UpdateUserPreferencesResponseDto,
  SystemStatusResponseDto,
} from './dto';

// Extended Request interface to include session
interface AuthenticatedRequest extends Request {
  session: {
    tenantId: string;
    userId: string;
  };
}

@ApiTags('Dashboard')
@Controller('api/v1/dashboard')
@UseGuards(SessionAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get consolidated dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: DashboardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Session is invalid or expired' })
  @ApiResponse({ status: 403, description: 'User does not have permission to view dashboard' })
  @ApiResponse({ status: 404, description: 'Hospital tenant not found or User not found' })
  @ApiResponse({ status: 500, description: 'System error occurred while retrieving dashboard data' })
  async getDashboard(@Req() req: AuthenticatedRequest): Promise<DashboardResponseDto> {
    const { tenantId, userId } = req.session;
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    return await this.dashboardService.getDashboard(tenantId, userId, ipAddress, userAgent);
  }

  @Get('user-preferences')
  @ApiOperation({ summary: 'Get user dashboard preferences' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard preferences retrieved successfully',
    type: UserPreferencesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Session is invalid or expired' })
  @ApiResponse({ status: 404, description: 'Dashboard preferences not found, using default layout' })
  @ApiResponse({ status: 500, description: 'System error occurred while retrieving dashboard preferences' })
  async getUserPreferences(@Req() req: AuthenticatedRequest): Promise<UserPreferencesResponseDto> {
    const { userId } = req.session;
    
    return await this.dashboardService.getUserPreferences(userId);
  }

  @Put('user-preferences')
  @ApiOperation({ summary: 'Update user dashboard preferences' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard preferences updated successfully',
    type: UpdateUserPreferencesResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Widget layout configuration is invalid or Required field is missing' })
  @ApiResponse({ status: 401, description: 'Session is invalid or expired' })
  @ApiResponse({ status: 500, description: 'System error occurred while saving dashboard preferences' })
  async updateUserPreferences(
    @Req() req: AuthenticatedRequest,
    @Body() updateDto: UpdateUserPreferencesDto,
  ): Promise<UpdateUserPreferencesResponseDto> {
    const { tenantId, userId } = req.session;
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    return await this.dashboardService.updateUserPreferences(tenantId, userId, updateDto, ipAddress, userAgent);
  }

  @Get('system-status')
  @ApiOperation({ summary: 'Get real-time system status' })
  @ApiResponse({
    status: 200,
    description: 'System status retrieved successfully',
    type: SystemStatusResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Session is invalid or expired' })
  @ApiResponse({ status: 500, description: 'Unable to perform system status check' })
  async getSystemStatus(): Promise<SystemStatusResponseDto> {
    return await this.dashboardService.getSystemStatus();
  }
}