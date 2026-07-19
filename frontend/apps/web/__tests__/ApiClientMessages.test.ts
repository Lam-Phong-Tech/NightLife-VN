import { describe, expect, it } from "vitest";

import { translateApiMessage } from "../src/lib/api/client";
import { translateText } from "../src/lib/i18n/client-translations";

describe("API client messages", () => {
  it("localizes booking rate-limit errors after API message normalization", () => {
    const viMessage = translateApiMessage(
      "Too many booking requests. Please try again shortly.",
      429,
    );

    expect(viMessage).toBe(
      "Bạn gửi yêu cầu đặt bàn quá nhanh. Vui lòng chờ một chút rồi thử lại.",
    );
    expect(translateText(viMessage, "en")).toBe(
      "Too many booking requests. Please wait a moment and try again.",
    );
    expect(translateText(viMessage, "ja")).toBe(
      "予約リクエストが多すぎます。少し待ってからもう一度お試しください。",
    );
  });

  it("localizes the storage API unsupported-file response", () => {
    expect(
      translateApiMessage(
        "Unsupported file type. Upload image, SVG, video, or PDF files only.",
        400,
      ),
    ).toBe(
      "File không đúng định dạng. Chỉ chấp nhận ảnh JPG, JPEG, PNG, WebP, GIF, SVG; video MP4, WebM hoặc file PDF.",
    );
  });
});
