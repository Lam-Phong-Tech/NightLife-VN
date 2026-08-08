/**
 * CastDirectoryServer — Server Component
 *
 * Fetch dữ liệu cast ngay trên server (không cần JS hydrate) rồi truyền
 * xuống CastDirectoryPage (Client Component) qua prop `initialCasts` và `initialTotal`.
 *
 * Lợi ích:
 * - HTML trả về đã có nội dung → user không thấy skeleton ở lần tải đầu tiên
 * - FCP/LCP cải thiện ~700ms–1.5s so với CSR thuần
 * - Mọi tính năng filter/sort/search vẫn hoạt động bình thường ở client
 */
import { discoveryApi } from "@/lib/api/discovery";
import { CastDirectoryPage } from "./page";

export async function CastDirectoryServer() {
  // Fetch trang 1 với 12 cast (giống limit client-side), sort mặc định "newest"
  // Dùng catch(() => null) để graceful degrade: nếu API lỗi → client tự fetch
  const result = await discoveryApi
    .listCasts({ limit: 12, page: 1, sort: "newest" })
    .catch(() => null);

  return (
    <CastDirectoryPage
      initialCasts={result?.casts ?? []}
      initialTotal={result?.total ?? 0}
    />
  );
}
