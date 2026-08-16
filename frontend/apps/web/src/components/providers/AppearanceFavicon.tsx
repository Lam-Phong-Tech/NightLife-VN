"use client";

import { useEffect } from "react";
import { applyAppearanceFavicon } from "@/lib/appearance-favicon";
import { getAppearanceConfig } from "@/lib/api/appearance";

export function AppearanceFavicon() {
  useEffect(() => {
    let cancelled = false;

    void getAppearanceConfig()
      .then((config) => {
        if (!cancelled) {
          applyAppearanceFavicon(config.brand.faviconUrl || "default");
        }
      })
      .catch(() => {
        if (!cancelled) {
          applyAppearanceFavicon("default");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
