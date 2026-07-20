import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Ví ưu đãi",
  "Ví ưu đãi cá nhân trên Vietyoru.",
);

export default function CouponWalletLayout({ children }: { children: ReactNode }) {
  return children;
}
