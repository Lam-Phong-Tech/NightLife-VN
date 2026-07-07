import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export enum BillStatusUpdateEnum {
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export class UpdateBillStatusDto {
  @IsEnum(BillStatusUpdateEnum)
  status: BillStatusUpdateEnum;

  @ValidateIf(
    (dto: UpdateBillStatusDto) => dto.status === BillStatusUpdateEnum.REJECTED,
  )
  @IsNotEmpty()
  @IsString()
  reason?: string;
}
