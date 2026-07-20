import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Tìm quán nightlife tại Việt Nam",
  description:
    "Khám phá danh sách quán bar, club, lounge, karaoke, spa và nhà hàng nightlife tại Việt Nam trên Vietyoru.",
  path: "/danh-sach-quan",
});

export default function StoreListLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Tìm quán", path: "/danh-sach-quan" },
        ]}
        idPath="/danh-sach-quan"
      />
      {children}
    </>
  );
}
