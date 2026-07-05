"use client";

import React, { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Monitor } from "lucide-react";

export function MobileSimulator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString();
  const currentUrl = `${pathname}${search ? `?${search}` : ""}`;

  const [iframeSrc, setIframeSrc] = useState(currentUrl);
  const [prevUrl, setPrevUrl] = useState(currentUrl);

  if (currentUrl !== prevUrl) {
    setPrevUrl(currentUrl);
    setIframeSrc(currentUrl);
  }

  return (
    <div className="nl-mobile-simulator-root min-h-screen bg-[#f6f5f2] font-sans">
      <div className="fixed left-4 top-4 z-20">
        <button
          onClick={() => {
            document.cookie = "device_preference=; path=/; max-age=0";
            window.location.href = "/chon-giao-dien";
          }}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <Monitor size={16} />
          <span>Thoát giả lập</span>
        </button>
      </div>

      <main
        className="mx-auto w-full max-w-[390px] overflow-hidden bg-[var(--vy-bg)]"
        style={{ height: "100dvh", minHeight: "100vh" }}
      >
        {iframeSrc ? (
          <iframe
            src={iframeSrc}
            className="block h-full w-full border-none bg-[var(--vy-bg)]"
            title="Mobile Simulator"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--vy-bg)] text-[var(--vy-muted)]">
            Đang tải giả lập...
          </div>
        )}
      </main>
    </div>
  );
}
