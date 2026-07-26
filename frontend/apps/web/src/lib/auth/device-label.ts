export const unknownDeviceLabel = "Thiết bị không xác định";

export const formatDeviceLabel = (userAgent?: string | null): string => {
  if (!userAgent || !userAgent.trim()) {
    return unknownDeviceLabel;
  }

  const ua = userAgent;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Firefox\/|FxiOS\//.test(ua)
        ? "Firefox"
        : /Chrome\/|CriOS\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "";

  const os = /Windows NT/.test(ua)
    ? "Windows"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Android/.test(ua)
        ? "Android"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";

  if (browser && os) return `${browser} trên ${os}`;
  if (browser) return browser;
  if (os) return os;
  return unknownDeviceLabel;
};
