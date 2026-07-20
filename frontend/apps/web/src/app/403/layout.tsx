import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Không có quyền truy cập",
  "Trang báo lỗi quyền truy cập của Vietyoru.",
);

export default function ForbiddenLayout({ children }: { children: ReactNode }) {
  return children;
}
