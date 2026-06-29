"use client";

import { SystemStatusPage } from "@/components/ui/SystemStatusPage";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <SystemStatusPage
      kind="server-error"
      onRetry={reset}
      contextTitle="Không tải được profile cast"
      contextDescription="Hệ thống chưa lấy được dữ liệu cast detail. Bạn có thể thử lại hoặc quay về danh sách cast."
      secondaryHref="/danh-sach-cast"
      secondaryLabel="Danh sách cast"
    />
  );
}
