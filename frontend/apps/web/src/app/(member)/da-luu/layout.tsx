import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Đã lưu",
  "Danh sách nội dung đã lưu của tài khoản Vietyoru.",
);

export default function SavedLayout({ children }: { children: ReactNode }) {
  return children;
}
