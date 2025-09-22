import { ApiProperty } from '@nestjs/swagger';

export class MedicalDepartmentResponseDto {
  @ApiProperty({ description: 'Department unique identifier' })
  departmentId: string;

  @ApiProperty({ description: 'Department name in English' })
  departmentNameEn: string;

  @ApiProperty({ description: 'Department name in Farsi' })
  departmentNameFa: string;

  @ApiProperty({ description: 'Department description', required: false })
  description?: string | null;

  @ApiProperty({ description: 'Whether department is active' })
  isActive: boolean;
}

export class DepartmentsDataDto {
  @ApiProperty({ 
    description: 'Available medical departments', 
    type: [MedicalDepartmentResponseDto] 
  })
  departments: MedicalDepartmentResponseDto[];
}

export class DepartmentsListResponseDto {
  @ApiProperty({ description: 'Response code', example: 'DEPARTMENTS_RETRIEVED' })
  code: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Departments data' })
  data: DepartmentsDataDto;
}