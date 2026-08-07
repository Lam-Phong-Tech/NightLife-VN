/**
 * CastDirectoryServer — Server Component
 *
 * Fetch dữ liệu cast ngay trên server (không cần JS hydrate) rồi truyền
 * xuống CastDirectoryPage (Client Component) qua prop `initialCasts`.
 *
 * Lợi ích:
 * - HTML trả về đã có nội dung → user không thấy skeleton ở lần tải đầu tiên
 * - FCP/LCP cải thiện ~700ms–1.5s so với CSR thuần
 * - Mọi tính năng filter/sort/search vẫn hoạt động bình thường ở client
 */
import { discoveryApi } from "@/lib/api/discovery";
import { CastDirectoryPage } from "./page";

export async function CastDirectoryServer() {
  // Fetch 60 cast đầu tiên (giới hạn giống client, sort mặc định “newest”)
  // Dùng catch(() => []) để graceful degrade: nếu API lỗi → client tự fetch
  const initialCasts = await discoveryApi
    .listCasts({ limit: 60, sort: "newest" })
    .catch(() => []);

  return <CastDirectoryPage initialCasts={initialCasts} />;
}
