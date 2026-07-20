import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Đăng nhập đối tác",
  "Trang đăng nhập dành cho đối tác Vietyoru.",
);

export default function PartnerLoginLayout({ children }: { children: ReactNode }) {
  return children;
}
