import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createI18nNoindexMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createI18nNoindexMetadata(
    "Gửi hóa đơn",
    "Luồng gửi hóa đơn cá nhân trên Vietyoru.",
  );
}

export default function BillSubmissionLayout({ children }: { children: ReactNode }) {
  return children;
}
