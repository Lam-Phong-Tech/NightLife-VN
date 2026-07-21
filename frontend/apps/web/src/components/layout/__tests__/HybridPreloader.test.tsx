import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HybridPreloader } from "../HybridPreloader";

const navigationState = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

describe("HybridPreloader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigationState.pathname = "/";
    window.sessionStorage.clear();
    document.documentElement.classList.remove("nl-brand-intro-seen");
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: "",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("shows the branded intro once and records the current session", () => {
    render(<HybridPreloader />);

    expect(screen.getByLabelText("Đang mở Vietyoru")).toBeInTheDocument();
    expect(window.sessionStorage.getItem("vy-brand-intro-seen")).toBe("1");

    act(() => vi.advanceTimersByTime(280));
    expect(screen.getByLabelText("Đang mở Vietyoru")).toHaveAttribute(
      "data-phase",
      "leaving",
    );

    act(() => vi.advanceTimersByTime(280));
    expect(screen.queryByLabelText("Đang mở Vietyoru")).not.toBeInTheDocument();
  });

  it("skips the branded intro after it has appeared in the session", () => {
    window.sessionStorage.setItem("vy-brand-intro-seen", "1");
    render(<HybridPreloader />);

    act(() => vi.advanceTimersByTime(0));
    expect(screen.queryByLabelText("Đang mở Vietyoru")).not.toBeInTheDocument();
  });

  it("delays route progress to avoid flicker and completes after navigation", () => {
    window.sessionStorage.setItem("vy-brand-intro-seen", "1");
    const { rerender } = render(
      <>
        <a href="/danh-sach-quan" onClick={(event) => event.preventDefault()}>
          Tìm quán
        </a>
        <HybridPreloader />
      </>,
    );

    act(() => vi.advanceTimersByTime(0));
    const progress = screen.getByLabelText("Đang chuyển trang");
    fireEvent.click(screen.getByRole("link", { name: "Tìm quán" }));
    expect(progress).toHaveAttribute("data-visible", "false");

    act(() => vi.advanceTimersByTime(130));
    expect(progress).toHaveAttribute("data-visible", "true");

    navigationState.pathname = "/danh-sach-quan";
    rerender(
      <>
        <a href="/danh-sach-quan" onClick={(event) => event.preventDefault()}>
          Tìm quán
        </a>
        <HybridPreloader />
      </>,
    );

    act(() => vi.advanceTimersByTime(220));
    expect(progress).toHaveAttribute("data-visible", "false");
  });
});
