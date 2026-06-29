import { SystemStatusPage } from "@/components/ui/SystemStatusPage";

export default function NotFound() {
  return (
    <SystemStatusPage
      kind="not-found"
      contextTitle="Không tìm thấy quán"
      contextDescription="Slug này không tồn tại hoặc quán chưa được công khai. Thử tìm quán khác trong danh sách."
      secondaryHref="/danh-sach-quan"
      secondaryLabel="Xem danh sách quán"
    />
  );
}
