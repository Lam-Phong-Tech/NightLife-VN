import { resolveClientUrl } from "@/lib/api/client";

export const DEFAULT_FAVICON_URL = "/favicon.svg";

const faviconMimeType = (url: string) => {
  const pathname = url.split(/[?#]/, 1)[0]?.toLowerCase() || "";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".ico")) return "image/x-icon";
  return undefined;
};

export function applyAppearanceFavicon(url?: string) {
  if (typeof document === "undefined") return;

  const href = resolveClientUrl(url?.trim()) || DEFAULT_FAVICON_URL;
  const mimeType = faviconMimeType(href);
  const selectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]'];

  selectors.forEach((selector, index) => {
    const existing = Array.from(
      document.head.querySelectorAll<HTMLLinkElement>(selector),
    );
    const links = existing.length > 0
      ? existing
      : [document.createElement("link")];

    links.forEach((link) => {
      if (!link.parentNode) {
        link.rel = index === 0 ? "icon" : "shortcut icon";
        document.head.appendChild(link);
      }
      link.href = href;
      link.dataset.appearanceFavicon = "true";
      if (mimeType) link.type = mimeType;
      else link.removeAttribute("type");
    });
  });
}
