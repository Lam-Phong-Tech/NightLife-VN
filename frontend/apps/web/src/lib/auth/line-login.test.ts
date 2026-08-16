import { describe, expect, it } from "vitest";

import {
  buildLineLiffUrl,
  buildLineWebLoginUrl,
  isInvalidLineOAuthState,
  normalizeLineLoginRedirect,
} from "./line-login";

describe("LINE login redirect", () => {
  it("builds a LIFF universal link that preserves the post-login destination", () => {
    expect(buildLineLiffUrl("1234567890-AbcdEfgh", "/lich-su-dat-cho?tab=upcoming")).toBe(
      "https://liff.line.me/1234567890-AbcdEfgh/?redirect=%2Flich-su-dat-cho%3Ftab%3Dupcoming",
    );
  });

  it("recognizes only the LINE state error as a LIFF recovery case", () => {
    expect(isInvalidLineOAuthState("LINE login state is invalid. Please try again.")).toBe(true);
    expect(isInvalidLineOAuthState("Invalid LINE authorization code")).toBe(false);
    expect(isInvalidLineOAuthState(null)).toBe(false);
  });

  it("starts web OAuth on the public app origin so its cookie matches the callback host", () => {
    expect(
      buildLineWebLoginUrl(
        "https://vietyoru.com",
        "/lich-su-dat-cho?tab=upcoming",
      ),
    ).toBe(
      "https://vietyoru.com/api/backend/auth/line/start?redirect=%2Flich-su-dat-cho%3Ftab%3Dupcoming",
    );
  });

  it("sanitizes unsafe redirects in the web OAuth URL", () => {
    expect(buildLineWebLoginUrl("https://vietyoru.com", "https://evil.example")).toBe(
      "https://vietyoru.com/api/backend/auth/line/start?redirect=%2Ftai-khoan",
    );
  });

  it.each([null, "", "https://evil.example", "//evil.example"])(
    "falls back to the member account for an unsafe redirect: %s",
    (redirect) => {
      expect(normalizeLineLoginRedirect(redirect)).toBe("/tai-khoan");
    },
  );
});
