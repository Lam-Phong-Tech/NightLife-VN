import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Đăng nhập đối tác",
    "Trang đăng nhập dành cho đối tác Vietyoru.",
  );
}

export default function PartnerLoginLayout({ children }: { children: ReactNode }) {
  return children;
}
