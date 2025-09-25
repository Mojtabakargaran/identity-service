import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class WidgetDto {
  @ApiProperty({ description: 'Widget unique identifier' })
  widgetId: string;

  @ApiProperty({ 
    description: 'Widget position',
    example: { x: 0, y: 0 }
  })
  position: {
    x: number;
    y: number;
  };

  @ApiProperty({ 
    description: 'Widget size',
    example: { width: 4, height: 2 }
  })
  size: {
    width: number;
    height: number;
  };

  @ApiProperty({ description: 'Whether widget is visible' })
  visible: boolean;
}

export class WidgetLayoutDto {
  @ApiProperty({ 
    description: 'List of widgets and their configurations',
    type: [WidgetDto]
  })
  widgets: WidgetDto[];
}

export class UpdateUserPreferencesDto {
  @ApiProperty({ description: 'Dashboard widget layout configuration' })
  @IsNotEmpty({ message: 'Widget layout is required' })
  @IsObject({ message: 'Widget layout must be a valid object' })
  widgetLayout: WidgetLayoutDto;
}

export class UserDashboardPreferencesDataDto {
  @ApiProperty({ description: 'Dashboard preferences unique identifier' })
  dashboardPreferencesId: string;

  @ApiProperty({ description: 'User unique identifier' })
  userId: string;

  @ApiProperty({ description: 'Dashboard widget layout configuration' })
  widgetLayout: WidgetLayoutDto;

  @ApiProperty({ description: 'Preferences creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Preferences last update timestamp' })
  updatedAt: string;
}

export class UserPreferencesResponseDto {
  @ApiProperty({ description: 'Response code', example: 'DASHBOARD_PREFERENCES_RETRIEVED' })
  code: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Dashboard preferences data' })
  data: UserDashboardPreferencesDataDto;
}

export class UpdateUserPreferencesResponseDto {
  @ApiProperty({ description: 'Response code', example: 'DASHBOARD_PREFERENCES_UPDATED' })
  code: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ 
    description: 'Update confirmation data',
    example: {
      dashboardPreferencesId: 'uuid',
      updatedAt: 'ISO8601'
    }
  })
  data: {
    dashboardPreferencesId: string;
    updatedAt: string;
  };
}