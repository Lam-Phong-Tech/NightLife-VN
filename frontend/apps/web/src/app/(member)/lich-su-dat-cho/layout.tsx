import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Lịch sử đặt chỗ",
  "Lịch sử đặt chỗ cá nhân trên Vietyoru.",
);

export default function BookingHistoryLayout({ children }: { children: ReactNode }) {
  return children;
}
