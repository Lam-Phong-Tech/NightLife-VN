import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Danh sách cast nightlife",
  description:
    "Tìm hồ sơ cast công khai, khu vực hoạt động, ngôn ngữ hỗ trợ và điểm đến phù hợp trên Vietyoru.",
  path: "/danh-sach-cast",
});

export default function CastListLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Cast", path: "/danh-sach-cast" },
        ]}
        idPath="/danh-sach-cast"
      />
      {children}
    </>
  );
}
