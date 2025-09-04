import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: 'Response code' })
  code: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data', required: false })
  data?: T;

  constructor(code: string, message: string, data?: T) {
    this.code = code;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }
}
