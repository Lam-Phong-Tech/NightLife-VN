"use client";

import { useEffect } from "react";
import {
  getAppearanceConfig,
  getCachedAppearanceConfig,
} from "@/lib/api/appearance";
import { applyAppearanceFavicon } from "@/lib/appearance-favicon";

export function AppearanceFavicon() {
  useEffect(() => {
    let active = true;
    const cachedConfig = getCachedAppearanceConfig();

    if (cachedConfig) {
      applyAppearanceFavicon(cachedConfig.brand.faviconUrl);
    }

    getAppearanceConfig()
      .then((config) => {
        if (active) applyAppearanceFavicon(config.brand.faviconUrl);
      })
      .catch((error) => {
        console.error("Failed to load appearance favicon", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
