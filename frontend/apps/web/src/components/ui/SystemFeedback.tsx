"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  Check,
  Info,
  Loader2,
  Send,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";

type FeedbackTone = "success" | "info" | "warning" | "error" | "gold";
type ToastPlacement = "top-right" | "top" | "bottom";

type ToastInput = {
  tone?: FeedbackTone;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
  progress?: number;
  durationMs?: number;
  placement?: ToastPlacement;
};

type ToastState = ToastInput & {
  id: string;
  tone: FeedbackTone;
  placement: ToastPlacement;
};

type ModalInput = {
  tone?: FeedbackTone;
  title: string;
  description: ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  destructive?: boolean;
};

type SheetInput = {
  title: string;
  description: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  destructive?: boolean;
};

type SystemFeedbackApi = {
  showToast: (toast: ToastInput) => string;
  updateToast: (id: string, patch: Partial<ToastInput>) => void;
  dismissToast: (id: string) => void;
  showModal: (modal: ModalInput) => void;
  closeModal: () => void;
  showBottomSheet: (sheet: SheetInput) => void;
  closeBottomSheet: () => void;
};

const colors = {
  bg: "var(--vy-bg)",
  overlay: "rgba(8,8,11,.74)",
  panel: "var(--vy-surface)",
  panelSoft: "var(--vy-surface-2)",
  border: "var(--vy-border)",
  text: "var(--vy-text)",
  text2: "var(--vy-text-2)",
  muted: "var(--vy-muted)",
  dim: "var(--vy-faint)",
  gold: "var(--vy-gold)",
  goldPale: "var(--vy-gold-pale)",
  onGold: "#241a0a",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const toneConfig: Record<
  FeedbackTone,
  {
    icon: LucideIcon;
    color: string;
    soft: string;
    border: string;
    title: string;
    left: string;
  }
> = {
  success: {
    icon: Check,
    color: "var(--vy-success)",
    soft: "rgba(95,191,134,.14)",
    border: "rgba(95,191,134,.35)",
    title: "var(--vy-success)",
    left: "var(--vy-success)",
  },
  info: {
    icon: Info,
    color: "var(--vy-info)",
    soft: "rgba(111,159,216,.14)",
    border: "rgba(111,159,216,.35)",
    title: "var(--vy-info)",
    left: "var(--vy-info)",
  },
  warning: {
    icon: AlertTriangle,
    color: "var(--vy-warn)",
    soft: "rgba(224,164,78,.14)",
    border: "rgba(224,164,78,.35)",
    title: "var(--vy-warn)",
    left: "var(--vy-warn)",
  },
  error: {
    icon: X,
    color: "var(--vy-error)",
    soft: "rgba(224,105,122,.13)",
    border: "rgba(224,105,122,.35)",
    title: "var(--vy-error)",
    left: "var(--vy-error)",
  },
  gold: {
    icon: Send,
    color: "var(--vy-gold-hi)",
    soft: "rgba(212,178,106,.16)",
    border: "rgba(212,178,106,.36)",
    title: "var(--vy-gold-pale)",
    left: "var(--vy-gold)",
  },
};

export const SystemFeedbackContext = createContext<SystemFeedbackApi | null>(null);

export function useSystemFeedback() {
  const value = useContext(SystemFeedbackContext);
  if (!value) {
    throw new Error("useSystemFeedback must be used inside SystemFeedbackProvider");
  }
  return value;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function SystemFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [modal, setModal] = useState<ModalInput | null>(null);
  const [sheet, setSheet] = useState<SheetInput | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showModal = useCallback((nextModal: ModalInput) => {
    setModal(nextModal);
  }, []);

  const showBottomSheet = useCallback((nextSheet: SheetInput) => {
    setSheet(nextSheet);
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = createId("toast");
      const tone = toast.tone ?? "info";
      const placement = toast.placement ?? "top-right";
      const nextToast: ToastState = { ...toast, id, tone, placement };
      setToasts((current) => [nextToast, ...current].slice(0, 5));

      const duration = toast.durationMs ?? (toast.loading ? Infinity : 4000);
      if (Number.isFinite(duration)) {
        window.setTimeout(() => dismissToast(id), duration);
      }

      return id;
    },
    [dismissToast],
  );

  const updateToast = useCallback(
    (id: string, patch: Partial<ToastInput>) => {
      setToasts((current) =>
        current.map((toast) =>
          toast.id === id
            ? {
                ...toast,
                ...patch,
                tone: patch.tone ?? toast.tone,
                placement: patch.placement ?? toast.placement,
              }
            : toast,
        ),
      );

      const duration = patch.durationMs ?? (patch.loading === false ? 4000 : undefined);
      if (Number.isFinite(duration)) {
        window.setTimeout(() => dismissToast(id), duration);
      }
    },
    [dismissToast],
  );

  const closeModal = useCallback(() => setModal(null), []);
  const closeBottomSheet = useCallback(() => setSheet(null), []);

  useEffect(() => {
    if (!modal && !sheet) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modal, sheet]);

  useEffect(() => {
    if (!modal && !sheet) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModal(null);
        setSheet(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal, sheet]);

  const api = useMemo<SystemFeedbackApi>(
    () => ({
      showToast,
      updateToast,
      dismissToast,
      showModal,
      closeModal,
      showBottomSheet,
      closeBottomSheet,
    }),
    [closeBottomSheet, closeModal, dismissToast, showBottomSheet, showModal, showToast, updateToast],
  );

  return (
    <SystemFeedbackContext.Provider value={api}>
      {children}
      <ToastViewport
        toasts={toasts.filter((toast) => toast.placement === "top-right")}
        placement="top-right"
        onDismiss={dismissToast}
      />
      <ToastViewport
        toasts={toasts.filter((toast) => toast.placement === "top")}
        placement="top"
        onDismiss={dismissToast}
      />
      <ToastViewport
        toasts={toasts.filter((toast) => toast.placement === "bottom")}
        placement="bottom"
        onDismiss={dismissToast}
      />
      {modal ? <FeedbackModal modal={modal} onClose={closeModal} /> : null}
      {sheet ? <FeedbackBottomSheet sheet={sheet} onClose={closeBottomSheet} /> : null}
      <style>{feedbackStyles}</style>
    </SystemFeedbackContext.Provider>
  );
}

function ToastViewport({
  toasts,
  placement,
  onDismiss,
}: {
  toasts: ToastState[];
  placement: ToastPlacement;
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className={`nl-toast-viewport nl-toast-${placement}`} aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <FeedbackToast key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function FeedbackToast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  const config = toneConfig[toast.tone];
  const Icon = toast.loading ? Loader2 : config.icon;

  return (
    <section
      className="nl-system-toast"
      style={{
        borderLeftColor: toast.loading ? colors.gold : config.left,
      }}
    >
      <span
        className="nl-system-toast-icon"
        style={{
          color: config.color,
          background: config.soft,
          borderColor: config.border,
        }}
      >
        <Icon size={toast.loading ? 20 : 16} strokeWidth={toast.loading ? 2.4 : 2.2} className={toast.loading ? "nl-spin" : undefined} />
      </span>
      <div className="nl-system-toast-copy">
        <div style={{ color: toast.loading ? colors.text : config.title }}>{toast.title}</div>
        {toast.description ? <p>{toast.description}</p> : null}
        {toast.loading ? (
          <div className="nl-system-toast-progress">
            <i style={{ width: `${Math.max(8, Math.min(100, toast.progress ?? 62))}%` }} />
          </div>
        ) : null}
      </div>
      {toast.actionLabel ? (
        <button
          type="button"
          className="nl-system-toast-action"
          onClick={() => {
            toast.onAction?.();
            onDismiss();
          }}
        >
          {toast.actionLabel}
        </button>
      ) : null}
      {!toast.loading ? (
        <button type="button" className="nl-system-toast-close" aria-label="Đóng thông báo" onClick={onDismiss}>
          <X size={16} />
        </button>
      ) : null}
    </section>
  );
}

function FeedbackModal({ modal, onClose }: { modal: ModalInput; onClose: () => void }) {
  const tone = modal.tone ?? (modal.destructive ? "error" : "success");
  const config = toneConfig[tone];
  const Icon = modal.destructive ? Trash2 : config.icon;

  return (
    <div className="nl-system-modal-overlay" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section
        className="nl-system-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nl-system-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span
          className="nl-system-modal-icon"
          style={{
            color: modal.destructive ? toneConfig.error.color : config.color,
            background: modal.destructive ? toneConfig.error.soft : config.soft,
            borderColor: modal.destructive ? toneConfig.error.border : config.border,
          }}
        >
          <Icon size={modal.destructive ? 27 : 28} strokeWidth={modal.destructive ? 1.9 : 2.2} />
        </span>
        <h2 id="nl-system-modal-title">{modal.title}</h2>
        <div className="nl-system-modal-desc">{modal.description}</div>
        <div className="nl-system-modal-actions">
          {modal.secondaryLabel ? (
            <button
              type="button"
              className="nl-system-secondary-button"
              onClick={() => {
                modal.onSecondary?.();
                onClose();
              }}
            >
              {modal.secondaryLabel}
            </button>
          ) : null}
          <button
            type="button"
            className={modal.destructive ? "nl-system-danger-button" : "nl-system-primary-button"}
            onClick={() => {
              modal.onPrimary?.();
              onClose();
            }}
          >
            {modal.primaryLabel ?? "Đã hiểu"}
          </button>
        </div>
      </section>
    </div>
  );
}

function FeedbackBottomSheet({ sheet, onClose }: { sheet: SheetInput; onClose: () => void }) {
  return (
    <div className="nl-system-sheet-overlay" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section
        className="nl-system-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nl-system-sheet-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="nl-system-sheet-handle" />
        <h2 id="nl-system-sheet-title">{sheet.title}</h2>
        <p>{sheet.description}</p>
        <div className="nl-system-sheet-actions">
          <button
            type="button"
            className="nl-system-secondary-button"
            onClick={() => {
              sheet.onSecondary?.();
              onClose();
            }}
          >
            {sheet.secondaryLabel ?? "Để sau"}
          </button>
          <button
            type="button"
            className={sheet.destructive ? "nl-system-danger-button" : "nl-system-primary-button"}
            onClick={() => {
              sheet.onPrimary?.();
              onClose();
            }}
          >
            {sheet.primaryLabel ?? "Xác nhận"}
          </button>
        </div>
      </section>
    </div>
  );
}

const feedbackStyles = `
  .nl-toast-viewport {
    position: fixed;
    z-index: 220;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: min(384px, calc(100vw - 32px));
    pointer-events: none;
  }

  .nl-toast-top-right {
    top: calc(18px + env(safe-area-inset-top));
    right: 18px;
  }

  .nl-toast-top {
    top: calc(16px + env(safe-area-inset-top));
    left: 50%;
    transform: translateX(-50%);
  }

  .nl-toast-bottom {
    right: 18px;
    bottom: calc(22px + env(safe-area-inset-bottom));
  }

  .nl-system-toast {
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-height: 58px;
    border: 1px solid rgba(255,255,255,.09);
    border-left: 3px solid #d4b26a;
    border-radius: 13px;
    background: #16141b;
    color: #f3f0ea;
    padding: 13px 14px;
    box-shadow: 0 16px 32px -18px rgba(0,0,0,.75);
    font-family: var(--nl-font-sans);
  }

  .nl-system-toast-icon {
    flex: none;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    border: 1px solid rgba(255,255,255,.12);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nl-system-toast-copy {
    flex: 1;
    min-width: 0;
    font-size: 13.5px;
    font-weight: 800;
    line-height: 1.35;
  }

  .nl-system-toast-copy p {
    margin: 3px 0 0;
    color: #9b958a;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
  }

  .nl-system-toast-progress {
    height: 3px;
    border-radius: 3px;
    background: rgba(255,255,255,.06);
    margin-top: 11px;
    overflow: hidden;
  }

  .nl-system-toast-progress i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg,#d4b26a,#f4e3b4);
  }

  .nl-system-toast-action {
    flex: none;
    align-self: center;
    min-height: 32px;
    border-radius: 9px;
    border: 1px solid rgba(212,178,106,.35);
    background: transparent;
    color: #e3c27e;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 800;
    font-family: var(--nl-font-sans);
    cursor: pointer;
  }

  .nl-system-toast-close {
    flex: none;
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #6f6b62;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
  }

  .nl-system-modal-overlay,
  .nl-system-sheet-overlay {
    position: fixed;
    inset: 0;
    z-index: 210;
    background: rgba(8,8,11,.74);
    backdrop-filter: blur(3px);
    color: #f3f0ea;
    font-family: var(--nl-font-sans);
  }

  .nl-system-modal-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22px;
  }

  .nl-system-modal {
    width: min(336px, 100%);
    background: #16141b;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 18px;
    box-shadow: 0 24px 60px -20px rgba(0,0,0,.85);
    padding: 26px 22px;
    text-align: center;
  }

  .nl-system-modal-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 0 auto 16px;
    border: 1px solid rgba(255,255,255,.12);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nl-system-modal h2,
  .nl-system-sheet h2 {
    margin: 0;
    color: #f3f0ea;
    font-size: 18px;
    font-weight: 800;
    line-height: 1.25;
  }

  .nl-system-modal p,
  .nl-system-modal-desc,
  .nl-system-sheet p {
    margin: 8px 0 0;
    color: #c5c0b6;
    font-size: 13px;
    line-height: 1.6;
  }

  .nl-system-modal-actions,
  .nl-system-sheet-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .nl-system-primary-button,
  .nl-system-secondary-button,
  .nl-system-danger-button {
    flex: 1;
    min-height: 44px;
    border-radius: 11px;
    padding: 12px 14px;
    font-size: 14px;
    font-weight: 900;
    font-family: var(--nl-font-sans);
    cursor: pointer;
  }

  .nl-system-primary-button {
    border: 0;
    background: linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a);
    color: #241a0a;
  }

  .nl-system-secondary-button {
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.05);
    color: #c5c0b6;
  }

  .nl-system-danger-button {
    border: 1px solid rgba(224,105,122,.45);
    background: rgba(224,105,122,.16);
    color: #ec98a3;
  }

  .nl-system-sheet-overlay {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0 12px;
  }

  .nl-system-sheet {
    width: min(420px, 100%);
    border-radius: 24px 24px 0 0;
    background: #16141b;
    border: 1px solid rgba(255,255,255,.08);
    border-bottom: 0;
    box-shadow: 0 -24px 60px -22px rgba(0,0,0,.9);
    padding: 10px 20px calc(20px + env(safe-area-inset-bottom));
    text-align: center;
  }

  .nl-system-sheet-handle {
    width: 44px;
    height: 4px;
    border-radius: 4px;
    background: rgba(255,255,255,.18);
    margin: 0 auto 18px;
  }

  .nl-spin {
    animation: nl-system-spin .9s linear infinite;
  }

  @keyframes nl-system-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 767px) {
    .nl-toast-top-right,
    .nl-toast-top {
      top: calc(12px + env(safe-area-inset-top));
      left: 12px;
      right: 12px;
      transform: none;
      width: auto;
    }

    .nl-toast-bottom {
      left: 12px;
      right: 12px;
      bottom: calc(92px + env(safe-area-inset-bottom));
      width: auto;
    }

    .nl-system-modal {
      width: min(318px, 100%);
      padding: 24px 20px;
    }

    .nl-system-modal-actions,
    .nl-system-sheet-actions {
      flex-direction: column-reverse;
    }
  }
`;
