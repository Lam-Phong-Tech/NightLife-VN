"use client";

import { useEffect } from "react";
import { SystemStatusPage } from "./SystemStatusPage";

type StoreDetailErrorFallbackProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function StoreDetailErrorFallback({ error, reset }: StoreDetailErrorFallbackProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SystemStatusPage
      kind="server-error"
      digest={error.digest}
      contextTitle="Không thể tải thông tin quán"
      contextDescription="Kết nối tới dữ liệu quán đang tạm thời gián đoạn. Vui lòng thử lại sau ít phút."
      onRetry={reset}
    />
  );
}
