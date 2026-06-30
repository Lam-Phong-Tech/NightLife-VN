"use client";

import { ChevronDown, ChevronLeft, MessageCircle, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const chatColors = {
  bg: "#0c0c0f",
  panel: "#121116",
  panelTop: "#15131a",
  text: "#f3f0ea",
  text2: "#c5c0b6",
  muted: "#8c8679",
  quiet: "#6f6b62",
  onGold: "#241a0a",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
  userGrad: "linear-gradient(135deg,#f0dda8,#d4b26a 60%,#c39f57)",
};

type ChatMessage = {
  id: string;
  from: "support" | "user";
  text: string;
  time: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "support-welcome",
    from: "support",
    text: "Dạ chào anh, Vietyoru Hỗ trợ có thể giúp gì cho anh ạ?",
    time: "21:30",
  },
  {
    id: "user-booking",
    from: "user",
    text: "Mình muốn hỏi về đặt bàn tối nay ở Sakura Lounge",
    time: "21:31",
  },
  {
    id: "support-party-size",
    from: "support",
    text: "Dạ anh đi mấy người và khoảng mấy giờ để em kiểm tra bàn trống giúp anh ạ?",
    time: "21:31",
  },
  {
    id: "user-time",
    from: "user",
    text: "4 người, khoảng 21:00 nhé",
    time: "21:32",
  },
  {
    id: "support-available",
    from: "support",
    text: "Sakura Lounge vẫn còn bàn khung 21:00 cho 4 khách ạ. Em giữ chỗ trước cho anh nhé?",
    time: "21:33",
  },
  {
    id: "user-confirm",
    from: "user",
    text: "Vâng bạn giữ giúp mình",
    time: "21:33",
  },
  {
    id: "support-confirmed",
    from: "support",
    text: "Em đã giữ chỗ cho anh. Anh vào mục Đặt chỗ xác nhận trong 15 phút giúp em là xong ạ. Cảm ơn anh!",
    time: "21:34",
  },
];

type SupportChatWidgetProps = {
  isMobile: boolean;
  isOpen: boolean;
  onOpen?: () => void;
  onOpenChange: (open: boolean) => void;
};

function formatChatTime(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function IconCircleButton({
  label,
  children,
  onClick,
  size = 30,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  size?: number;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        border: 0,
        background: "rgba(255,255,255,.06)",
        color: chatColors.text2,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

function SupportAvatar({ size = 38 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: chatColors.goldGrad,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: chatColors.onGold,
        fontWeight: 800,
        fontSize: `${Math.round(size * 0.45)}px`,
        flex: "none",
      }}
    >
      V
    </span>
  );
}

function ChatBubble({ message, isMobile }: { message: ChatMessage; isMobile: boolean }) {
  const isUser = message.from === "user";
  const bubbleStyle: CSSProperties = {
    borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
    padding: isMobile ? "10px 13px" : "9px 13px",
    fontSize: isMobile ? "13.5px" : "13px",
    lineHeight: 1.5,
    overflowWrap: "anywhere",
    letterSpacing: 0,
  };

  if (isUser) {
    return (
      <div style={{ alignSelf: "flex-end", maxWidth: isMobile ? "82%" : "84%" }}>
        <div
          style={{
            ...bubbleStyle,
            background: chatColors.userGrad,
            color: chatColors.onGold,
            fontWeight: 500,
          }}
        >
          {message.text}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: chatColors.quiet,
            marginTop: "4px",
            textAlign: "right",
            marginRight: "4px",
          }}
        >
          {message.time}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "flex-end",
        alignSelf: "flex-start",
        maxWidth: isMobile ? "82%" : "84%",
      }}
    >
      <SupportAvatar size={isMobile ? 28 : 26} />
      <div>
        <div
          style={{
            ...bubbleStyle,
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.07)",
            color: "#e7e1d4",
          }}
        >
          {message.text}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: chatColors.quiet,
            marginTop: "4px",
            marginLeft: "4px",
          }}
        >
          {message.time}
        </div>
      </div>
    </div>
  );
}

