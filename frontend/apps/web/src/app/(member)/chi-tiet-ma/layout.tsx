import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Chi tiết mã ưu đãi",
    "Chi tiết mã ưu đãi cá nhân trên Vietyoru.",
  );
}

export default function CouponDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
