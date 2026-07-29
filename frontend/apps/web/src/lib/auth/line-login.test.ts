import { describe, expect, it } from "vitest";

import { buildLineLiffUrl, normalizeLineLoginRedirect } from "./line-login";

describe("LINE login redirect", () => {
  it("builds a LIFF universal link that preserves the post-login destination", () => {
    expect(buildLineLiffUrl("1234567890-AbcdEfgh", "/lich-su-dat-cho?tab=upcoming")).toBe(
      "https://liff.line.me/1234567890-AbcdEfgh/?redirect=%2Flich-su-dat-cho%3Ftab%3Dupcoming",
    );
  });

  it.each([null, "", "https://evil.example", "//evil.example"])(
    "falls back to the member account for an unsafe redirect: %s",
    (redirect) => {
      expect(normalizeLineLoginRedirect(redirect)).toBe("/tai-khoan");
    },
  );
});
