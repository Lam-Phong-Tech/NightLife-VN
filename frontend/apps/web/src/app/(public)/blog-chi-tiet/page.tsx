import { redirect } from "next/navigation";
import { featuredBlogPost } from "@/lib/content/blog";

export default function LegacyBlogDetailPage() {
  redirect(`/blog/${featuredBlogPost.slug}`);
}
