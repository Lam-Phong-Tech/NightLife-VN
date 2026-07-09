import { AdminSupportDashboard } from "@/components/support-chat/AdminSupportDashboard";
import React from "react";

export default function SupportChatPage() {
  return (
    <div style={{ padding: '24px', background: 'var(--vy-admin-bg, #f3f4f6)' }} className="min-h-screen dark:bg-[#0c0c0f]">
      <AdminSupportDashboard />
    </div>
  );
}
