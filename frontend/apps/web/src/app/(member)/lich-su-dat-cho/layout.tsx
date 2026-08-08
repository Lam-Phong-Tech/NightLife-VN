import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Lịch sử đặt chỗ",
    "Lịch sử đặt chỗ cá nhân trên Vietyoru.",
  );
}

export default function BookingHistoryLayout({ children }: { children: ReactNode }) {
  return children;
}
