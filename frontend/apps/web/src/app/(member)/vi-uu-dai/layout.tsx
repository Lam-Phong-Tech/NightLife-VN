import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Ví ưu đãi",
    "Ví ưu đãi cá nhân trên Vietyoru.",
  );
}

export default function CouponWalletLayout({ children }: { children: ReactNode }) {
  return children;
}
