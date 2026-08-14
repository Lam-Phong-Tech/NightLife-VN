import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
    expect(image).toHaveAttribute("src", "/image-800.webp");
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("fetchpriority", "high");
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
});