function ChatThread({ messages, isMobile }: { messages: ChatMessage[]; isMobile: boolean }) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div
      ref={listRef}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: isMobile ? "14px 14px 8px" : "14px 14px 6px",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? "12px" : "11px",
        scrollbarWidth: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2px" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "1.2px",
            color: chatColors.muted,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: "10px",
            padding: "4px 11px",
            textTransform: "uppercase",
          }}
        >
          Hôm nay
        </span>
      </div>
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} isMobile={isMobile} />
      ))}
    </div>
  );
}

function ChatComposer({
  draft,
  isMobile,
  onDraftChange,
  onSubmit,
}: {
  draft: string;
  isMobile: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const canSend = draft.trim().length > 0;

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: isMobile ? "11px 14px calc(14px + env(safe-area-inset-bottom))" : "11px 13px",
        borderTop: "1px solid rgba(255,255,255,.07)",
        flex: "none",
      }}
    >
      <input
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="Nhập tin nhắn..."
        aria-label="Nhập tin nhắn hỗ trợ"
        style={{
          flex: 1,
          minWidth: 0,
          background: "rgba(255,255,255,.05)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: isMobile ? "22px" : "20px",
          padding: isMobile ? "11px 16px" : "10px 15px",
          fontSize: isMobile ? "13.5px" : "13px",
          color: chatColors.text,
          outline: 0,
          lineHeight: 1.2,
          letterSpacing: 0,
        }}
      />
      <button
        type="submit"
        aria-label="Gửi tin nhắn"
        disabled={!canSend}
        style={{
          width: isMobile ? "42px" : "38px",
          height: isMobile ? "42px" : "38px",
          borderRadius: "50%",
          border: 0,
          background: chatColors.goldGrad,
          color: chatColors.onGold,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
          cursor: canSend ? "pointer" : "default",
          opacity: canSend ? 1 : 0.58,
          padding: 0,
        }}
      >
        <Send size={isMobile ? 18 : 16} strokeWidth={2} />
      </button>
    </form>
  );
}

function DesktopSupportChatPanel({
  draft,
  messages,
  onClose,
  onDraftChange,
  onSubmit,
}: {
  draft: string;
  messages: ChatMessage[];
  onClose: () => void;
  onDraftChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section
      data-support-chat-panel="true"
      role="dialog"
      aria-labelledby="support-chat-title"
      onMouseDown={(event) => event.stopPropagation()}
      style={{
        position: "fixed",
        right: "26px",
        bottom: "26px",
        zIndex: 111,
        width: "min(374px, calc(100vw - 32px))",
        height: "min(498px, calc(100vh - 112px))",
        minHeight: "420px",
        background: chatColors.panel,
        border: "1px solid rgba(212,178,106,.22)",
        borderRadius: "18px",
        boxShadow: "0 30px 70px -22px rgba(0,0,0,.85)",
        color: chatColors.text,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "var(--nl-font-sans)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          padding: "13px 15px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          background: "linear-gradient(180deg,rgba(212,178,106,.08),rgba(255,255,255,0))",
          flex: "none",
        }}
      >
        <SupportAvatar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            id="support-chat-title"
            style={{
              margin: 0,
              fontSize: "14.5px",
              fontWeight: 700,
              color: chatColors.text,
              lineHeight: 1.25,
            }}
          >
            Vietyoru Hỗ trợ
          </h2>
          <div style={{ fontSize: "11px", color: chatColors.muted, marginTop: "1px" }}>
            Chăm sóc khách hàng
          </div>
        </div>
        <IconCircleButton label="Thu nhỏ chat hỗ trợ" onClick={onClose}>
          <ChevronDown size={15} strokeWidth={2.2} />
        </IconCircleButton>
        <IconCircleButton label="Đóng chat hỗ trợ" onClick={onClose}>
          <X size={13} strokeWidth={2.4} />
        </IconCircleButton>
      </div>

      <ChatThread messages={messages} isMobile={false} />
      <ChatComposer
        draft={draft}
        isMobile={false}
        onDraftChange={onDraftChange}
        onSubmit={onSubmit}
      />
    </section>
  );
}

