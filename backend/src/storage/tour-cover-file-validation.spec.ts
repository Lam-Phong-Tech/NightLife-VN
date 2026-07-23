import {
  getTourCoverFileValidationError,
  MAX_TOUR_COVER_SIZE_BYTES,
} from './tour-cover-file-validation';

const jpegHeader = Uint8Array.from([0xff, 0xd8, 0xff, 0xdb]);
const mp4Header = Buffer.from('00000018667479706d703432', 'hex');

describe('tour cover file validation', () => {
  it('accepts an image whose extension, MIME type, and signature agree', () => {
    expect(
      getTourCoverFileValidationError(
        {
          originalname: 'cover.jpg',
          mimetype: 'image/jpeg',
          size: 128,
        },
        jpegHeader,
      ),
    ).toBeNull();
  });

  it('rejects a regular video upload', () => {
    expect(
      getTourCoverFileValidationError(
        {
          originalname: 'cover.mp4',
          mimetype: 'video/mp4',
          size: 128,
        },
        mp4Header,
      ),
    ).toContain('không chấp nhận video');
  });

  it('rejects a video disguised with an image name and MIME type', () => {
    expect(
      getTourCoverFileValidationError(
        {
          originalname: 'cover.jpg',
          mimetype: 'image/jpeg',
          size: 128,
        },
        mp4Header,
      ),
    ).toContain('Nội dung file ảnh bìa không hợp lệ');
  });

  it('rejects empty and oversized images', () => {
    expect(
      getTourCoverFileValidationError(
        {
          originalname: 'empty.jpg',
          mimetype: 'image/jpeg',
          size: 0,
        },
        jpegHeader,
      ),
    ).toContain('file rỗng');

    expect(
      getTourCoverFileValidationError(
        {
          originalname: 'large.jpg',
          mimetype: 'image/jpeg',
          size: MAX_TOUR_COVER_SIZE_BYTES + 1,
        },
        jpegHeader,
      ),
    ).toContain('15MB');
  });
});
