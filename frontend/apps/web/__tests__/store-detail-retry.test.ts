import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../src/lib/api/client";
import {
  isRetryableStoreDetailError,
  retryStoreDetailRequest,
} from "../src/lib/api/store-detail";

describe("store detail retry", () => {
  it("retries a temporary upstream error and returns the eventual response", async () => {
    const request = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new ApiError(503, "Service unavailable"))
      .mockResolvedValueOnce("loaded");
    const wait = vi.fn<(_: number) => Promise<void>>().mockResolvedValue();

    await expect(retryStoreDetailRequest(request, [0, 0], wait)).resolves.toBe("loaded");
    expect(request).toHaveBeenCalledTimes(2);
    expect(wait).toHaveBeenCalledWith(0);
  });

  it("does not retry a missing store", async () => {
    const request = vi
      .fn<() => Promise<string>>()
      .mockRejectedValue(new ApiError(404, "Store not found"));
    const wait = vi.fn<(_: number) => Promise<void>>().mockResolvedValue();

    await expect(retryStoreDetailRequest(request, [0, 0], wait)).rejects.toMatchObject({ status: 404 });
    expect(request).toHaveBeenCalledTimes(1);
    expect(wait).not.toHaveBeenCalled();
  });

  it("recognizes only transient request failures as retryable", () => {
    expect(isRetryableStoreDetailError(new ApiError(500, "Server error"))).toBe(true);
    expect(isRetryableStoreDetailError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isRetryableStoreDetailError(new ApiError(400, "Invalid request"))).toBe(false);
  });
});
