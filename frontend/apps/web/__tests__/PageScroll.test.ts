import { describe, expect, it } from "vitest";
import { shouldResetPageScroll } from "@/lib/page-scroll";

describe("homepage scroll reset", () => {
  it("skips the initial reset when every scroll container is already at zero", () => {
    expect(shouldResetPageScroll({ windowX: 0, windowY: 0, rootY: 0, bodyY: 0 })).toBe(false);
  });

  it("keeps route navigation reset behavior when the document is scrolled", () => {
    expect(shouldResetPageScroll({ windowX: 0, windowY: 320, rootY: 320, bodyY: 0 })).toBe(true);
  });
});
