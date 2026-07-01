import { contentApi, type CmsContentItem } from "@/lib/api/content";

export type BlogStatus = "DRAFT" | "PUBLISHED";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  publishedAt: string;
  updatedAt: string;
  status: BlogStatus;
  noindex?: boolean;
  readTime: string;
  author: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  tags: string[];
  sections: Array<{
    heading: string;
    body: string;
  }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "tay-ho-night-guide",
    title: "Hướng dẫn trọn vẹn một đêm ở Tây Hồ",
    description:
      "Lộ trình gợi ý cho khách muốn đi lounge, club và ăn khuya ở Tây Hồ, kèm lưu ý đặt chỗ qua Vietyoru.",
    category: "Cẩm nang khu vực",
    date: "2026-06-21",
    publishedAt: "2026-06-21",
    updatedAt: "2026-06-30",
    status: "PUBLISHED",
    noindex: false,
    readTime: "6 phút đọc",
    author: "Đội ngũ Vietyoru",
    image:
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Không gian lounge ban đêm với ánh đèn ấm",
    featured: true,
    tags: ["Tây Hồ", "Lounge", "Đặt chỗ"],
    sections: [
      {
        heading: "Bắt đầu bằng một lounge dễ tiếp khách",
        body:
          "Tây Hồ hợp cho nhóm muốn có không gian riêng, nhạc vừa đủ và dịch vụ ổn định. Nên chọn điểm mở đầu có phòng VIP hoặc bàn lớn nếu đi cùng đối tác.",
      },
      {
        heading: "Giữ lịch trình linh hoạt",
        body:
          "Giá hiển thị trên Vietyoru chỉ mang tính tham khảo. Khi gửi yêu cầu đặt chỗ, admin sẽ xác nhận lại với quán trước khi chốt lịch.",
      },
      {
        heading: "Khép lại bằng điểm ăn khuya",
        body:
          "Sau lounge hoặc club, một quán ăn khuya gần hồ giúp nhóm nghỉ nhịp trước khi di chuyển. Hãy kiểm tra giờ mở cửa trong ngày vì cuối tuần thường đông sớm.",
      },
    ],
  },
  {
    slug: "karaoke-nhat-ha-noi",
    title: "Văn hóa karaoke Nhật tại Hà Nội",
    description:
      "Các lưu ý về phòng riêng, etiquette khi đi cùng khách Nhật và cách đặt trước để tránh chờ cuối tuần.",
    category: "Văn hóa Nhật",
    date: "2026-06-20",
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-30",
    status: "PUBLISHED",
    noindex: false,
    readTime: "7 phút đọc",
    author: "Đội ngũ Vietyoru",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Sân khấu biểu diễn trong không gian đêm",
    tags: ["Karaoke", "Nhật Bản", "Hà Nội"],
    sections: [
      {
        heading: "Ưu tiên phòng riêng",
        body:
          "Khách Nhật thường đánh giá cao không gian riêng tư, âm lượng vừa phải và phục vụ kín đáo. Khi đặt chỗ, hãy ghi rõ số lượng khách và mục đích buổi gặp.",
      },
      {
        heading: "Chọn khung giờ ít rủi ro",
        body:
          "Khung 20:00-22:00 thường dễ điều phối hơn sau 22:30. Với cuối tuần, nên gửi yêu cầu trước tối thiểu vài giờ.",
      },
    ],
  },
  {
    slug: "dat-ban-cuoi-tuan",
    title: "5 mẹo đặt bàn nhanh dịp cuối tuần",
    description:
      "Checklist ngắn để đặt bàn nightlife nhanh hơn: chọn khu vực, giờ đến, số khách, yêu cầu phòng và coupon.",
    category: "Mẹo đặt chỗ",
    date: "2026-06-16",
    publishedAt: "2026-06-16",
    updatedAt: "2026-06-30",
    status: "PUBLISHED",
    noindex: false,
    readTime: "4 phút đọc",
    author: "Đội ngũ Vietyoru",
    image:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Quầy bar sáng đèn trong buổi tối",
    tags: ["Booking", "Coupon", "Cuối tuần"],
    sections: [
      {
        heading: "Gửi đủ thông tin ngay từ đầu",
        body:
          "Admin xử lý nhanh hơn khi có giờ đến, số khách, khu vực mong muốn và nhu cầu phòng riêng. Nếu có coupon, hãy chọn trước khi gửi yêu cầu.",
      },
      {
        heading: "Luôn có phương án gần khu vực",
        body:
          "Nếu quán đầu tiên kín chỗ, lựa chọn cùng khu vực giúp giữ lịch trình ổn định và giảm thời gian di chuyển.",
      },
    ],
  },
  {
    slug: "quan-1-night-map",
    title: "Bản đồ Quận 1 về đêm cho khách mới",
    description:
      "Gợi ý cách chia một buổi tối ở Quận 1 theo lounge, rooftop bar và điểm ăn khuya gần trung tâm.",
    category: "Cẩm nang khu vực",
    date: "2026-06-19",
    publishedAt: "2026-06-19",
    updatedAt: "2026-06-30",
    status: "PUBLISHED",
    noindex: false,
    readTime: "6 phút đọc",
    author: "Đội ngũ Vietyoru",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Đồ uống trong không gian nightlife",
    tags: ["Quận 1", "Rooftop", "TP.HCM"],
    sections: [
      {
        heading: "Điểm hẹn trung tâm",
        body:
          "Quận 1 phù hợp nhóm muốn di chuyển ngắn giữa nhiều điểm. Hãy chọn điểm đầu gần khách sạn hoặc tuyến xe chính để dễ đổi lịch.",
      },
      {
        heading: "Đặt trước nếu cần view đẹp",
        body:
          "Rooftop và bàn gần sân khấu thường hết sớm. Với nhóm business, nên ghi rõ nhu cầu không gian trò chuyện khi đặt chỗ.",
      },
    ],
  },
  {
    slug: "nightlife-coupon-guide",
    title: "Cách dùng coupon và tích điểm hiệu quả",
    description:
      "Tóm tắt cách xem ưu đãi, dùng mã hợp lệ và tích điểm thành viên sau khi hóa đơn được duyệt.",
    category: "Ưu đãi",
    date: "2026-06-08",
    publishedAt: "2026-06-08",
    updatedAt: "2026-06-30",
    status: "PUBLISHED",
    noindex: false,
    readTime: "5 phút đọc",
    author: "Đội ngũ Vietyoru",
    image:
      "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Ly cocktail đặt trên quầy bar",
    tags: ["Coupon", "Điểm thành viên", "Ưu đãi"],
    sections: [
      {
        heading: "Kiểm tra điều kiện mã",
        body:
          "Một số mã áp dụng theo hạng thành viên, thời gian hoặc mức chi tiêu. Điều kiện cuối cùng sẽ được admin xác nhận với quán.",
      },
      {
        heading: "Điểm cộng sau khi duyệt bill",
        body:
          "Điểm thành viên được cộng sau khi hóa đơn hợp lệ được duyệt. Nếu thông tin hóa đơn chưa đủ, admin có thể yêu cầu bổ sung.",
      },
    ],
  },
];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const slugifyBlogTerm = (value: string) =>
  normalizeText(value)
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const asSections = (value: unknown): BlogPost["sections"] =>
  Array.isArray(value)
    ? value
        .map((item) => {
          const record = asRecord(item);
          if (!record || typeof record.heading !== "string" || typeof record.body !== "string") {
            return null;
          }

          return { heading: record.heading, body: record.body };
        })
        .filter((item): item is BlogPost["sections"][number] => Boolean(item))
    : [];

