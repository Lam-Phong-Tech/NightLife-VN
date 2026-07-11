"use client";

import { ChevronDown, ChevronLeft, MessageCircle, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { io, Socket } from "socket.io-client";
import { getAuthUser } from "@/lib/auth/session";
import { translateText } from "@/lib/i18n/client-translations";
import {
  intlLocaleByLanguage,
  useActiveLanguage,
  type LanguageCode,
} from "@/lib/i18n/use-active-language";

const chatColors = {
  bg: "var(--vy-bg)",
  panel: "var(--vy-surface)",
  panelTop: "var(--vy-surface-2)",
  text: "var(--vy-text)",
  text2: "var(--vy-text-2)",
  muted: "var(--vy-muted)",
  quiet: "var(--vy-faint)",
  onGold: "#241a0a",
  gold: "var(--vy-gold)",
  goldPale: "var(--vy-gold-pale)",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
  userGrad: "linear-gradient(135deg,#f0dda8,#d4b26a 60%,#c39f57)",
};

type ChatMessage = {
  id: string;
  from: "support" | "user";
  text: string;
  time: string;
};

// Removed dead code initialMessages

type SupportChatWidgetProps = {
  isMobile: boolean;
  isOpen: boolean;
  onOpen?: () => void;
  onOpenChange: (open: boolean) => void;
};

function formatChatTime(date: Date, language: LanguageCode = "vi") {
  return new Intl.DateTimeFormat(intlLocaleByLanguage[language], {
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
        background: "var(--vy-surface-3)",
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

function ChatBubble({
  message,
  isMobile,
  activeLanguage,
}: {
  message: ChatMessage;
  isMobile: boolean;
  activeLanguage: LanguageCode;
}) {
  const isUser = message.from === "user";
  const messageText = translateText(message.text, activeLanguage);
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
          {messageText}
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
            background: "var(--vy-surface-3)",
            border: "1px solid var(--vy-border)",
            color: "var(--vy-text)",
          }}
        >
          {messageText}
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

function ChatThread({ messages, isMobile, isLoadingHistory }: { messages: ChatMessage[]; isMobile: boolean; isLoadingHistory?: boolean }) {
  const activeLanguage = useActiveLanguage();
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
            background: "var(--vy-surface-2)",
            border: "1px solid var(--vy-border)",
            borderRadius: "10px",
            padding: "4px 11px",
            textTransform: "uppercase",
          }}
        >
          {translateText("Hôm nay", activeLanguage)}
        </span>
      </div>
      {isLoadingHistory && (
        <div style={{ textAlign: "center", fontSize: "12px", color: chatColors.gold, margin: "10px 0", fontWeight: 600 }}>
          {translateText("Đang tải lịch sử...", activeLanguage)}
        </div>
      )}
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message}
          isMobile={isMobile}
          activeLanguage={activeLanguage}
        />
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
  const activeLanguage = useActiveLanguage();
  const canSend = draft.trim().length > 0;

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: isMobile ? "11px 14px calc(14px + env(safe-area-inset-bottom))" : "11px 13px",
        borderTop: "1px solid var(--vy-border)",
        flex: "none",
      }}
    >
      <input
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder={translateText("Nhập tin nhắn...", activeLanguage)}
        aria-label={translateText("Nhập tin nhắn hỗ trợ", activeLanguage)}
        style={{
          flex: 1,
          minWidth: 0,
          background: "var(--vy-surface-2)",
          border: "1px solid var(--vy-border)",
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
        aria-label={translateText("Gửi tin nhắn", activeLanguage)}
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
  isLoadingHistory,
  connectionStatus,
  onClose,
  onDraftChange,
  onSubmit,
}: {
  draft: string;
  messages: ChatMessage[];
  isLoadingHistory?: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  onClose: () => void;
  onDraftChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const activeLanguage = useActiveLanguage();

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
        border: "1px solid var(--vy-border-gold-22)",
        borderRadius: "18px",
        boxShadow: "var(--vy-shadow)",
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
          borderBottom: "1px solid var(--vy-border)",
          background: "linear-gradient(180deg,var(--vy-gold-soft-bg),transparent)",
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
            {translateText("Vietyoru Hỗ trợ", activeLanguage)}
          </h2>
          <div style={{ fontSize: "11px", color: connectionStatus === 'connected' ? '#7fd3a2' : '#f87171', marginTop: "1px" }}>
            {connectionStatus === 'connected' ? '● Đang trực tuyến' : '● Mất kết nối'}
          </div>
        </div>
        <IconCircleButton label={translateText("Thu nhỏ chat hỗ trợ", activeLanguage)} onClick={onClose}>
          <ChevronDown size={15} strokeWidth={2.2} />
        </IconCircleButton>
        <IconCircleButton label={translateText("Đóng chat hỗ trợ", activeLanguage)} onClick={onClose}>
          <X size={13} strokeWidth={2.4} />
        </IconCircleButton>
      </div>

      <ChatThread messages={messages} isMobile={false} isLoadingHistory={isLoadingHistory} />
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
  isLoadingHistory,
  connectionStatus,
  onClose,
  onDraftChange,
  onSubmit,
}: {
  draft: string;
  messages: ChatMessage[];
  isLoadingHistory?: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  onClose: () => void;
  onDraftChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const activeLanguage = useActiveLanguage();
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
          borderBottom: "1px solid var(--vy-border)",
          flex: "none",
        }}
      >
        <button
          type="button"
          aria-label={translateText("Đóng chat hỗ trợ", activeLanguage)}
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
            {translateText("Vietyoru Hỗ trợ", activeLanguage)}
          </h2>
          <div style={{ fontSize: "11px", color: connectionStatus === 'connected' ? '#7fd3a2' : '#f87171', marginTop: "2px" }}>
            {connectionStatus === 'connected' ? '● Đang trực tuyến' : '● Mất kết nối'}
          </div>
        </div>
        <IconCircleButton label={translateText("Thu nhỏ chat hỗ trợ", activeLanguage)} onClick={onClose} size={34}>
          <ChevronDown size={16} strokeWidth={2.2} />
        </IconCircleButton>
      </div>

      <ChatThread messages={messages} isMobile isLoadingHistory={isLoadingHistory} />
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
  const activeLanguage = useActiveLanguage();
  const size = isMobile ? 36 : 40;

  return (
    <button
      type="button"
      data-support-chat-trigger="true"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={translateText(isOpen ? "Đóng chat hỗ trợ" : "Mở chat hỗ trợ", activeLanguage)}
      onClick={onClick}
      style={{
        minHeight: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        border: `1px solid ${isOpen ? "var(--vy-border-gold-40)" : "var(--vy-border-gold-32)"}`,
        color: isOpen ? chatColors.goldPale : chatColors.gold,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: isMobile ? "transparent" : "var(--vy-surface-2)",
        boxShadow: isOpen ? "0 0 0 3px var(--vy-gold-soft-bg)" : "none",
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
  const activeLanguage = useActiveLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected'|'disconnected'|'error'>('disconnected');
  const hasOpened = useRef(false);

  useEffect(() => {
    if (isOpen) hasOpened.current = true;
  }, [isOpen]);

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  useEffect(() => {
    const user = getAuthUser();
    if (user) setCurrentUser(user);

    let gId = localStorage.getItem("vy_guest_session_id");
    if (!gId) {
      gId = "guest_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("vy_guest_session_id", gId);
    }
    setGuestSessionId(gId);

    const savedTicketId = localStorage.getItem("vy_support_ticket_id");
    if (savedTicketId) {
      setTicketId(savedTicketId);
    }
  }, []);

  useEffect(() => {
    if (!ticketId) return;
    setIsLoadingHistory(true);
    fetch(process.env.NEXT_PUBLIC_API_URL + "/api/support/history?ticketId=" + ticketId)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped: ChatMessage[] = data.map((m: any) => ({
            id: m.id,
            from: m.senderType === "USER" || m.senderType === "GUEST" ? "user" : "support",
            text: m.content,
            time: formatChatTime(new Date(m.createdAt), activeLanguage),
          }));
          setMessages(mapped);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingHistory(false));
  }, [ticketId, activeLanguage]);

  const activeLanguageRef = useRef(activeLanguage);
  useEffect(() => {
    activeLanguageRef.current = activeLanguage;
  }, [activeLanguage]);

  useEffect(() => {
    if (!socket || !ticketId) return;
    
    // Update query for future reconnects without disconnecting now
    socket.io.opts.query = { ticketId };
    
    const onReconnect = () => {
      socket.emit('rejoin_ticket', { ticketId });
    };
    
    socket.on('connect', onReconnect);
    
    if (socket.connected) {
      onReconnect();
    }
    
    return () => {
      socket.off('connect', onReconnect);
    };
  }, [socket, ticketId]);

  useEffect(() => {
    if (!hasOpened.current) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    let socketHost = apiUrl;
    let socketPath = undefined; // socket.io default is /socket.io

    try {
      const parsedUrl = new URL(apiUrl);
      if (parsedUrl.pathname && parsedUrl.pathname !== '/') {
        // API has a subpath (e.g. /api/backend)
        // Set host to origin (to keep namespace as /support)
        socketHost = parsedUrl.origin;
        // Append socket.io to the subpath so Nginx routes it correctly
        socketPath = `${parsedUrl.pathname.replace(/\/$/, '')}/socket.io`;
      }
    } catch (e) {
      console.error('Invalid NEXT_PUBLIC_API_URL', e);
    }

    const newSocket = io(socketHost + '/support', {
      path: socketPath,
      query: ticketId ? { ticketId } : undefined
    });
    setSocket(newSocket);
    
    newSocket.on('connect', () => setConnectionStatus('connected'));
    newSocket.on('disconnect', () => setConnectionStatus('disconnected'));
    newSocket.on('connect_error', () => setConnectionStatus('error'));

    newSocket.on('receive_message', (msg: any) => {
      setMessages(prev => {
        // Prevent duplicate if we already have it from optimistic UI
        if (prev.some(m => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            id: msg.id || Date.now().toString(),
            from: msg.senderType === 'USER' || msg.senderType === 'GUEST' ? 'user' : 'support',
            text: msg.content,
            time: formatChatTime(new Date(msg.createdAt || Date.now()), activeLanguageRef.current),
          }
        ];
      });
    });

    newSocket.on('system_message', (msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            id: msg.id || Date.now().toString(),
            from: 'support',
            text: msg.content,
            time: formatChatTime(new Date(msg.createdAt || Date.now()), activeLanguageRef.current),
          }
        ];
      });
    });

    newSocket.on('ticket_closed', () => {
      setMessages(prev => [
        ...prev,
        {
          id: 'closed-' + Date.now().toString(),
          from: 'support',
          text: 'Phiên chat đã được đóng bởi nhân viên hỗ trợ.',
          time: formatChatTime(new Date(), activeLanguageRef.current),
        }
      ]);
      setTicketId(null);
      localStorage.removeItem("vy_support_ticket_id");
    });

    return () => {
      newSocket.close();
    };
  }, [hasOpened.current]);

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
    if (!text || !socket) return;

    setDraft("");

    const localTempId = 'temp-' + Date.now().toString();
    setMessages(prev => [
      ...prev,
      {
        id: localTempId,
        from: 'user',
        text,
        time: formatChatTime(new Date(), activeLanguageRef.current),
      }
    ]);

    socket.emit("send_message", {
      ticketId,
      content: text,
      guestSessionId,
      userId: currentUser?.id
    }, (response: any) => {
      if (response && response.error === 'Offline') {
        // Remove optimistic message if offline and show system message
        setMessages(prev => [
          ...prev.filter(m => m.id !== localTempId),
          {
            id: 'offline-' + Date.now(),
            from: 'support',
            text: 'Hiện tại chúng tôi đang ngoài giờ làm việc. Vui lòng liên hệ trực tiếp qua Hotline: 1900-xxxx',
            time: formatChatTime(new Date(), activeLanguageRef.current),
          }
        ]);
        return;
      }
      
      // Update real ID from server
      if (response && response.id) {
        setMessages(prev => prev.map(m => m.id === localTempId ? { ...m, id: response.id } : m));
      }

      if (response && response.ticketId && !ticketId) {
        setTicketId(response.ticketId);
        localStorage.setItem("vy_support_ticket_id", response.ticketId);
      }
    });
  };

  const panel = isMobile ? (
    <MobileSupportChatPanel
      draft={draft}
      messages={messages}
      isLoadingHistory={isLoadingHistory}
      connectionStatus={connectionStatus}
      onClose={() => onOpenChange(false)}
      onDraftChange={setDraft}
      onSubmit={handleSubmit}
    />
  ) : (
    <DesktopSupportChatPanel
      draft={draft}
      messages={messages}
      isLoadingHistory={isLoadingHistory}
      connectionStatus={connectionStatus}
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
