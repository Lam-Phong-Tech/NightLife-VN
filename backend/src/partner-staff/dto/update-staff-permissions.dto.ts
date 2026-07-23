import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateStaffPermissionsDto {
  @ApiProperty({ example: ['coupon.scan', 'checkin.confirm'] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
