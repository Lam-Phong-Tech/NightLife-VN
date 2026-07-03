import { ApiProperty } from '@nestjs/swagger';

export class MediaResponseDto {
  @ApiProperty({ example: 'media_01' })
  id: string;

  @ApiProperty({ example: 'user_01' })
  ownerId: string;

  @ApiProperty({ example: 'store_01', required: false, nullable: true })
  storeId: string | null;

  @ApiProperty({ example: 'cast_01', required: false, nullable: true })
  castId: string | null;

  @ApiProperty({ example: 'booking_01', required: false, nullable: true })
  bookingId: string | null;

  @ApiProperty({ example: 'bill_01', required: false, nullable: true })
  billId: string | null;

  @ApiProperty({ example: 'content_01', required: false, nullable: true })
  contentId: string | null;

  @ApiProperty({ example: 'image-12345.jpg' })
  storageKey: string;

  @ApiProperty({ example: 'photo.jpg' })
  originalName: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 102400 })
  sizeBytes: number;

  @ApiProperty({ example: 'store-hero', required: false, nullable: true })
  purpose: string | null;

  @ApiProperty({ example: 'IMAGE' })
  type: string;

  @ApiProperty({ example: 'PUBLIC' })
  access: string;

  @ApiProperty({ example: 'https://cdn.example.com/storage/public/image-12345.jpg', required: false, nullable: true })
  url: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  deletedAt: Date | null;
}
