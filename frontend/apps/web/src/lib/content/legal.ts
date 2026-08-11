import { legalPagesApi, type LegalPage, type LegalPageKey } from "@/lib/api/content";
import type { LanguageCode } from "@/lib/i18n/locales";

export type LegalSection = LegalPage;

export const legalPageDescription: Record<LanguageCode, string> = {
  vi: "Tổng hợp các quy định và chính sách được áp dụng tại Vietyoru, nhằm bảo đảm tính minh bạch, nhất quán và quyền lợi của khách hàng trong quá trình sử dụng dịch vụ.",
  en: "A central overview of the policies and regulations applied by Vietyoru, designed to ensure transparency, consistency, and protect customers’ rights throughout their use of our services.",
  ja: "Vietyoruが適用する規約・ポリシーをまとめています。サービスご利用中の透明性と一貫性を確保し、お客様の権利を守ることを目的としています。",
  ko: "Vietyoru에 적용되는 규정과 정책을 한곳에 모았습니다. 서비스 이용 전반의 투명성과 일관성을 높이고 고객의 권리를 보호하기 위한 기준을 안내합니다.",
  zh: "汇总 Vietyoru 适用的各项规定与政策，旨在确保服务使用过程中的透明度与一致性，并保障客户权益。",
};

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
