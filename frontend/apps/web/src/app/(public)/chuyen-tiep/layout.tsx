import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Chuyển tiếp",
  "Trang chuyển tiếp kỹ thuật của Vietyoru.",
);

export default function RedirectLayout({ children }: { children: ReactNode }) {
  return children;
}
