import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Đặt lại mật khẩu",
    "Luồng đặt lại mật khẩu tài khoản Vietyoru.",
  );
}

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
