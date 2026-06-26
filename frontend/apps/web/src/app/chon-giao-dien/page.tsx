"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DeviceSelectionPage() {
  const router = useRouter();
  const [isSelecting, setIsSelecting] = useState<string | null>(null);

  const handleSelect = (device: 'mobile' | 'desktop') => {
    setIsSelecting(device);
    
    // Set cookie for 1 year
    document.cookie = `device_preference=${device}; path=/; max-age=31536000`;
    
    // Simulate a tiny delay for the animation to play out
    setTimeout(() => {
      if (window.top) {
        window.top.location.href = '/';
      } else {
        window.location.href = '/';
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-[#f3f0ea] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d4b26a] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Logo / Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-[#f4e3b4] via-[#d4b26a] to-[#b6924a]">
            Vietyoru
          </h1>
          <p className="text-[#8c8679] text-sm md:text-base tracking-widest uppercase">
            Vui lòng chọn giao diện trải nghiệm
          </p>
        </div>

        {/* Cards container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Mobile Option */}
          <button
            onClick={() => handleSelect('mobile')}
            disabled={isSelecting !== null}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-[rgba(212,178,106,0.22)] bg-[rgba(8,8,11,0.8)] p-8 md:p-12 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(212,178,106,0.12)] hover:border-[rgba(212,178,106,0.5)]",
              isSelecting === 'mobile' ? "scale-95 opacity-50" : "",
              isSelecting === 'desktop' ? "opacity-30 grayscale" : ""
            )}
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(212,178,106,0.08)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-[rgba(212,178,106,0.1)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:bg-[rgba(212,178,106,0.2)]">
                <Smartphone size={36} className="text-[#d4b26a]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-[#f3f0ea]">Điện thoại</h3>
                <p className="text-[#8c8679] text-sm">Giao diện nhỏ gọn, tối ưu cho thao tác vuốt chạm.</p>
              </div>
            </div>
          </button>

          {/* Desktop Option */}
          <button
            onClick={() => handleSelect('desktop')}
            disabled={isSelecting !== null}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-[rgba(212,178,106,0.22)] bg-[rgba(8,8,11,0.8)] p-8 md:p-12 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(212,178,106,0.12)] hover:border-[rgba(212,178,106,0.5)]",
              isSelecting === 'desktop' ? "scale-95 opacity-50" : "",
              isSelecting === 'mobile' ? "opacity-30 grayscale" : ""
            )}
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(212,178,106,0.08)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-[rgba(212,178,106,0.1)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:bg-[rgba(212,178,106,0.2)]">
                <Monitor size={36} className="text-[#d4b26a]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-[#f3f0ea]">Máy tính</h3>
                <p className="text-[#8c8679] text-sm">Trải nghiệm toàn diện với không gian hiển thị lớn.</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
