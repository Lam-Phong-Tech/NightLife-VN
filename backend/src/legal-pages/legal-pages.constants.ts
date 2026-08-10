import { LegalPageKey } from '@prisma/client';

export const LEGAL_PAGE_DEFINITIONS = [
  {
    key: LegalPageKey.PRIVACY_POLICY,
    slug: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật',
    excerpt:
      'Thông tin về cách nền tảng thu thập, sử dụng và bảo vệ dữ liệu người dùng.',
    sections: [
      {
        heading: 'Thông tin chúng tôi thu thập',
        body: 'Nội dung pháp lý đang được cập nhật. Vui lòng cung cấp nội dung chính thức trước khi phát hành.',
      },
      {
        heading: 'Mục đích sử dụng',
        body: 'Nội dung pháp lý đang được cập nhật.',
      },
      {
        heading: 'Quyền của người dùng',
        body: 'Nội dung pháp lý đang được cập nhật.',
      },
    ],
  },
  {
    key: LegalPageKey.TERMS_OF_USE,
    slug: 'dieu-khoan-su-dung',
    title: 'Điều khoản sử dụng',
    excerpt: 'Điều kiện sử dụng nền tảng, trách nhiệm và quy tắc đặt chỗ.',
    sections: [
      {
        heading: 'Điều kiện sử dụng',
        body: 'Nội dung pháp lý đang được cập nhật. Vui lòng cung cấp nội dung chính thức trước khi phát hành.',
      },
      {
        heading: 'Đặt chỗ và xác nhận',
        body: 'Nội dung pháp lý đang được cập nhật.',
      },
      {
        heading: 'Tài khoản và hành vi',
        body: 'Nội dung pháp lý đang được cập nhật.',
      },
    ],
  },
  {
    key: LegalPageKey.OPERATING_POLICY,
    slug: 'chinh-sach-hoat-dong',
    title: 'Chính sách hoạt động',
    excerpt:
      'Quy trình điều phối đặt chỗ, ưu đãi, tích điểm và hỗ trợ sau trải nghiệm.',
    sections: [
      {
        heading: 'Điều phối đặt chỗ',
        body: 'Nội dung pháp lý đang được cập nhật. Vui lòng cung cấp nội dung chính thức trước khi phát hành.',
      },
      {
        heading: 'Ưu đãi và tích điểm',
        body: 'Nội dung pháp lý đang được cập nhật.',
      },
      {
        heading: 'Hỗ trợ sau đặt chỗ',
        body: 'Nội dung pháp lý đang được cập nhật.',
      },
    ],
  },
] as const;

export const LEGAL_PAGE_KEYS = LEGAL_PAGE_DEFINITIONS.map((item) => item.key);
export const LEGAL_PAGE_SLUGS = LEGAL_PAGE_DEFINITIONS.map((item) => item.slug);

export const definitionForKey = (value: string) =>
  LEGAL_PAGE_DEFINITIONS.find((item) => item.key === value);

export const definitionForSlug = (value: string) =>
  LEGAL_PAGE_DEFINITIONS.find((item) => item.slug === value);
