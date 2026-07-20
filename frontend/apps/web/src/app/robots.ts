import type { MetadataRoute } from "next";
import { absoluteSiteUrl, siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/partner",
          "/api",
          "/dang-nhap",
          "/dang-nhap-doi-tac",
          "/quen-mat-khau",
          "/dat-lai-mat-khau",
          "/tai-khoan",
          "/bao-mat-tai-khoan",
          "/dat-cho",
          "/lich-su-dat-cho",
          "/gui-hoa-don",
          "/vi-uu-dai",
          "/xac-nhan",
          "/chi-tiet-ma",
          "/da-luu",
          "/line-email-consent",
          "/chuyen-tiep",
          "/maintenance",
          "/trang-thai-he-thong",
          "/blog-chi-tiet",
          "/member",
        ],
      },
    ],
    sitemap: absoluteSiteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
