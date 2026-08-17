import type { MetadataRoute } from "next";
import { absoluteSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          // Public data requested by the locale homepages during rendering.
          "/api/backend/content/",
          "/api/backend/contents",
          "/api/backend/public/",
          "/api/backend/rankings",
          "/api/backend/stores",
          "/api/backend/casts",
          "/api/backend/system-config/appearance",
          "/api/currency/rates",
        ],
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
          "/blog-chi-tiet",
          "/member",
        ],
      },
    ],
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  };
}

