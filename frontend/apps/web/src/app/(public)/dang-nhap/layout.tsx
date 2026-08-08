import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Đăng nhập hội viên",
    "Trang đăng nhập tài khoản Vietyoru.",
  );
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
