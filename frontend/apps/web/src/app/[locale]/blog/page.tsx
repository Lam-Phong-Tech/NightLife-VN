import type { Metadata } from "next";
import BlogPage from "../../(public)/blog/page";
import {
  requireRouteLanguage,
  type LocalizedRouteParams,
} from "@/lib/i18n/server-route-locale";
import { createLocalizedPageMetadata } from "@/lib/seo/localized-page-metadata";

type LocalizedBlogPageProps = {
  params: LocalizedRouteParams;
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
    lang?: string;
  }>;
};

export async function generateMetadata({
  params,
}: Pick<LocalizedBlogPageProps, "params">): Promise<Metadata> {
  return createLocalizedPageMetadata(await requireRouteLanguage(params), "blog");
}

export default async function LocalizedBlogPage({
  params,
  searchParams,
}: LocalizedBlogPageProps) {
  const locale = await requireRouteLanguage(params);
  const query = (await searchParams) ?? {};
  return <BlogPage searchParams={Promise.resolve({ ...query, lang: locale })} />;
}
