import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Gửi hóa đơn",
  "Luồng gửi hóa đơn cá nhân trên Vietyoru.",
);

export default function BillSubmissionLayout({ children }: { children: ReactNode }) {
  return children;
}
