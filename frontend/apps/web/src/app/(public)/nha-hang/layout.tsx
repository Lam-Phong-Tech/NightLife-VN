import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Nhà hàng đi đêm",
  description:
    "Khám phá nhà hàng, dining lounge và địa điểm ăn tối phù hợp lịch trình nightlife trên Vietyoru.",
  path: "/nha-hang",
});

export default function RestaurantLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Nhà hàng", path: "/nha-hang" },
        ]}
        idPath="/nha-hang"
      />
      {children}
    </>
  );
}
