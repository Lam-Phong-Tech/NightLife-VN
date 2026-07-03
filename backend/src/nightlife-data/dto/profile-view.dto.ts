import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';

export class RecordProfileViewDto {
  @ApiProperty({ enum: ['STORE', 'CAST'], example: 'STORE' })
  @IsIn(['STORE', 'CAST'])
  targetType!: 'STORE' | 'CAST';

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  targetId!: string;
}
