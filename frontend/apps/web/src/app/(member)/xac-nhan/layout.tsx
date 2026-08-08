import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Xác nhận",
    "Màn hình xác nhận thao tác cá nhân trên Vietyoru.",
  );
}

export default function ConfirmationLayout({ children }: { children: ReactNode }) {
  return children;
}
