import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResponsiveMedia } from "@/components/ui/ResponsiveMedia";

describe("ResponsiveMedia", () => {
  it("renders AVIF and WebP candidates while keeping the legacy fallback", () => {
    const { container } = render(
      <ResponsiveMedia
        src="/legacy.png"
        alt="Hero"
        sizes="100vw"
        priority
        responsiveImage={{
          src: "/image-800.webp",
          width: 1920,
          height: 720,
          variants: [
            {
              width: 400,
              webpUrl: "/image-800.webp?width=400&format=webp",
              avifUrl: "/image-800.webp?width=400&format=avif",
            },
            {
              width: 800,
              webpUrl: "/image-800.webp?width=800&format=webp",
              avifUrl: "/image-800.webp?width=800&format=avif",
            },
          ],
        }}
      />,
    );

    const image = screen.getByRole("img", { name: "Hero" });
    const picture = container.querySelector("picture");
    expect(image).toHaveAttribute("src", "/image-800.webp");
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("fetchpriority", "high");
    expect(picture).toHaveStyle({
      display: "block",
      width: "100%",
      height: "100%",
    });
    expect(container.querySelector('source[type="image/avif"]')).toHaveAttribute(
      "srcset",
      expect.stringContaining("width=400&format=avif 400w"),
    );
  });

  it("does not invent variant requests for legacy media", () => {
    const { container } = render(
      <ResponsiveMedia src="/legacy.png" alt="Legacy" />,
    );
    expect(screen.getByRole("img", { name: "Legacy" })).toHaveAttribute(
      "src",
      "/legacy.png",
    );
    expect(container.querySelector("source")).toBeNull();
  });

  it("retries the legacy source before reporting a broken image", () => {
    const onError = vi.fn();
    const { container } = render(
      <ResponsiveMedia
        src="/legacy.png"
        alt="Fallback"
        onError={onError}
        responsiveImage={{
          src: "/optimized.webp",
          width: 800,
          height: 450,
          variants: [
            {
              width: 400,
              webpUrl: "/missing.webp",
              avifUrl: "/missing.avif",
            },
          ],
        }}
      />,
    );

    const image = screen.getByRole("img", { name: "Fallback" });
    fireEvent.error(image);

    expect(container.querySelector("source")).toBeNull();
    expect(image).toHaveAttribute("src", "/legacy.png");
    expect(image).not.toHaveAttribute("srcset");
    expect(onError).not.toHaveBeenCalled();

    fireEvent.error(image);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
