import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Đang chuyển tiếp",
    "Trang chuyển tiếp kỹ thuật của Vietyoru.",
  );
}

export default function RedirectLayout({ children }: { children: ReactNode }) {
  return children;
}
