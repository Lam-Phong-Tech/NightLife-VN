import { absoluteSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

const llmsText = `# Vietyoru

> Vietyoru là hướng dẫn nightlife tại Việt Nam, giúp người dùng tìm quán, hồ sơ cast, ưu đãi và tour.

## Nội dung chính

- [Trang chủ](${absoluteSiteUrl("/vi")})
- [Tìm quán](${absoluteSiteUrl("/vi/danh-sach-quan")})
- [Danh sách cast](${absoluteSiteUrl("/vi/danh-sach-cast")})
- [Bảng xếp hạng](${absoluteSiteUrl("/vi/xep-hang")})
- [Ưu đãi](${absoluteSiteUrl("/vi/uu-dai")})
- [Tour nightlife](${absoluteSiteUrl("/vi/tour")})
- [Blog và cẩm nang](${absoluteSiteUrl("/vi/blog")})

## Dữ liệu cập nhật

- [Sitemap XML](${absoluteSiteUrl("/sitemap.xml")})
- [Robots.txt](${absoluteSiteUrl("/robots.txt")})

## Quy ước URL

- Trang chi tiết quán: /{locale}/stores/{slug}
- Trang chi tiết cast: /{locale}/casts/{slug}
- Locale hỗ trợ: vi, en, ja, ko, zh
`;

export function GET() {
  return new Response(llmsText, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
