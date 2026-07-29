import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AppearancePage from "@/app/admin/appearance/page";

const { apiClientMock, apiFormDataClientMock } = vi.hoisted(() => ({
  apiClientMock: vi.fn(),
  apiFormDataClientMock: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: apiClientMock,
  apiFormDataClient: apiFormDataClientMock,
  resolveClientUrl: (url: string) => url,
}));

describe("Appearance icon upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClientMock.mockResolvedValue({ data: null });
    apiFormDataClientMock.mockResolvedValue({
      id: "appearance-icon-1",
      url: "/storage/appearance/icon.png",
    });
  });

  afterEach(() => {
    cleanup();
    document.head
      .querySelectorAll('link[data-appearance-favicon="true"]')
      .forEach((link) => link.remove());
  });

  it("keeps the default icon color separate from the featured frame", async () => {
    render(<AppearancePage />);

    await waitFor(() => {
      expect(apiClientMock).toHaveBeenCalledWith("/system-config/appearance");
    });

    fireEvent.click(screen.getByTestId("appearance-quick-card-q2"));

    const featuredToggle = screen.getByRole("checkbox", {
      name: /Nổi bật \(có viền vàng bao quanh\)/i,
    });
    expect(featuredToggle).not.toBeChecked();

    const fileInput = document.querySelector<HTMLInputElement>(
      'input[type="file"][accept*="image/png"]',
    );
    expect(fileInput).not.toBeNull();

    const png = new File(["png"], "custom-icon.png", { type: "image/png" });
    fireEvent.change(fileInput!, { target: { files: [png] } });

    await waitFor(() => {
      expect(apiFormDataClientMock).toHaveBeenCalledWith(
        "/storage/upload",
        expect.any(FormData),
      );
    });

    expect(screen.getByTestId("appearance-icon-preview-frame")).toHaveStyle({
      border: "1px solid rgba(255, 255, 255, 0.07)",
      boxShadow: "none",
    });
    expect(featuredToggle).not.toBeChecked();

    fireEvent.click(featuredToggle);
    expect(screen.getByTestId("appearance-icon-preview-frame")).toHaveStyle({
      border: "1px solid rgba(212, 178, 106, 0.32)",
    });

    fireEvent.click(featuredToggle);
    expect(screen.getByTestId("appearance-icon-preview-frame")).toHaveStyle({
      border: "1px solid rgba(255, 255, 255, 0.07)",
    });

    fireEvent.click(await screen.findByText("Lưu & áp dụng"));

    await waitFor(() => {
      expect(apiClientMock).toHaveBeenCalledWith(
        "/admin/system-config/appearance",
        expect.objectContaining({ method: "PUT" }),
      );
    });

    const saveCall = apiClientMock.mock.calls.find(
      ([url]) => url === "/admin/system-config/appearance",
    );
    const savedQuickItems = saveCall?.[1]?.data?.value?.quick;
    const savedIcon = savedQuickItems?.find(
      (item: { id: string }) => item.id === "q2",
    );

    expect(savedIcon).toMatchObject({
      id: "q2",
      icon: "/storage/appearance/icon.png",
    });
    expect(savedIcon?.color).toBeUndefined();
    expect(savedIcon?.featured).toBeFalsy();
  });

  it("uploads, saves, and applies a dedicated favicon", async () => {
    apiFormDataClientMock.mockResolvedValueOnce({
      id: "appearance-favicon-1",
      url: "/storage/appearance/favicon.svg",
    });

    render(<AppearancePage />);

    await waitFor(() => {
      expect(apiClientMock).toHaveBeenCalledWith("/system-config/appearance");
    });

    fireEvent.click(screen.getByRole("button", { name: /Thay favicon/i }));

    const fileInput = screen.getByTestId(
      "appearance-favicon-file-input",
    ) as HTMLInputElement;
    const favicon = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"></svg>'],
      "favicon.svg",
      { type: "image/svg+xml" },
    );
    fireEvent.change(fileInput, { target: { files: [favicon] } });

    await waitFor(() => {
      expect(apiFormDataClientMock).toHaveBeenCalledWith(
        "/storage/upload",
        expect.any(FormData),
      );
    });

    const uploadForm = apiFormDataClientMock.mock.calls[0]?.[1] as FormData;
    expect(uploadForm.get("purpose")).toBe("APPEARANCE_ICON");
    expect(uploadForm.get("access")).toBe("PUBLIC");

    const preview = screen.getByTestId("appearance-favicon-preview-32");
    expect(preview.querySelector("img")).toHaveAttribute(
      "src",
      "/storage/appearance/favicon.svg",
    );

    fireEvent.click(screen.getByRole("button", { name: "Xong" }));
    fireEvent.click(await screen.findByText("Lưu & áp dụng"));

    await waitFor(() => {
      expect(apiClientMock).toHaveBeenCalledWith(
        "/admin/system-config/appearance",
        expect.objectContaining({ method: "PUT" }),
      );
    });

    const saveCall = apiClientMock.mock.calls.find(
      ([url]) => url === "/admin/system-config/appearance",
    );
    expect(saveCall?.[1]?.data?.value?.brand?.faviconUrl).toBe(
      "/storage/appearance/favicon.svg",
    );

    await waitFor(() => {
      expect(
        document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')?.getAttribute("href"),
      ).toBe("/storage/appearance/favicon.svg");
    });
  });
});
