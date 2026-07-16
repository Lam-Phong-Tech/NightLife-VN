import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SystemStatusPage } from "@/components/ui/SystemStatusPage";
import { languageStorageKey } from "@/lib/i18n/client-translations";

describe("SystemStatusPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("uses the stored language for not-found copy", async () => {
    window.localStorage.setItem(languageStorageKey, "en");

    render(<SystemStatusPage kind="not-found" />);

    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByText("Not found")).toBeInTheDocument();
    expect(screen.getByText("Search venues or Cast...")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to home/i })).toHaveAttribute("href", "/");
  });
});
