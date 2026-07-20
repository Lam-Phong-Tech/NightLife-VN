import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Bảng xếp hạng nightlife",
  description:
    "Xem bảng xếp hạng quán và cast nổi bật theo khu vực, mức độ quan tâm và tín hiệu hoạt động trên Vietyoru.",
  path: "/xep-hang",
});

export default function RankingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Bảng xếp hạng", path: "/xep-hang" },
        ]}
        idPath="/xep-hang"
      />
      {children}
    </>
  );
}
