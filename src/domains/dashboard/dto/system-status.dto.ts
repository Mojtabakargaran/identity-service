import { ApiProperty } from '@nestjs/swagger';

export class ServiceStatusDto {
  @ApiProperty({ description: 'Service name' })
  serviceName: string;

  @ApiProperty({ 
    description: 'Service health status',
    enum: ['healthy', 'degraded', 'down']
  })
  status: 'healthy' | 'degraded' | 'down';

  @ApiProperty({ description: 'Response time in milliseconds' })
  responseTime: number;

  @ApiProperty({ description: 'Last health check timestamp' })
  lastChecked: string;

  @ApiProperty({ 
    description: 'Estimated service restoration time',
    required: false
  })
  estimatedRestoreTime?: string | null;
}

export class SystemStatusDataDto {
  @ApiProperty({ 
    description: 'List of service statuses',
    type: [ServiceStatusDto]
  })
  services: ServiceStatusDto[];

  @ApiProperty({ 
    description: 'Overall system health status',
    enum: ['healthy', 'degraded', 'down']
  })
  overallStatus: 'healthy' | 'degraded' | 'down';

  @ApiProperty({ description: 'System status check timestamp' })
  checkedAt: string;
}

export class SystemStatusResponseDto {
  @ApiProperty({ description: 'Response code', example: 'SYSTEM_STATUS_RETRIEVED' })
  code: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'System status data' })
  data: SystemStatusDataDto;
}