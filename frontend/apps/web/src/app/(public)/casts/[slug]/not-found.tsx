import { SystemStatusPage } from "@/components/ui/SystemStatusPage";

export default function NotFound() {
  return (
    <SystemStatusPage
      kind="not-found"
      contextTitle="Không tìm thấy cast"
      contextDescription="Cast này không tồn tại, chưa active hoặc chưa được duyệt public qua CMS."
      secondaryHref="/danh-sach-cast"
      secondaryLabel="Xem danh sách cast"
    />
  );
}
