import { describe, expect, it } from "vitest";

import type { LegalPage } from "@/lib/api/content";
import {
  localizeLegalPage,
  parseLegalBody,
} from "@/lib/content/legal-localizations";

const privacyPage: LegalPage = {
  id: "privacy",
  key: "PRIVACY_POLICY",
  slug: "chinh-sach-bao-mat",
  title: "CHÍNH SÁCH BẢO MẬT",
  excerpt: "Vietnamese excerpt",
  sections: [
    {
      heading: "Thông tin chúng tôi thu thập",
      body: "Mở đầu\n- Mục một\n- Mục hai",
    },
  ],
  noindex: true,
  version: 6,
  publishedAt: "2026-08-10T18:23:06.015Z",
  createdAt: "2026-08-10T18:23:06.374Z",
  updatedAt: "2026-08-29T05:04:47.557Z",
};

describe("reviewed legal localizations", () => {
  it("renders the complete reviewed Japanese privacy policy", () => {
    const localized = localizeLegalPage(privacyPage, "ja");

    expect(localized.title).toBe("プライバシーポリシー");
    expect(localized.sections).toHaveLength(5);
    expect(localized.sections[0]?.heading).toBe("収集する情報");

    const purpose = parseLegalBody(localized.sections[1]?.body ?? "");
    expect(purpose.paragraphs).toEqual([
      "収集した情報は、以下の目的にのみ使用します：",
    ]);
    expect(purpose.bullets).toHaveLength(4);
    expect(new Set(purpose.bullets).size).toBe(4);
  });

  it("does not serve a stale legal translation after an admin publication", () => {
    const updatedPage = { ...privacyPage, version: 7 };

    expect(localizeLegalPage(updatedPage, "ja")).toBe(updatedPage);
  });

  it("keeps the Vietnamese source untouched for its native language", () => {
    expect(localizeLegalPage(privacyPage, "vi")).toBe(privacyPage);
  });
});

describe("legal body structure", () => {
  it("turns newline-prefixed policy items into semantic bullets without duplicates", () => {
    expect(
      parseLegalBody("Giới thiệu\n\n- Dòng một\n- Dòng hai\n"),
    ).toEqual({
      paragraphs: ["Giới thiệu"],
      bullets: ["Dòng một", "Dòng hai"],
    });
  });
});
