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
          "/tai-khoan",
          "/dat-cho",
          "/lich-su-dat-cho",
          "/member",
        ],
      },
    ],
    sitemap: absoluteSiteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
