import { legalPagesApi, type LegalPage, type LegalPageKey } from "@/lib/api/content";

export type LegalSection = LegalPage;

export const legalPlaceholderNotice =
  "Tổng hợp các quy định và chính sách được áp dụng tại Vietyoru, nhằm bảo đảm tính minh bạch, nhất quán và quyền lợi của khách hàng trong quá trình sử dụng dịch vụ.";

export const LEGAL_PAGE_SLUGS = [
  "chinh-sach-bao-mat",
  "dieu-khoan-su-dung",
  "chinh-sach-hoat-dong",
] as const;

const fallbackPages: LegalPage[] = [
  {
    id: "fallback-privacy",
    key: "PRIVACY_POLICY" as LegalPageKey,
    slug: "chinh-sach-bao-mat",
    title: "Chính sách bảo mật",
    excerpt: "Nội dung pháp lý đang được cập nhật.",
    sections: [{ heading: "Thông báo", body: "Nội dung pháp lý đang được cập nhật." }],
    noindex: true,
    version: 0,
    publishedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "fallback-terms",
    key: "TERMS_OF_USE" as LegalPageKey,
    slug: "dieu-khoan-su-dung",
    title: "Điều khoản sử dụng",
    excerpt: "Nội dung pháp lý đang được cập nhật.",
    sections: [{ heading: "Thông báo", body: "Nội dung pháp lý đang được cập nhật." }],
    noindex: true,
    version: 0,
    publishedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "fallback-operating",
    key: "OPERATING_POLICY" as LegalPageKey,
    slug: "chinh-sach-hoat-dong",
    title: "Chính sách hoạt động",
    excerpt: "Nội dung pháp lý đang được cập nhật.",
    sections: [{ heading: "Thông báo", body: "Nội dung pháp lý đang được cập nhật." }],
    noindex: true,
    version: 0,
    publishedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export const getPublishedLegalSections = async () => {
  try {
    const response = await legalPagesApi.list();
    return response.data.length === LEGAL_PAGE_SLUGS.length ? response.data : fallbackPages;
  } catch {
    return fallbackPages;
  }
};

export const getLegalSection = async (slug: string) => {
  try {
    return await legalPagesApi.get(slug);
  } catch {
    return fallbackPages.find((page) => page.slug === slug);
  }
};
