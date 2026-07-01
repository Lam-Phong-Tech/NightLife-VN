import { redirect } from "next/navigation";
import { getFeaturedBlogPost } from "@/lib/content/blog";

export default async function LegacyBlogDetailPage() {
  const featuredBlogPost = await getFeaturedBlogPost();
  redirect(`/blog/${featuredBlogPost.slug}`);
}
