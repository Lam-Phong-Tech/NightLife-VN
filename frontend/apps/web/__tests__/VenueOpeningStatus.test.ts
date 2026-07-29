import { describe, expect, it } from "vitest";

import { openingStatus } from "@/app/(public)/danh-sach-quan/page";
import type { PublicStore } from "@/lib/api/discovery";

const overnightStore = {
  openingHours: {
    monday: { hours: "20:00 - 24:00" },
    tuesday: { hours: "00:00 - 02:00, 20:00 - 24:00" },
    wednesday: { hours: "00:00 - 02:00" },
  },
} as unknown as PublicStore;

describe("venue list opening status", () => {
  it("shows split calendar ranges as one overnight customer-facing range", () => {
    expect(openingStatus(overnightStore, "vi", new Date(2026, 6, 27, 21))).toEqual({
      label: "20:00 - 02:00 (hôm sau)",
      isOpen: true,
      tone: "open",
    });
  });

  it("keeps the early next-day range attached to the previous business day", () => {
    expect(openingStatus(overnightStore, "vi", new Date(2026, 6, 28, 1))).toEqual({
      label: "20:00 - 02:00 (hôm sau)",
      isOpen: true,
      tone: "open",
    });
  });

  it("shows the current business day after the previous overnight range closes", () => {
    expect(openingStatus(overnightStore, "vi", new Date(2026, 6, 28, 3))).toEqual({
      label: "20:00 - 02:00 (hôm sau)",
      isOpen: false,
      tone: "closed",
    });
  });
});
