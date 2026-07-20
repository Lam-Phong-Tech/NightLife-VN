import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Xác nhận email",
  "Trang xác nhận đồng ý email cho tài khoản Vietyoru.",
);

export default function LineEmailConsentLayout({ children }: { children: ReactNode }) {
  return children;
}
