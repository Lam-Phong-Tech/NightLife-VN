import { contentApi, getCmsContentImageUrl, type CmsContentItem } from "@/lib/api/content";

export type BlogStatus = "DRAFT" | "PUBLISHED";
export type BlogLanguageCode = "vi" | "en" | "ja" | "ko" | "zh";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
  status: BlogStatus;
  noindex?: boolean;
  readTime: string;
  author: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  languages: BlogLanguageCode[];
  tags: string[];
  sections: Array<{
    heading: string;
    body: string;
  }>;
};

export const blogPosts: BlogPost[] = [];

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

const normalizeBlogLanguage = (value: unknown): BlogLanguageCode | null => {
  if (typeof value !== "string") return null;

  const raw = value.trim().toLowerCase();
  const normalized = normalizeText(raw);

  if (["vi", "vn", "vie", "vietnamese"].includes(normalized) || normalized.includes("tieng viet")) {
    return "vi";
  }

  if (["en", "eng", "english"].includes(normalized)) {
    return "en";
  }

  if (["ja", "jp", "jpn", "japanese"].includes(normalized) || raw.includes("日本")) {
    return "ja";
  }

  if (["ko", "kr", "kor", "korean"].includes(normalized) || raw.includes("한국")) {
    return "ko";
  }

  if (["zh", "cn", "chn", "chinese"].includes(normalized) || raw.includes("中文") || raw.includes("中国")) {
    return "zh";
  }

  return null;
};

const asBlogLanguages = (...values: unknown[]): BlogLanguageCode[] => {
  const languages = new Set<BlogLanguageCode>();
  const collect = (value: unknown) => {
    const directLanguage = normalizeBlogLanguage(value);
    if (directLanguage) {
      languages.add(directLanguage);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }

    const record = asRecord(value);
    if (record) {
      Object.entries(record).forEach(([key, enabled]) => {
        if (enabled === false || enabled === null || enabled === undefined) return;
        collect(key);
      });
    }
  };

  values.forEach(collect);

  return Array.from(languages);
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const stripHtmlToText = (value?: string | null) =>
  decodeHtmlEntities(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeRichTextHtml = (value: string) =>
  /&lt;\/?[a-z][\s\S]*&gt;/i.test(value) ? decodeHtmlEntities(value) : value;

const asSections = (value: unknown): BlogPost["sections"] =>
  Array.isArray(value)
    ? value
        .map((item) => {
          const record = asRecord(item);
          if (!record || typeof record.heading !== "string" || typeof record.body !== "string") {
            return null;
          }

          return { heading: record.heading, body: normalizeRichTextHtml(record.body) };
        })
        .filter((item): item is BlogPost["sections"][number] => Boolean(item))
    : [];

const mapCmsContentToBlogPost = (content: CmsContentItem, preview: boolean = false): BlogPost | null => {
  if (content.type !== "BLOG") return null;
  if (!preview && content.status !== "PUBLISHED") return null;

  const metadata = asRecord(content.metadata) ?? {};
  const createdAt = content.createdAt;
  const publishedAt = content.publishedAt?.slice(0, 10) ?? content.createdAt.slice(0, 10);
  const sections = asSections(metadata.sections);
  const configuredLanguages = asBlogLanguages(
    metadata.language,
    metadata.languages,
    metadata.displayLanguage,
    metadata.displayLanguages,
  );
  const image = getCmsContentImageUrl(content);
  const description =
    stripHtmlToText(content.excerpt) ||
    stripHtmlToText(content.body).slice(0, 160) ||
    content.title;

  return {
    slug: content.slug,
    title: content.title,
    description,
    category: typeof metadata.category === "string" ? metadata.category : "Cẩm nang nightlife",
    date: publishedAt,
    createdAt,
    publishedAt,
    updatedAt: content.updatedAt.slice(0, 10),
    status: content.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    noindex: content.noindex === true || metadata.noindex === true,
    readTime: typeof metadata.readTime === "string" ? metadata.readTime : "5 phút đọc",
    author:
      content.author?.displayName ??
      (typeof metadata.author === "string" ? metadata.author : "Đội ngũ Vietyoru"),
    image:
      image ??
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=78",
    imageAlt:
      typeof metadata.imageAlt === "string" ? metadata.imageAlt : `Ảnh minh họa cho ${content.title}`,
    featured: metadata.featured === true,
    languages: configuredLanguages.length ? configuredLanguages : ["vi"],
    tags: asStringArray(metadata.tags),
    sections: sections.length
      ? sections
      : content.body
        ? [{ heading: content.title, body: normalizeRichTextHtml(content.body) }]
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
      .map((post) => mapCmsContentToBlogPost(post))
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
  return posts.find((post) => post.featured && !post.noindex) ?? posts.find((post) => !post.noindex) ?? posts[0];
};

export const getBlogPost = async (slug: string, options?: { preview?: boolean }) => {
  const posts = await getPublishedBlogPosts();
  const found = posts.find((post) => post.slug === slug);
  if (found) return found;

  try {
    const response = await contentApi.get(slug, options?.preview ? { preview: "1" } : undefined);
    if (response) {
      const mapped = mapCmsContentToBlogPost(response, options?.preview);
      if (mapped) return mapped;
    }
  } catch (error) {
    // Ignored, fallback to undefined
  }

  return undefined;
};

export const getBlogCategories = (posts: BlogPost[]) =>
  Array.from(new Set(posts.filter((post) => !post.noindex).map((post) => post.category)));

export const getBlogTags = (posts: BlogPost[]) =>
  Array.from(new Set(posts.filter((post) => !post.noindex).flatMap((post) => post.tags)));

export const filterBlogPostsByLanguage = (posts: BlogPost[], language: BlogLanguageCode) =>
  posts.filter((post) => post.languages.includes(language));

export const findBlogCategoryBySlug = (posts: BlogPost[], slug: string) =>
  getBlogCategories(posts).find((category) => slugifyBlogTerm(category) === slug);

export const findBlogTagBySlug = (posts: BlogPost[], slug: string) =>
  getBlogTags(posts).find((tag) => slugifyBlogTerm(tag) === slug);

export const filterBlogPosts = (
  posts: BlogPost[],
  filters: { q?: string; category?: string; tag?: string; language?: BlogLanguageCode } = {},
) => {
  const query = normalizeText(filters.q ?? "");

  return posts
    .filter((post) => !post.noindex)
    .filter((post) => !filters.language || post.languages.includes(filters.language))
    .filter((post) => !filters.category || slugifyBlogTerm(post.category) === filters.category)
    .filter((post) => !filters.tag || post.tags.some((tag) => slugifyBlogTerm(tag) === filters.tag))
    .filter((post) => {
      if (!query) return true;

      return [post.title, post.description, post.category, post.tags.join(" "), post.author]
        .map(normalizeText)
        .some((value) => value.includes(query));
    });
};

export const featuredBlogPost = blogPosts.find((post) => post.featured) ?? blogPosts[0];
