export const DEFAULT_FAVICON_URL = "/favicon.svg";
export const SITE_FAVICON_URL = "/site-favicon";

export function applyAppearanceFavicon(
  cacheKey: string | number = Date.now(),
) {
  if (typeof document === "undefined") return;

  const href = `${SITE_FAVICON_URL}?v=${encodeURIComponent(String(cacheKey))}`;
  const existing = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"]',
    ),
  );
  const links = existing.length > 0
    ? existing
    : [document.createElement("link")];

  links.forEach((link) => {
    if (!link.parentNode) {
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
    link.dataset.appearanceFavicon = "true";
    link.removeAttribute("type");
  });
}
