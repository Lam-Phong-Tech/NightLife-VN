import type { ReactNode } from "react";
import { useCallback } from "react";
import { useSystemFeedback } from "@/components/ui/SystemFeedback";
import { ApiError } from "@/lib/api/client";
import { useActiveLanguage, type LanguageCode } from "@/lib/i18n/use-active-language";

type UserActionTone = "success" | "info" | "warning" | "error" | "gold";

type ConfirmUserActionOptions = {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: UserActionTone;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

type UserToastOptions = {
  title: string;
  description?: string;
};

const confirmActionDefaults: Record<LanguageCode, { confirm: string; cancel: string }> = {
  vi: { confirm: "Xác nhận", cancel: "Hủy" },
  en: { confirm: "Confirm", cancel: "Cancel" },
  ja: { confirm: "確認", cancel: "キャンセル" },
  ko: { confirm: "확인", cancel: "취소" },
  zh: { confirm: "确认", cancel: "取消" },
};

const nearStartThresholdMinutes = 60;

export const isNearStartTime = (
  scheduledAt: string,
  thresholdMinutes = nearStartThresholdMinutes,
) => {
  const scheduledMs = Date.parse(scheduledAt);
  if (!Number.isFinite(scheduledMs)) return false;

  const diffMs = scheduledMs - Date.now();
  return diffMs >= 0 && diffMs <= thresholdMinutes * 60_000;
};

export const userActionErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const useUserActionFeedback = () => {
  const feedback = useSystemFeedback();
  const activeLanguage = useActiveLanguage();

  const confirmAction = useCallback(
    (options: ConfirmUserActionOptions) => {
      const {
        title,
        description,
        confirmLabel = confirmActionDefaults[activeLanguage].confirm,
        cancelLabel = confirmActionDefaults[activeLanguage].cancel,
        tone = "gold",
        destructive = false,
        onConfirm,
      } = options;

      feedback.showModal({
        tone,
        title,
        description,
        primaryLabel: confirmLabel,
        secondaryLabel: cancelLabel,
        destructive,
        onPrimary: () => {
          void onConfirm();
        },
      });
    },
    [activeLanguage, feedback],
  );

  const showToast = useCallback(
    (tone: UserActionTone, { title, description }: UserToastOptions) => {
      feedback.showToast({
        tone,
        title,
        description,
        placement: "top-right",
        durationMs: tone === "error" ? 5200 : 4000,
      });
    },
    [feedback],
  );

  return {
    confirmAction,
    success: (toast: UserToastOptions) => showToast("success", toast),
    error: (toast: UserToastOptions) => showToast("error", toast),
    warning: (toast: UserToastOptions) => showToast("warning", toast),
    info: (toast: UserToastOptions) => showToast("info", toast),
  };
};
