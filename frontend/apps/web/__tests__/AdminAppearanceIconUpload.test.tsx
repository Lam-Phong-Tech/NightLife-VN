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
});
