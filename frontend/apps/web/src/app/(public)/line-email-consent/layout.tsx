import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Cấp quyền Email từ LINE",
    "Trang xác nhận đồng ý email cho tài khoản Vietyoru.",
  );
}

export default function LineEmailConsentLayout({ children }: { children: ReactNode }) {
  return children;
}
