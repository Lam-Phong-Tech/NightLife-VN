import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Bảo trì",
  "Trang thông báo bảo trì hệ thống Vietyoru.",
);

export default function MaintenanceLayout({ children }: { children: ReactNode }) {
  return children;
}
