import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Đặt chỗ",
    "Luồng đặt chỗ cá nhân trên Vietyoru.",
  );
}

export default function BookingLayout({ children }: { children: ReactNode }) {
  return children;
}
