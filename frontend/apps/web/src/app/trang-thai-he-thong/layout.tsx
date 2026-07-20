import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Trạng thái hệ thống",
  "Trang trạng thái kỹ thuật của Vietyoru.",
);

export default function SystemStatusLayout({ children }: { children: ReactNode }) {
  return children;
}
