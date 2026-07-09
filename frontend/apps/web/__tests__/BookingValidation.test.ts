import { describe, expect, it } from "vitest";
import {
  normalizeBookingDisplayName,
  normalizeBookingEmail,
  normalizeBookingNote,
  validateBookingDisplayName,
  validateBookingEmail,
  validateBookingFormFields,
  validateBookingPhone,
} from "../src/lib/booking-validation";

describe("booking validation", () => {
  it("normalizes input before validation", () => {
    expect(normalizeBookingDisplayName("  Nguyễn   Văn   A  ")).toBe("Nguyễn Văn A");
    expect(normalizeBookingEmail("  USER@Example.COM  ")).toBe("user@example.com");
    expect(normalizeBookingNote("  gần sân khấu  ")).toBe("gần sân khấu");
  });

  it("rejects display names that exceed 80 characters", () => {
    expect(validateBookingDisplayName("a".repeat(81))).toBe("Họ tên tối đa 80 ký tự.");
  });

  it("rejects display names with numbers or special characters", () => {
    expect(validateBookingDisplayName("Nguyễn Văn A1")).toBe(
      "Họ tên chỉ được nhập chữ cái và khoảng trắng.",
    );
    expect(validateBookingDisplayName("Nguyễn @@@")).toBe(
      "Họ tên chỉ được nhập chữ cái và khoảng trắng.",
    );
  });

  it("rejects invalid booking email parts with specific messages", () => {
    expect(validateBookingEmail(`${"a".repeat(65)}@gmail.com`)).toBe(
      "Phần trước dấu @ không được vượt quá 64 ký tự.",
    );
    expect(validateBookingEmail(`guest@${"a".repeat(64)}.com`)).toBe(
      "Mỗi phần của tên miền sau dấu @ không được vượt quá 63 ký tự.",
    );
    expect(validateBookingEmail("guest@gmail")).toBe(
      "Phần sau dấu @ phải là tên miền hợp lệ, ví dụ gmail.com.",
    );
  });

  it("rejects invalid phone numbers used by legacy guest booking flows", () => {
    expect(validateBookingPhone("abc0901234567")).toBe(
      "Số điện thoại chỉ được nhập số và các ký tự + - ( ) .",
    );
    expect(validateBookingPhone("11111111")).toBe(
      "Số điện thoại không được nhập một chữ số lặp lại.",
    );
    expect(validateBookingPhone("0901234")).toBe(
      "Số điện thoại phải có từ 8 đến 15 chữ số.",
    );
    expect(validateBookingPhone("+84 901 234 567")).toBe("");
  });

  it("validates the full booking form before submit", () => {
    expect(
      validateBookingFormFields({
        availableTimes: ["21:00"],
        bookingDate: "2026-07-08",
        bookingTime: "21:00",
        displayName: "a".repeat(81),
        email: "guest@gmail.com",
        guestCount: 4,
        maxDate: "2026-07-22",
        note: "",
        phone: "0901234567",
        scheduledAt: "2099-07-08T14:00:00.000Z",
        todayDate: "2026-07-08",
      }),
    ).toBe("Họ tên tối đa 80 ký tự.");

    expect(
      validateBookingFormFields({
        availableTimes: ["21:00"],
        bookingDate: "2026-07-08",
        bookingTime: "21:00",
        displayName: "Nguyễn Văn A",
        email: "guest@gmail.com",
        guestCount: 4,
        maxDate: "2026-07-22",
        note: "x".repeat(301),
        phone: "0901234567",
        scheduledAt: "2099-07-08T14:00:00.000Z",
        todayDate: "2026-07-08",
      }),
    ).toBe("Ghi chú tối đa 300 ký tự.");
  });
});
