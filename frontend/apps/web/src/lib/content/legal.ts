import { contentApi, type CmsContentItem } from "@/lib/api/content";

export type LegalStatus = "DRAFT" | "PUBLISHED";

export type LegalSection = {
  slug: string;
  title: string;
  description: string;
  status: LegalStatus;
  noindex: boolean;
  publishedAt: string | null;
  updatedAt: string;
  items: Array<{
    heading: string;
    body: string;
  }>;
};

export const legalPlaceholderNotice =
  "Bản nháp placeholder. Nội dung pháp lý cuối cùng cần được khách hàng cung cấp và rà soát trước khi phát hành chính thức.";

export const legalSections: LegalSection[] = [
  {
    slug: "chinh-sach-bao-mat",
    title: "Chính sách bảo mật",
    description:
      "Placeholder về cách Vietyoru thu thập, sử dụng và bảo vệ dữ liệu người dùng trong quá trình đặt chỗ.",
    status: "PUBLISHED",
    noindex: true,
    publishedAt: null,
    updatedAt: "2026-06-30",
    items: [
      {
        heading: "Thông tin có thể thu thập",
        body:
          "Tên, số điện thoại, thông tin đặt chỗ, lịch sử dùng ưu đãi và dữ liệu tài khoản cần thiết để vận hành dịch vụ.",
      },
      {
        heading: "Mục đích sử dụng",
        body:
          "Dữ liệu được dùng để xác nhận đặt chỗ, điều phối với quán, chăm sóc khách hàng, tích điểm và phòng chống lạm dụng ưu đãi.",
      },
      {
        heading: "Quyền của người dùng",
        body:
          "Người dùng có thể yêu cầu cập nhật hoặc xóa thông tin theo kênh liên hệ chính thức sau khi khách hàng cung cấp quy trình pháp lý cuối cùng.",
      },
    ],
  },
  {
    slug: "dieu-khoan-su-dung",
    title: "Điều khoản sử dụng",
    description:
      "Placeholder về điều kiện sử dụng nền tảng, giới hạn trách nhiệm và quy tắc đặt chỗ qua Vietyoru.",
    status: "PUBLISHED",
    noindex: true,
    publishedAt: null,
    updatedAt: "2026-06-30",
    items: [
      {
        heading: "Điều kiện sử dụng",
        body:
          "Dịch vụ dành cho người dùng đủ điều kiện theo quy định pháp luật Việt Nam. Người dùng cần cung cấp thông tin chính xác khi đặt chỗ.",
      },
      {
        heading: "Giá và xác nhận",
        body:
          "Giá, tình trạng bàn, cast và ưu đãi hiển thị chỉ mang tính tham khảo cho đến khi admin xác nhận với quán.",
      },
      {
        heading: "Tài khoản và hành vi",
        body:
          "Tài khoản có dấu hiệu spam, lạm dụng mã ưu đãi hoặc cung cấp thông tin sai có thể bị tạm khóa theo quy trình chính thức.",
      },
    ],
  },
  {
    slug: "chinh-sach-hoat-dong",
    title: "Chính sách hoạt động",
    description:
      "Placeholder về cách Vietyoru điều phối đặt chỗ, xử lý ưu đãi, tích điểm và hỗ trợ sau trải nghiệm.",
    status: "PUBLISHED",
    noindex: true,
    publishedAt: null,
    updatedAt: "2026-06-30",
    items: [
      {
        heading: "Điều phối đặt chỗ",
        body:
          "Yêu cầu đặt chỗ được admin tiếp nhận và xác nhận với quán. Vietyoru không thu cọc hay thanh toán online nếu chưa có thông báo chính thức.",
      },
      {
        heading: "Ưu đãi và tích điểm",
        body:
          "Coupon áp dụng theo điều kiện từng chương trình. Điểm thành viên được cộng sau khi hóa đơn hợp lệ được duyệt.",
      },
      {
        heading: "Hỗ trợ sau đặt chỗ",
        body:
          "Khi có thay đổi lịch hoặc phản hồi dịch vụ, người dùng liên hệ admin để được điều phối theo quy trình vận hành đã công bố.",
      },
    ],
  },
];

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asItems = (value: unknown): LegalSection["items"] =>
  Array.isArray(value)
    ? value
        .map((item) => {
          const record = asRecord(item);
          if (!record || typeof record.heading !== "string" || typeof record.body !== "string") {
            return null;
          }

          return { heading: record.heading, body: record.body };
        })
        .filter((item): item is LegalSection["items"][number] => Boolean(item))
    : [];

const mapCmsContentToLegalSection = (content: CmsContentItem): LegalSection | null => {
  if (content.type !== "POLICY" || content.status !== "PUBLISHED") return null;

  const metadata = asRecord(content.metadata) ?? {};
  const items = asItems(metadata.items);

  return {
    slug: content.slug,
    title: content.title,
    description: content.excerpt ?? content.title,
    status: "PUBLISHED",
    noindex: content.noindex !== false || metadata.noindex !== false,
    publishedAt: content.publishedAt?.slice(0, 10) ?? null,
    updatedAt: content.updatedAt.slice(0, 10),
    items: items.length
      ? items
      : content.body
        ? [{ heading: content.title, body: content.body }]
        : [],
  };
};

const staticPublishedLegalSections = () =>
  legalSections.filter((section) => section.status === "PUBLISHED");

const mergeLegalSections = (cmsSections: LegalSection[]) => {
  const sectionsBySlug = new Map(
    staticPublishedLegalSections().map((section) => [section.slug, section]),
  );

  for (const section of cmsSections) {
    sectionsBySlug.set(section.slug, section);
  }

  return Array.from(sectionsBySlug.values());
};

export const getPublishedLegalSections = async () => {
  try {
    const response = await contentApi.list({ type: "POLICY", limit: 50 });
    const cmsSections = response.data
      .map(mapCmsContentToLegalSection)
      .filter((section): section is LegalSection => Boolean(section));

    if (cmsSections.length) return mergeLegalSections(cmsSections);
  } catch {
    // Legal placeholders stay available until final CMS policy content is published.
  }

  return staticPublishedLegalSections();
};

export const getLegalSection = async (slug: string) =>
  (await getPublishedLegalSections()).find((section) => section.slug === slug);
