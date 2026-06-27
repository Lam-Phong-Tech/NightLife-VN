import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoreCategory } from '@prisma/client';

export class PublicDiscoveryMetaDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 24 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;

  @ApiProperty({ example: true })
  hasMore!: boolean;

  @ApiProperty({ enum: ['newest', 'nearest', 'priority'], example: 'newest' })
  sort!: 'newest' | 'nearest' | 'priority';
}

export class PublicAreaDto {
  @ApiProperty({ example: 'area_01' })
  id!: string;

  @ApiProperty({ example: 'hn-tayho' })
  code!: string;

  @ApiProperty({ example: 'Tay Ho' })
  name!: string;

  @ApiProperty({ example: 'Ha Noi' })
  city!: string;

  @ApiPropertyOptional({ example: 'hn' })
  cityCode?: string;

  @ApiPropertyOptional({ example: 'Tay Ho', nullable: true })
  district?: string | null;

  @ApiPropertyOptional({ example: 'Quang An', nullable: true })
  ward?: string | null;
}

export class PublicStoreDto {
  @ApiProperty({ example: 'store_01' })
  id!: string;

  @ApiProperty({ example: 'Neon Club' })
  name!: string;

  @ApiProperty({ example: 'neon-club' })
  slug!: string;

  @ApiProperty({ enum: StoreCategory, example: StoreCategory.CLUB })
  category!: StoreCategory;

  @ApiPropertyOptional({
    example: 'Club by West Lake with DJ nights and VIP tables.',
    nullable: true,
  })
  description?: string | null;

  @ApiPropertyOptional({ example: '200 Nghi Tam, Tay Ho', nullable: true })
  address?: string | null;

  @ApiProperty({ example: 'Ha Noi' })
  city!: string;

  @ApiPropertyOptional({ example: 'hn' })
  cityCode?: string;

  @ApiPropertyOptional({ example: 'Tay Ho', nullable: true })
  district?: string | null;

  @ApiPropertyOptional({ type: () => PublicAreaDto, nullable: true })
  area?: PublicAreaDto | null;

  @ApiPropertyOptional({ example: 21.063, nullable: true })
  latitude?: number | null;

  @ApiPropertyOptional({ example: 105.822, nullable: true })
  longitude?: number | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ example: 1.4, nullable: true })
  distanceKm?: number | null;
}

export class PublicCastDto {
  @ApiProperty({ example: 'cast_01' })
  id!: string;

  @ApiProperty({ example: 'yuna-neon' })
  slug!: string;

  @ApiProperty({ example: 'Yuna' })
  stageName!: string;

  @ApiProperty({ example: 'Yuna' })
  name!: string;

  @ApiPropertyOptional({ example: 'Yuna', nullable: true })
  publicAlias?: string | null;

  @ApiPropertyOptional({ example: 'Party host', nullable: true })
  publicHeadline?: string | null;

  @ApiProperty({ type: [String], example: ['party', 'vip'] })
  tags!: string[];

  @ApiProperty({ type: [String], example: ['ja', 'vi'] })
  languages!: string[];

  @ApiPropertyOptional({ example: 600000, nullable: true })
  hourlyRateVnd?: number | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ example: 1.4, nullable: true })
  distanceKm?: number | null;

  @ApiProperty({ type: () => PublicStoreDto })
  store!: PublicStoreDto;
}

export class PublicStoreListResponseDto {
  @ApiProperty({ type: [PublicStoreDto] })
  data!: PublicStoreDto[];

  @ApiProperty({ type: () => PublicDiscoveryMetaDto })
  meta!: PublicDiscoveryMetaDto;
}

export class PublicCastListResponseDto {
  @ApiProperty({ type: [PublicCastDto] })
  data!: PublicCastDto[];

  @ApiProperty({ type: () => PublicDiscoveryMetaDto })
  meta!: PublicDiscoveryMetaDto;
}
