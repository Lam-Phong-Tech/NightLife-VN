import type { Metadata } from "next";

import { SystemStatusPage } from "@/components/ui/SystemStatusPage";

export const metadata: Metadata = {
  title: "Hệ thống đang cập nhật | Vietyoru",
  description: "Trang hỗ trợ LINE OA đang được Vietyoru cập nhật.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GuideUpdatingPage() {
  return (
    <SystemStatusPage
      kind="maintenance"
      contextTitle="Hệ thống đang cập nhật"
      contextDescription="Trang liên hệ hỗ trợ LINE OA đang được hoàn thiện. Bạn có thể quay về trang chủ hoặc tiếp tục tìm quán, cast và ưu đãi trong lúc chờ cập nhật."
      primaryHref="/"
      primaryLabel="Về trang chủ"
      secondaryHref="/danh-sach-quan"
      secondaryLabel="Tìm quán"
    />
  );
}
