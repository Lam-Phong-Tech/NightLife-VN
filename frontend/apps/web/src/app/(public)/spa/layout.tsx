import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Spa và massage nightlife",
  description:
    "Tìm spa, massage và địa điểm thư giãn buổi tối theo khu vực, giá tham khảo và ưu đãi trên Vietyoru.",
  path: "/spa",
});

export default function SpaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Spa", path: "/spa" },
        ]}
        idPath="/spa"
      />
      {children}
    </>
  );
}
