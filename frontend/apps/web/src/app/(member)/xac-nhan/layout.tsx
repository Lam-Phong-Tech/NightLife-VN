import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Xác nhận",
  "Màn hình xác nhận thao tác cá nhân trên Vietyoru.",
);

export default function ConfirmationLayout({ children }: { children: ReactNode }) {
  return children;
}
