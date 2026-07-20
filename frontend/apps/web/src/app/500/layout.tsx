import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Lỗi hệ thống",
  "Trang báo lỗi hệ thống của Vietyoru.",
);

export default function ServerErrorLayout({ children }: { children: ReactNode }) {
  return children;
}
