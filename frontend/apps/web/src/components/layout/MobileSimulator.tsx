"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Monitor } from "lucide-react";

export function MobileSimulator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSrc = typeof window !== "undefined"
    ? window.location.pathname + window.location.search
    : "";
  const [iframeSrc, setIframeSrc] = useState(currentSrc);

  useEffect(() => {
    // Sync iframe src when route changes
    const newSrc = window.location.pathname + window.location.search;
    if (newSrc !== iframeSrc) {
      setIframeSrc(newSrc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d4b26a] opacity-[0.04] rounded-full blur-[100px] pointer-events-none" />

      {/* Top action bar to exit simulator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 lg:left-10 lg:translate-x-0 z-20">
        <div className="bg-[rgba(8,8,11,0.8)] backdrop-blur-md border border-[rgba(212,178,106,0.2)] rounded-full px-6 py-2.5 flex items-center gap-4 shadow-lg">
          <span className="text-[#8c8679] text-sm font-medium">Chế độ giả lập Mobile</span>
          <div className="w-[1px] h-4 bg-[rgba(212,178,106,0.2)]" />
          <button
            onClick={() => {
              document.cookie = 'device_preference=; path=/; max-age=0';
              window.location.href = '/chon-giao-dien';
            }}
            className="flex items-center gap-2 text-[#d4b26a] hover:text-[#f0dda8] transition-colors text-sm font-bold cursor-pointer"
          >
            <Monitor size={16} />
            <span>Thoát giả lập</span>
          </button>
        </div>
      </div>

      {/* The Phone Frame */}
      <div className="relative z-10 w-full max-w-[390px] h-[844px] max-h-[90vh] bg-black rounded-[3rem] border-[8px] border-[#1a1a1f] shadow-[0_0_0_1px_rgba(255,255,255,0.05),_0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col ring-4 ring-[#0c0c0f]">
        


        {/* Iframe Content */}
        {iframeSrc ? (
          <iframe
            src={iframeSrc}
            className="w-full h-full border-none bg-[#0c0c0f]"
            title="Mobile Simulator"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <div className="w-full h-full bg-[#0c0c0f] flex items-center justify-center text-[#8c8679]">
            Đang tải giả lập...
          </div>
        )}
        
        {/* Hardware details: Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-white/20 rounded-full z-20" />
      </div>
    </div>
  );
}
