import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Bảo mật tài khoản",
  "Trang bảo mật tài khoản cá nhân trên Vietyoru.",
);

export default function AccountSecurityLayout({ children }: { children: ReactNode }) {
  return children;
}
