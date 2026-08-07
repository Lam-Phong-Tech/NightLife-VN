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

  @ApiProperty({ example: 'image-12345-800.webp' })
  storageKey: string;

  @ApiProperty({ example: 'photo.jpg' })
  originalName: string;

  @ApiProperty({ example: 'image/webp' })
  mimeType: string;

  @ApiProperty({ example: 102400 })
  sizeBytes: number;

  @ApiProperty({ example: 'STORE_COVER', required: false, nullable: true })
  purpose: string | null;

  @ApiProperty({ example: 'IMAGE' })
  type: string;

  @ApiProperty({ example: 'PUBLIC' })
  access: string;

  @ApiProperty({
    example: 'https://cdn.example.com/storage/public/image-12345-800.webp',
    required: false,
    nullable: true,
  })
  url: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description:
      'Image processing metadata. Contains responsive variants (WebP + AVIF) and original dimensions.',
    example: {
      variants: [
        { width: 400, webpKey: 'abc-400.webp', avifKey: 'abc-400.avif', webpSizeBytes: 32000, avifSizeBytes: 22000 },
        { width: 800, webpKey: 'abc-800.webp', avifKey: 'abc-800.avif', webpSizeBytes: 95000, avifSizeBytes: 65000 },
        { width: 1200, webpKey: 'abc-1200.webp', avifKey: 'abc-1200.avif', webpSizeBytes: 180000, avifSizeBytes: 120000 },
      ],
      originalWidth: 3024,
      originalHeight: 2016,
    },
  })
  metadata: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  deletedAt: Date | null;
}
