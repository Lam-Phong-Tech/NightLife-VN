import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Khu vực đối tác",
  "Khu vực làm việc dành cho đối tác Vietyoru.",
);

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return children;
}
