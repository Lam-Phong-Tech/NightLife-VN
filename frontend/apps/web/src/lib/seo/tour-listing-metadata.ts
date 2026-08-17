import type { Metadata } from "next";
import {
  defaultLanguageCode,
  languageAlternates,
  localizePathname,
} from "@/lib/i18n/locales";

export const TOUR_PAGE_METADATA: Metadata = {
  title: "Danh sách tour nightlife",
  description:
    "Danh sách tour nightlife thật theo dữ liệu quán, ưu đãi và khu vực đang hoạt động trên Vietyoru.",
  alternates: {
    canonical: "/tour",
    languages: {
      ...languageAlternates("/tour"),
      "x-default": localizePathname("/tour", defaultLanguageCode),
    },
  },
};
