import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createNoindexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createNoindexMetadata(
  "Quên mật khẩu",
  "Luồng quên mật khẩu tài khoản Vietyoru.",
);

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
