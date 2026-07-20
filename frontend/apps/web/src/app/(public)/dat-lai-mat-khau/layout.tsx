import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Đặt lại mật khẩu",
  "Luồng đặt lại mật khẩu tài khoản Vietyoru.",
);

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
