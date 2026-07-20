import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Ưu đãi nightlife hôm nay",
  description:
    "Tổng hợp coupon, khuyến mãi và ưu đãi nightlife đang mở tại các quán đối tác trên Vietyoru.",
  path: "/uu-dai",
});

export default function OffersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Ưu đãi", path: "/uu-dai" },
        ]}
        idPath="/uu-dai"
      />
      {children}
    </>
  );
}
