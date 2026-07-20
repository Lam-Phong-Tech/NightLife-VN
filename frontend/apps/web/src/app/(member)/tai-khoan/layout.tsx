import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Tài khoản",
  "Trang tài khoản cá nhân trên Vietyoru.",
);

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
