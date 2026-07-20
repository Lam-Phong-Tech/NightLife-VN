import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Chi tiết mã ưu đãi",
  "Chi tiết mã ưu đãi cá nhân trên Vietyoru.",
);

export default function CouponDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
