import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Đã lưu",
    "Danh sách nội dung đã lưu của tài khoản Vietyoru.",
  );
}

export default function SavedLayout({ children }: { children: ReactNode }) {
  return children;
}
