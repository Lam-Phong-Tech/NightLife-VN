import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Bảo mật tài khoản",
    "Trang bảo mật tài khoản cá nhân trên Vietyoru.",
  );
}

export default function AccountSecurityLayout({ children }: { children: ReactNode }) {
  return children;
}
