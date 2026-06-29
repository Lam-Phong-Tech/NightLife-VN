"use client";

import { SystemStatusPage } from "@/components/ui/SystemStatusPage";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <SystemStatusPage
      kind="server-error"
      onRetry={reset}
      contextTitle="Không tải được thông tin quán"
      contextDescription="Hệ thống chưa lấy được dữ liệu chi tiết quán. Bạn có thể thử lại hoặc quay về danh sách quán."
      secondaryHref="/danh-sach-quan"
      secondaryLabel="Danh sách quán"
    />
  );
}
