import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';

@ApiTags('Tenants')
@Controller('api/v1/tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new hospital tenant' })
  @ApiResponse({ 
    status: 201, 
    description: 'Hospital registration completed successfully',
    type: ApiResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data or validation failed' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Hospital name or email already exists' 
  })
  async register(@Body() registerDto: RegisterTenantDto): Promise<ApiResponseDto> {
    return this.tenantService.registerTenant(registerDto);
  }
}
