import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Đăng nhập",
  "Trang đăng nhập tài khoản Vietyoru.",
);

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