const mapCmsContentToBlogPost = (content: CmsContentItem): BlogPost | null => {
  if (content.type !== "BLOG" || content.status !== "PUBLISHED") return null;

  const metadata = asRecord(content.metadata) ?? {};
  const publishedAt = content.publishedAt?.slice(0, 10) ?? content.createdAt.slice(0, 10);
  const sections = asSections(metadata.sections);

  return {
    slug: content.slug,
    title: content.title,
    description: content.excerpt ?? content.body?.slice(0, 160) ?? content.title,
    category: typeof metadata.category === "string" ? metadata.category : "Cẩm nang nightlife",
    date: publishedAt,
    publishedAt,
    updatedAt: content.updatedAt.slice(0, 10),
    status: "PUBLISHED",
    noindex: content.noindex === true || metadata.noindex === true,
    readTime: typeof metadata.readTime === "string" ? metadata.readTime : "5 phút đọc",
    author:
      content.author?.displayName ??
      (typeof metadata.author === "string" ? metadata.author : "Đội ngũ Vietyoru"),
    image:
      typeof metadata.image === "string"
        ? metadata.image
        : "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=78",
    imageAlt:
      typeof metadata.imageAlt === "string" ? metadata.imageAlt : `Ảnh minh họa cho ${content.title}`,
    featured: metadata.featured === true,
    tags: asStringArray(metadata.tags),
    sections: sections.length
      ? sections
      : content.body
        ? [{ heading: content.title, body: content.body }]
        : [],
  };
};

