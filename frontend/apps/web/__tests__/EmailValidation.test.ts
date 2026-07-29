import { describe, expect, it } from "vitest";

import { normalizeEmailAddress, validateEmailAddress } from "../src/lib/email-validation";

describe("email validation", () => {
  it("accepts valid email addresses across different domains", () => {
    expect(normalizeEmailAddress("  USER@Gmail.COM  ")).toBe("user@gmail.com");
    expect(validateEmailAddress("  USER@Gmail.COM  ")).toBe("");
    expect(validateEmailAddress("user@yahoo.com")).toBe("");
    expect(validateEmailAddress("user@ghhd.com")).toBe("");
    expect(validateEmailAddress("user@company.vn")).toBe("");
    expect(validateEmailAddress("user.name+tag@mail.company.co.jp")).toBe("");
  });

  it("rejects malformed email addresses", () => {
    const invalidEmailFormatMessage = "Email chưa đúng định dạng.";
    const invalidEmailDomainMessage = "Phần sau dấu @ phải là tên miền hợp lệ, ví dụ company.com.";

    expect(validateEmailAddress("user@")).toBe(invalidEmailFormatMessage);
    expect(validateEmailAddress("user@@ghhd.com")).toBe(invalidEmailFormatMessage);
    expect(validateEmailAddress("user@localhost")).toBe(invalidEmailDomainMessage);
    expect(validateEmailAddress("user@ghhd.c")).toBe(invalidEmailDomainMessage);
  });
});
