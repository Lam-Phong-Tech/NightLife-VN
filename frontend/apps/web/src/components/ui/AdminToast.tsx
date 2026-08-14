"use client";

import { useContext, useEffect, useRef } from "react";
import { SystemFeedbackContext } from "./SystemFeedback";

type AdminToastTone = "success" | "info" | "warning" | "error" | "gold";

type AdminToastProps = {
  message?: string | null;
  tone?: AdminToastTone;
  durationMs?: number;
};

/** Routes legacy local toast state through the shared admin toast viewport. */
export function AdminToast({
  message,
  tone = "success",
  durationMs = 3000,
}: AdminToastProps) {
  const feedback = useContext(SystemFeedbackContext);
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!feedback || !message) {
      lastMessageRef.current = null;
      return;
    }

    if (lastMessageRef.current === message) return;
    lastMessageRef.current = message;
    feedback.showToast({
      title: message,
      tone,
      durationMs,
      placement: "top-right",
    });
  }, [durationMs, feedback, message, tone]);

  return null;
}