function MobileSupportChatPanel({
  draft,
  messages,
  onClose,
  onDraftChange,
  onSubmit,
}: {
  draft: string;
  messages: ChatMessage[];
  onClose: () => void;
  onDraftChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section
      data-support-chat-panel="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-support-chat-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 130,
        background: chatColors.bg,
        color: chatColors.text,
        fontFamily: "var(--nl-font-sans)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          padding: "calc(10px + env(safe-area-inset-top)) 14px 11px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          flex: "none",
        }}
      >
        <button
          type="button"
          aria-label="Đóng chat hỗ trợ"
          onClick={onClose}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            border: 0,
            background: "transparent",
            color: chatColors.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
        <SupportAvatar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            id="mobile-support-chat-title"
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 700,
              color: chatColors.text,
              lineHeight: 1.2,
            }}
          >
            Vietyoru Hỗ trợ
          </h2>
          <div style={{ fontSize: "11px", color: chatColors.muted, marginTop: "1px" }}>
            Chăm sóc khách hàng
          </div>
        </div>
        <IconCircleButton label="Thu nhỏ chat hỗ trợ" onClick={onClose} size={34}>
          <ChevronDown size={16} strokeWidth={2.2} />
        </IconCircleButton>
      </div>

      <ChatThread messages={messages} isMobile />
      <ChatComposer draft={draft} isMobile onDraftChange={onDraftChange} onSubmit={onSubmit} />
    </section>
  );
}

function SupportChatButton({
  isMobile,
  isOpen,
  onClick,
}: {
  isMobile: boolean;
  isOpen: boolean;
  onClick: () => void;
}) {
  const size = isMobile ? 36 : 40;

  return (
    <button
      type="button"
      data-support-chat-trigger="true"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={isOpen ? "Đóng chat hỗ trợ" : "Mở chat hỗ trợ"}
      onClick={onClick}
      style={{
        minHeight: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        border: `1px solid ${isOpen ? "rgba(212,178,106,.6)" : "rgba(212,178,106,.32)"}`,
        color: isOpen ? chatColors.goldPale : chatColors.gold,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: isMobile ? "transparent" : "rgba(255,255,255,.04)",
        boxShadow: isOpen ? "0 0 0 3px rgba(212,178,106,.14)" : "none",
        cursor: "pointer",
        fontFamily: "var(--nl-font-sans)",
        padding: 0,
        position: "relative",
        flex: "none",
      }}
    >
      <MessageCircle size={isMobile ? 16 : 18} strokeWidth={1.8} />
    </button>
  );
}

export function SupportChatWidget({
  isMobile,
  isOpen,
  onOpen,
  onOpenChange,
}: SupportChatWidgetProps) {
  const pathname = usePathname() || "/";
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const onPointerDown = (event: PointerEvent) => {
      if (isMobile) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-support-chat-panel='true'], [data-support-chat-trigger='true']")) {
        return;
      }
      onOpenChange(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (isMobile) {
      document.body.style.overflow = "hidden";
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobile, isOpen, onOpenChange]);

  const handleTriggerClick = () => {
    const nextOpen = !isOpen;
    if (nextOpen) onOpen?.();
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        from: "user",
        text,
        time: formatChatTime(new Date()),
      },
    ]);
    setDraft("");
  };

  const panel = isMobile ? (
    <MobileSupportChatPanel
      draft={draft}
      messages={messages}
      onClose={() => onOpenChange(false)}
      onDraftChange={setDraft}
      onSubmit={handleSubmit}
    />
  ) : (
    <DesktopSupportChatPanel
      draft={draft}
      messages={messages}
      onClose={() => onOpenChange(false)}
      onDraftChange={setDraft}
      onSubmit={handleSubmit}
    />
  );

  return (
    <>
      <SupportChatButton isMobile={isMobile} isOpen={isOpen} onClick={handleTriggerClick} />
      {isOpen && typeof document !== "undefined" ? createPortal(panel, document.body) : null}
    </>
  );
}