const staticPublishedBlogPosts = () => blogPosts.filter((post) => post.status === "PUBLISHED");

const sortBlogPosts = (posts: BlogPost[]) =>
  [...posts].sort(
    (first, second) =>
      new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime(),
  );

const mergeBlogPosts = (cmsPosts: BlogPost[]) => {
  const postsBySlug = new Map(staticPublishedBlogPosts().map((post) => [post.slug, post]));

  for (const post of cmsPosts) {
    postsBySlug.set(post.slug, post);
  }

  return sortBlogPosts(Array.from(postsBySlug.values()));
};

export const getPublishedBlogPosts = async () => {
  try {
    const response = await contentApi.list({ type: "BLOG", limit: 100 });
    const cmsPosts = response.data
      .map(mapCmsContentToBlogPost)
      .filter((post): post is BlogPost => Boolean(post))
      .filter((post) => post.status === "PUBLISHED");

    if (cmsPosts.length) return mergeBlogPosts(cmsPosts);
  } catch {
    // Seed content keeps static builds and demos working until CMS data is available.
  }

  return sortBlogPosts(staticPublishedBlogPosts());
};

export const getSitemapBlogPosts = async () =>
  (await getPublishedBlogPosts()).filter((post) => !post.noindex);

export const getFeaturedBlogPost = async () => {
  const posts = await getPublishedBlogPosts();
  return posts.find((post) => post.featured && !post.noindex) ?? posts.find((post) => !post.noindex) ?? posts[0]!;
};

export const getBlogPost = async (slug: string) =>
  (await getPublishedBlogPosts()).find((post) => post.slug === slug);

export const getBlogCategories = (posts: BlogPost[]) =>
  Array.from(new Set(posts.filter((post) => !post.noindex).map((post) => post.category)));

export const getBlogTags = (posts: BlogPost[]) =>
  Array.from(new Set(posts.filter((post) => !post.noindex).flatMap((post) => post.tags)));

export const findBlogCategoryBySlug = (posts: BlogPost[], slug: string) =>
  getBlogCategories(posts).find((category) => slugifyBlogTerm(category) === slug);

export const findBlogTagBySlug = (posts: BlogPost[], slug: string) =>
  getBlogTags(posts).find((tag) => slugifyBlogTerm(tag) === slug);

export const filterBlogPosts = (
  posts: BlogPost[],
  filters: { q?: string; category?: string; tag?: string } = {},
) => {
  const query = normalizeText(filters.q ?? "");

  return posts
    .filter((post) => !post.noindex)
    .filter((post) => !filters.category || slugifyBlogTerm(post.category) === filters.category)
    .filter((post) => !filters.tag || post.tags.some((tag) => slugifyBlogTerm(tag) === filters.tag))
    .filter((post) => {
      if (!query) return true;

      return [post.title, post.description, post.category, post.tags.join(" "), post.author]
        .map(normalizeText)
        .some((value) => value.includes(query));
    });
};

export const featuredBlogPost = blogPosts.find((post) => post.featured) ?? blogPosts[0]!;
