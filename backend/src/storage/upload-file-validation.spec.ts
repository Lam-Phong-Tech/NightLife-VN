import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateUploadedFile } from './upload-file-validation';

describe('validateUploadedFile', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'nightlife-upload-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  const createFile = async (
    contents: Uint8Array | string,
    overrides: Partial<{
      filename: string;
      originalname: string;
      mimetype: string;
      size: number;
    }> = {},
  ) => {
    const path = join(directory, overrides.filename ?? 'stored-key');
    await writeFile(path, contents);
    const actualSize =
      typeof contents === 'string'
        ? Buffer.byteLength(contents)
        : contents.byteLength;
    return {
      filename: overrides.filename ?? 'stored-key',
      originalname: overrides.originalname ?? 'image.png',
      mimetype: overrides.mimetype ?? 'image/png',
      size: overrides.size ?? actualSize,
      path,
    };
  };

  it('accepts a PNG and generates a name when originalname is blank', async () => {
    const file = await createFile(
      Uint8Array.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
      ]),
      { originalname: '   ' },
    );

    await expect(validateUploadedFile(file, 'STORE_GALLERY')).resolves.toEqual({
      mimeType: 'image/png',
      originalName: 'media-stored-key.png',
    });
  });

  it.each(['', 'application/octet-stream'])(
    'uses the detected signature when declared MIME is %s',
    async (mimetype) => {
      const file = await createFile(
        Uint8Array.from([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
        ]),
        { mimetype },
      );

      await expect(
        validateUploadedFile(file, 'STORE_GALLERY'),
      ).resolves.toEqual({
        mimeType: 'image/png',
        originalName: 'image.png',
      });
    },
  );

  it('rejects zero-byte uploads', async () => {
    const file = await createFile('', { size: 0 });
    await expect(validateUploadedFile(file, 'STORE_GALLERY')).rejects.toThrow(
      'file rỗng',
    );
  });

  it('rejects content whose signature does not match its MIME', async () => {
    const file = await createFile(Uint8Array.from([0xff, 0xd8, 0xff, 0xdb]), {
      originalname: 'fake.png',
      mimetype: 'image/png',
    });
    await expect(validateUploadedFile(file, 'STORE_GALLERY')).rejects.toThrow(
      'không khớp',
    );
  });

  it('rejects video content for an image purpose', async () => {
    const file = await createFile(
      Buffer.from('00000018667479706d703432', 'hex'),
      { originalname: 'fake.mp4', mimetype: 'video/mp4' },
    );
    await expect(validateUploadedFile(file, 'STORE_GALLERY')).rejects.toThrow(
      'không được phép',
    );
  });

  it('accepts safe appearance SVG and rejects active content', async () => {
    const safeSvg = await createFile(
      '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>',
      {
        filename: 'safe-svg',
        originalname: 'icon.svg',
        mimetype: 'image/svg+xml',
      },
    );
    await expect(
      validateUploadedFile(safeSvg, 'APPEARANCE_ICON'),
    ).resolves.toEqual({
      mimeType: 'image/svg+xml',
      originalName: 'icon.svg',
    });

    const unsafeSvg = await createFile(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
      {
        filename: 'unsafe-svg',
        originalname: 'icon.svg',
        mimetype: 'image/svg+xml',
      },
    );
    await expect(
      validateUploadedFile(unsafeSvg, 'APPEARANCE_ICON'),
    ).rejects.toThrow('không an toàn');
  });

  it('rejects WebP for CMS content images', async () => {
    const file = await createFile(
      Buffer.from('524946460000000057454250', 'hex'),
      {
        originalname: 'banner.webp',
        mimetype: 'image/webp',
      },
    );
    await expect(validateUploadedFile(file, 'BANNER_GLOBAL')).rejects.toThrow(
      'không được phép',
    );
  });

  it('rejects unsupported upload purposes', async () => {
    const file = await createFile(
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    await expect(validateUploadedFile(file, 'UNKNOWN')).rejects.toThrow(
      'chưa được hỗ trợ',
    );
  });
});
