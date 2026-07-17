import { describe, expect, it } from "vitest";

import { normalizeEmailAddress, validateEmailAddress } from "../src/lib/email-validation";

describe("email validation", () => {
  it("only accepts valid gmail.com addresses for user-facing email fields", () => {
    const gmailOnlyMessage = "Vui lòng nhập email Gmail đúng định dạng, ví dụ name@gmail.com.";

    expect(normalizeEmailAddress("  USER@Gmail.COM  ")).toBe("user@gmail.com");
    expect(validateEmailAddress("  USER@Gmail.COM  ")).toBe("");
    expect(validateEmailAddress("user@yahoo.com")).toBe(gmailOnlyMessage);
    expect(validateEmailAddress("user@gmai.com")).toBe(gmailOnlyMessage);
    expect(validateEmailAddress("user@gmail.con")).toBe(gmailOnlyMessage);
  });
});
