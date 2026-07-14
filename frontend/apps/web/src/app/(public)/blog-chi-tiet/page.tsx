import { redirect } from "next/navigation";
import { getFeaturedBlogPost } from "@/lib/content/blog";

export default async function LegacyBlogDetailPage() {
  const featuredBlogPost = await getFeaturedBlogPost();
  if (!featuredBlogPost) {
    redirect("/blog");
  }
  redirect(`/blog/${featuredBlogPost.slug}`);
}
