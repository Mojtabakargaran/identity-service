import { Controller, Get, Put, Body, HttpStatus, HttpCode, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { OperationalParametersService } from './operational-parameters.service';
import { SaveOperationalParametersDto, GetOperationalParametersResponseDto, SaveOperationalParametersResponseDto } from './dto';
import { SessionAuthGuard } from '../../shared/guards/session-auth.guard';

@ApiTags('Operational Parameters')
@Controller('api/v1/operational-parameters')
@UseGuards(SessionAuthGuard)
export class OperationalParametersController {
  constructor(private readonly operationalParametersService: OperationalParametersService) {}

  @Get()
  @ApiOperation({ summary: 'Get hospital operational parameters configuration' })
  @ApiResponse({ 
    status: 200, 
    description: 'Operational parameters retrieved successfully',
    type: GetOperationalParametersResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Hospital owner role required' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Database error occurred' 
  })
  async getOperationalParameters(@Req() req: Request): Promise<GetOperationalParametersResponseDto> {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.userId;
    
    if (!tenantId || !userId) {
      throw new BadRequestException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication information is missing',
      });
    }
    
    return this.operationalParametersService.getOperationalParameters(tenantId, userId);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save or update hospital operational parameters configuration' })
  @ApiResponse({ 
    status: 200, 
    description: 'Operational parameters saved successfully',
    type: SaveOperationalParametersResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation errors occurred' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Authentication required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Hospital owner role required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'One or more departments not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Database error occurred' 
  })
  async saveOperationalParameters(
    @Body() dto: SaveOperationalParametersDto,
    @Req() req: Request,
  ): Promise<SaveOperationalParametersResponseDto> {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.userId;
    
    if (!tenantId || !userId) {
      throw new BadRequestException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication information is missing',
      });
    }
    
    return this.operationalParametersService.saveOperationalParameters(tenantId, userId, dto);
  }
}