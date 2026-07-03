import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum BillStatusUpdateEnum {
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export class UpdateBillStatusDto {
  @IsEnum(BillStatusUpdateEnum)
  status: BillStatusUpdateEnum;

  @IsOptional()
  @IsString()
  reason?: string;
}
