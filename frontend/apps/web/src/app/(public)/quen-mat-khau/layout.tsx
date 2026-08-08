import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Quên mật khẩu",
    "Luồng quên mật khẩu tài khoản Vietyoru.",
  );
}

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
