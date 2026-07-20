import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Đặt chỗ",
  "Luồng đặt chỗ cá nhân trên Vietyoru.",
);

export default function BookingLayout({ children }: { children: ReactNode }) {
  return children;
}
