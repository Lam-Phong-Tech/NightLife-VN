'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Search, Send, ArrowLeft } from 'lucide-react';

import { getAuthUser, getAuthSessionToken, type AuthUser } from '@/lib/auth/session';
import { recordSessionReplacedNotice } from '@/lib/auth/session-replaced-notice';
import { getSupportSocketConfig, getApiBaseUrl } from '@/lib/socket-config';
import { filterAdminSupportTickets, type AdminSupportTicketFilter } from './admin-support-ticket-filter';
import { AdminToast } from '@/components/ui/AdminToast';

type SupportMessagePayload = {
  id?: string;
  ticketId?: string;
  senderType?: 'GUEST' | 'USER' | 'ADMIN' | 'SYSTEM';
  content?: string;
  createdAt?: string;
};

type SupportTicketPayload = {
  id: string;
  userId?: string | null;
  status?: string;
  user?: {
    displayName?: string | null;
    email?: string | null;
  } | null;
  messages?: SupportMessagePayload[];
  latestMessage?: string | null;
  claimedByOther?: boolean;
};

type SupportActionResponse = {
  success?: boolean;
  ticket?: SupportTicketPayload;
  error?: string;
};

type SessionMergedPayload = {
  ticketId: string;
  user?: {
    id?: string;
    displayName?: string | null;
    email?: string | null;
  } | null;
};

function formatSupportTicket(ticket: SupportTicketPayload): SupportTicketPayload {
  const latestConversationMessage = ticket.messages?.find((message) => message.senderType !== 'SYSTEM');

  return {
    ...ticket,
    messages: latestConversationMessage ? [latestConversationMessage] : [],
    latestMessage: ticket.latestMessage ?? latestConversationMessage?.content ?? null,
  };
}

export function AdminSupportDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pendingTickets, setPendingTickets] = useState<SupportTicketPayload[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [activeTicketInfo, setActiveTicketInfo] = useState<SupportTicketPayload | null>(null);
  const [messages, setMessages] = useState<SupportMessagePayload[]>([]);
  const [input, setInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [ticketFilter, setTicketFilter] = useState<AdminSupportTicketFilter>('waiting');
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketPage, setTicketPage] = useState(1);

  const activeTicketIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeTicketIdRef.current = activeTicketId;
  }, [activeTicketId]);

  useEffect(() => {
    const user = getAuthUser();
    console.log('[Admin Dashboard] Loaded user:', user);
    if (user) setCurrentUser(user);
    else console.warn('[Admin Dashboard] No user found. Socket will not connect.');
  }, []);

  useEffect(() => {
    if (!currentUser) return; // Wait for user to be loaded

    const socketConfig = getSupportSocketConfig();
    const token = getAuthSessionToken();
    if (!token || !currentUser.id) {
      console.warn('[Admin Dashboard] Invalid admin session. Socket will not connect.');
      return;
    }

    const newSocket = io(socketConfig.host + '/support', {
      path: socketConfig.path,
      auth: { token },
      forceNew: true,
    });
    console.log(`[Admin Dashboard] Connecting to socket at ${socketConfig.host}${socketConfig.path || ''}...`);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Admin Dashboard] Socket connected! Admin is now ONLINE. Socket ID:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Admin Dashboard] Socket connection error:', err);
      setToast(err.message === 'UNAUTHORIZED' ? 'Phiên đăng nhập quản trị không hợp lệ. Vui lòng đăng nhập lại.' : 'Không thể kết nối chat hỗ trợ. Vui lòng thử lại.');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Admin Dashboard] Socket disconnected. Reason:', reason);
    });

    newSocket.on('session_replaced', () => {
      // The global SessionSecurityWatcher renders the warning and clears cookies.
      recordSessionReplacedNotice({ role: currentUser.role });
    });

    // Initial load pending tickets via REST API
    fetch(`${getApiBaseUrl()}/api/support/pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Format tickets with latest message from DB if available
          const formatted = data.map(formatSupportTicket);
          setPendingTickets(formatted);
          // Join socket rooms for all tickets so admin receives new messages
          formatted.forEach((t) => newSocket.emit('rejoin_ticket', { ticketId: t.id }));
        } else {
          console.error('Expected array for pending tickets, got:', data);
        }
      })
      .catch(console.error);

    newSocket.on('new_ticket', (ticket: SupportTicketPayload) => {
      setPendingTickets((prev) => {
        const formattedTicket = formatSupportTicket(ticket);
        if (prev.some((t) => t.id === ticket.id)) {
          return prev.map((t) => (t.id === ticket.id ? { ...t, ...formattedTicket } : t));
        }
        return [formattedTicket, ...prev];
      });
      newSocket.emit('rejoin_ticket', { ticketId: ticket.id });
    });

    newSocket.on('ticket_claimed', (data: { ticketId: string; adminId: string }) => {
      // If WE claimed it, don't remove it from the list! Just mark it as ours
      if (data.adminId === currentUser.id) {
        setPendingTickets((prev) => prev.map((t) => (t.id === data.ticketId ? { ...t, claimedByOther: false, status: 'ACTIVE' } : t)));
        return;
      }
      setPendingTickets((prev) => prev.map((t) => (t.id === data.ticketId ? { ...t, claimedByOther: true } : t)));

      setTimeout(() => {
        setPendingTickets((prev) => prev.filter((t) => t.id !== data.ticketId));
      }, 2000);
    });

    newSocket.on('receive_message', (msg: SupportMessagePayload) => {
      // Update preview in the sidebar
      if (msg.senderType !== 'SYSTEM') {
        setPendingTickets((prev) => prev.map((t) => (t.id === msg.ticketId ? { ...t, latestMessage: msg.content, messages: [msg] } : t)));
      }

      // Update active messages ONLY if it belongs to activeTicketId
      if (activeTicketIdRef.current === msg.ticketId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });

    newSocket.on('ticket_closed', (data: { ticketId: string }) => {
      setActiveTicketId((prev) => {
        if (prev === data.ticketId) {
          setMessages([]);
          setToast('Đoạn chat đã được đóng.');
          setTimeout(() => setToast(null), 3000);
          return null;
        }
        return prev;
      });
    });

    newSocket.on('session_merged', (data: SessionMergedPayload) => {
      const applyMergedIdentity = (ticket: SupportTicketPayload): SupportTicketPayload =>
        ticket.id === data.ticketId
          ? {
              ...ticket,
              userId: data.user?.id ?? ticket.userId,
              user: data.user
                ? {
                    ...ticket.user,
                    ...data.user,
                  }
                : ticket.user,
            }
          : ticket;

      setPendingTickets((prev) => prev.map(applyMergedIdentity));
      setActiveTicketInfo((prev) => (prev ? applyMergedIdentity(prev) : prev));
      setToast(`Khách hàng đã đăng nhập: ${data.user?.displayName || 'Tài khoản mới'}`);
      setTimeout(() => setToast(null), 4000);
    });

    return () => {
      newSocket.close();
    };
  }, [currentUser]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket || !activeTicketId) return;

    const onReconnect = () => {
      socket.emit('rejoin_ticket', { ticketId: activeTicketId });
    };

    socket.on('connect', onReconnect);

    // If we just got an activeTicketId and we're connected, let's rejoin just in case (though claim handles it, it doesn't hurt)
    if (socket.connected) {
      onReconnect();
    }

    return () => {
      socket.off('connect', onReconnect);
    };
  }, [socket, activeTicketId]);

  const claimTicket = async (ticketId: string) => {
    if (!socket) return;

    socket.emit('claim_ticket', { ticketId }, (response: SupportActionResponse) => {
      if (response.success) {
        const ticketInfo = pendingTickets.find((t) => t.id === ticketId);
        setActiveTicketInfo(ticketInfo ?? response.ticket ?? null);
        setActiveTicketId(ticketId);
        // Don't filter it out, keep it in the list as ACTIVE
        setPendingTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: 'ACTIVE' } : t)));
        fetch(`${getApiBaseUrl()}/api/support/history?ticketId=${ticketId}`)
          .then((res) => res.json())
          .then((data) => setMessages(data));
      } else {
        setToast(response.error || 'Không thể tiếp nhận đoạn chat. Vui lòng thử lại.');
        if (response.error?.includes('được tiếp nhận')) {
          setPendingTickets((prev) => prev.filter((t) => t.id !== ticketId));
        }
        setTimeout(() => setToast(null), 3000);
      }
    });
  };

  const sendMessage = () => {
    if (!input.trim() || !activeTicketId || !socket) return;

    const text = input.trim();
    setInput('');

    const localTempId = 'temp-' + Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: localTempId,
        senderType: 'ADMIN',
        content: text,
        createdAt: new Date().toISOString(),
      },
    ]);

    socket.emit(
      'send_message',
      {
        ticketId: activeTicketId,
        content: text,
      },
      (response: SupportMessagePayload) => {
        if (response && response.id) {
          setMessages((prev) => prev.map((m) => (m.id === localTempId ? { ...m, id: response.id } : m)));
          setPendingTickets((prev) =>
            prev.map((ticket) =>
              ticket.id === activeTicketId
                ? {
                    ...ticket,
                    latestMessage: response.content ?? text,
                    messages: [{ ...response, senderType: 'ADMIN' }],
                  }
                : ticket,
            ),
          );
        }
      },
    );
  };

  const closeTicket = () => {
    if (!socket || !activeTicketId) return;
    socket.emit('close_ticket', { ticketId: activeTicketId }, (response: SupportActionResponse) => {
      if (response.success) {
        setPendingTickets((prev) => prev.filter((t) => t.id !== activeTicketId));
        setActiveTicketId(null);
        setActiveTicketInfo(null);
        setMessages([]);
      }
    });
  };

  const currentTicketDisplay = activeTicketInfo || {
    id: activeTicketId,
    userId: null,
    user: { displayName: 'Đang tải...' },
  };

  // Helper to format time safely
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const visibleTickets = filterAdminSupportTickets(pendingTickets, ticketFilter);
  const filteredTickets = visibleTickets.filter((ticket) => {
    if (!ticketSearch.trim()) return true;
    const q = ticketSearch.trim().toLowerCase();
    const name = (ticket.user?.displayName || 'Khách vãng lai').toLowerCase();
    const email = (ticket.user?.email || '').toLowerCase();
    const id = (ticket.id || '').toLowerCase();
    const msg = (ticket.latestMessage || '').toLowerCase();
    return name.includes(q) || email.includes(q) || id.includes(q) || msg.includes(q);
  });

  const TICKET_PAGE_SIZE = 5;
  const totalTicketPages = Math.max(1, Math.ceil(filteredTickets.length / TICKET_PAGE_SIZE));
  const safeTicketPage = Math.min(Math.max(1, ticketPage), totalTicketPages);
  const paginatedTickets = filteredTickets.slice((safeTicketPage - 1) * TICKET_PAGE_SIZE, safeTicketPage * TICKET_PAGE_SIZE);

  return (
    <div
      className="flex flex-col h-[calc(100vh-100px)] min-h-[600px] max-md:h-[calc(100dvh-70px)] max-md:min-h-0 max-md:rounded-none max-md:border-none rounded-xl overflow-hidden font-sans antialiased"
      style={{
        background: '#0c0c0f',
        color: '#f3f0ea',
        border: '1px solid rgba(255,255,255,.06)',
      }}
    >
      <AdminToast
        message={toast}
        tone={toast?.includes('Không thể') || toast?.includes('không hợp lệ') ? 'error' : 'success'}
      />

      <div className="flex flex-1 min-h-0">
        {/* Cột trái: Pending Tickets / Hội thoại */}
        <div
          className={`w-[320px] max-md:w-full flex-none flex flex-col ${activeTicketId ? 'max-md:hidden' : 'max-md:flex'}`}
          style={{
            borderRight: '1px solid rgba(255,255,255,.06)',
            background: 'rgba(255,255,255,.012)',
          }}
        >
          <div className="p-4 pb-3">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)',
              }}
            >
              <Search size={14} style={{ color: '#8c8679' }} />
              <input
                type="text"
                placeholder="Tìm hội thoại…"
                value={ticketSearch}
                onChange={(e) => {
                  setTicketSearch(e.target.value);
                  setTicketPage(1);
                }}
                className="bg-transparent border-none outline-none text-xs w-full"
                style={{
                  color: '#f3f0ea',
                  caretColor: '#d4b26a',
                }}
              />
            </div>
            <div className="flex gap-1.5 mt-2.5">
              <button
                type="button"
                onClick={() => {
                  setTicketFilter('waiting');
                  setTicketPage(1);
                }}
                aria-pressed={ticketFilter === 'waiting'}
                className="whitespace-nowrap text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                style={{
                  color: ticketFilter === 'waiting' ? '#241a0a' : '#9b958a',
                  background: ticketFilter === 'waiting' ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.04)',
                  border: ticketFilter === 'waiting' ? '1px solid transparent' : '1px solid rgba(255,255,255,.08)',
                }}
              >
                Đang chờ
              </button>
              <button
                type="button"
                onClick={() => {
                  setTicketFilter('all');
                  setTicketPage(1);
                }}
                aria-pressed={ticketFilter === 'all'}
                className="whitespace-nowrap text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                style={{
                  color: ticketFilter === 'all' ? '#241a0a' : '#9b958a',
                  background: ticketFilter === 'all' ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.04)',
                  border: ticketFilter === 'all' ? '1px solid transparent' : '1px solid rgba(255,255,255,.08)',
                }}
              >
                Tất cả
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 custom-scrollbar">
            {paginatedTickets.map((ticket) => {
              const isClaimed = ticket.claimedByOther;
              const isSelected = ticket.id === activeTicketId;
              const avatarLetter = (ticket.user?.displayName || 'K').charAt(0).toUpperCase();

              return (
                <div
                  key={ticket.id}
                  onClick={() => !isClaimed && claimTicket(ticket.id)}
                  className="flex gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150"
                  style={{
                    background: isSelected ? 'linear-gradient(135deg,rgba(212,178,106,.12),rgba(255,255,255,.02))' : 'transparent',
                    border: isSelected ? '1px solid rgba(212,178,106,.36)' : '1px solid transparent',
                    opacity: isClaimed ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isClaimed) {
                      e.currentTarget.style.background = 'rgba(255,255,255,.02)';
                      e.currentTarget.style.border = '1px solid rgba(255,255,255,.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isClaimed) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.border = '1px solid transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '40px',
                      height: '40px',
                      flex: 'none',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg,#f4e3b4,#d4b26a)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#241a0a',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}
                  >
                    {avatarLetter}
                    {!isClaimed && (
                      <span
                        style={{
                          position: 'absolute',
                          right: '-1px',
                          bottom: '-1px',
                          width: '11px',
                          height: '11px',
                          borderRadius: '50%',
                          background: '#5fbf86',
                          border: '2px solid #0c0c0f',
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center" style={{ gap: '7px' }}>
                      <span className="truncate flex-1" style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>
                        {ticket.userId ? ticket.user?.displayName : 'Khách vãng lai'}
                      </span>
                    </div>
                    <div className="truncate" style={{ fontSize: '11px', color: '#8c8679', marginTop: '3px' }}>
                      {isClaimed ? 'Đang có Admin nhận...' : ticket.latestMessage || (ticket.status === 'ACTIVE' ? 'Đang hỗ trợ...' : 'Đang chờ hỗ trợ...')}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#57534b', marginTop: '3px' }}>Phiên hỗ trợ {ticket.id.substring(0, 8)}</div>
                  </div>
                </div>
              );
            })}

            {filteredTickets.length === 0 && (
              <div className="text-center mt-8 text-xs" style={{ color: '#57534b' }}>
                {ticketSearch.trim() ? 'Không tìm thấy hội thoại phù hợp' : ticketFilter === 'waiting' ? 'Không có tin nhắn chờ' : 'Không có hội thoại'}
              </div>
            )}
          </div>

          {/* Pagination bar for support tickets */}
          {filteredTickets.length > 0 && (
            <div
              className="p-3 flex-none flex items-center justify-between gap-2 text-xs"
              style={{
                borderTop: '1px solid rgba(255,255,255,.06)',
                background: 'rgba(255,255,255,.015)',
                color: '#8c8679',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600 }}>
                Trang {safeTicketPage}/{totalTicketPages} ({filteredTickets.length} hội thoại)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeTicketPage <= 1}
                  onClick={() => setTicketPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '7px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: '1px solid rgba(255,255,255,.08)',
                    background: 'rgba(255,255,255,.035)',
                    color: safeTicketPage <= 1 ? '#57534b' : '#c5c0b6',
                    cursor: safeTicketPage <= 1 ? 'not-allowed' : 'pointer',
                    opacity: safeTicketPage <= 1 ? 0.5 : 1,
                  }}
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={safeTicketPage >= totalTicketPages}
                  onClick={() => setTicketPage((p) => Math.min(totalTicketPages, p + 1))}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '7px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: '1px solid rgba(255,255,255,.08)',
                    background: 'rgba(255,255,255,.035)',
                    color: safeTicketPage >= totalTicketPages ? '#57534b' : '#c5c0b6',
                    cursor: safeTicketPage >= totalTicketPages ? 'not-allowed' : 'pointer',
                    opacity: safeTicketPage >= totalTicketPages ? 0.5 : 1,
                  }}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cột phải: Active Chat Thread */}
        <div
          className={`flex-1 min-w-0 flex flex-col ${!activeTicketId ? 'max-md:hidden' : 'max-md:fixed max-md:inset-0 max-md:z-[100] max-md:h-[100dvh] max-md:w-full max-md:bg-[#0c0c0f]'}`}
          style={{
            background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(212,178,106,.03), #0c0c0f)',
          }}
        >
          {activeTicketId ? (
            <>
              {/* Header của khung chat */}
              <div
                className="flex-none flex items-center gap-2.5 py-3 px-3.5 md:px-5 z-10"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,.06)',
                  background: 'rgba(12,12,15,.95)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTicketId(null)}
                  className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#d4b26a] bg-white/5 border border-white/10 hover:bg-white/10 flex-none"
                  aria-label="Quay lại danh sách hội thoại"
                  title="Quay lại danh sách"
                >
                  <ArrowLeft size={18} />
                </button>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    flex: 'none',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f4e3b4, #d4b26a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#241a0a',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  {(currentTicketDisplay.user?.displayName || 'C').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#f3f0ea' }}>{currentTicketDisplay.userId ? currentTicketDisplay.user?.displayName : 'Khách vãng lai'}</div>
                </div>
                <button
                  onClick={closeTicket}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#e3c27e',
                    background: 'rgba(212,178,106,.1)',
                    border: '1px solid rgba(212,178,106,.32)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(212,178,106,.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(212,178,106,.1)';
                  }}
                >
                  Hoàn tất (Close)
                </button>
              </div>

              {/* Vùng hiển thị tin nhắn */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-1 custom-scrollbar">
                {messages.map((m, idx) => {
                  const isAdmin = m.senderType === 'ADMIN';
                  const isSystem = m.senderType === 'SYSTEM';

                  if (isSystem) {
                    return (
                      <div key={idx} className="flex justify-center my-2">
                        <div
                          className="px-3 py-1.5 rounded-full"
                          style={{
                            fontSize: '11px',
                            background: 'rgba(255,255,255,.04)',
                            border: '1px solid rgba(255,255,255,.07)',
                            color: '#8c8679',
                          }}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className={`flex min-w-0 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[62%] min-w-0">
                        <div
                          className="notranslate"
                          translate="no"
                          style={
                            isAdmin
                              ? {
                                  fontSize: '13px',
                                  lineHeight: 1.55,
                                  color: '#241a0a',
                                  background: 'linear-gradient(135deg, #f0dda8, #d4b26a)',
                                  padding: '11px 15px',
                                  borderRadius: '15px 15px 4px 15px',
                                  fontWeight: 500,
                                  whiteSpace: 'pre-wrap',
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word',
                                }
                              : {
                                  fontSize: '13px',
                                  lineHeight: 1.55,
                                  color: '#e6e2da',
                                  background: 'rgba(255,255,255,.055)',
                                  border: '1px solid rgba(255,255,255,.08)',
                                  padding: '11px 15px',
                                  borderRadius: '15px 15px 15px 4px',
                                  whiteSpace: 'pre-wrap',
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word',
                                }
                          }
                        >
                          {m.content}
                        </div>
                        <div
                          style={{
                            fontSize: '9.5px',
                            color: '#57534b',
                            marginTop: '4px',
                            textAlign: isAdmin ? 'right' : 'left',
                          }}
                        >
                          {formatTime(m.createdAt)} {isAdmin ? '· Admin' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Khu vực nhập tin nhắn */}
              <div
                className="flex-none py-3 px-3.5 md:px-5 pb-[calc(12px+env(safe-area-inset-bottom))]"
                style={{
                  borderTop: '1px solid rgba(255,255,255,.06)',
                  background: 'rgba(12,12,15,.95)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Các câu hỏi gợi ý */}
                <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1 custom-scrollbar max-md:flex-nowrap">
                  <button
                    onClick={() => setInput('Admin đã xác nhận với quán — bàn của anh/chị đã được giữ ạ ✓')}
                    className="text-[11px] px-3 py-1.5 rounded-full transition-all duration-150 whitespace-nowrap flex-none"
                    style={{
                      color: '#c5c0b6',
                      background: 'rgba(255,255,255,.04)',
                      border: '1px solid rgba(255,255,255,.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212,178,106,.4)';
                      e.currentTarget.style.color = '#e3c27e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)';
                      e.currentTarget.style.color = '#c5c0b6';
                    }}
                  >
                    Đã xác nhận với quán ✓
                  </button>
                  <button
                    onClick={() => setInput('Dạ muốn đổi giờ/số người, anh/chị vui lòng hủy & đặt lại. Em hỗ trợ tạo booking mới ngay ạ.')}
                    className="text-[11px] px-3 py-1.5 rounded-full transition-all duration-150 whitespace-nowrap flex-none"
                    style={{
                      color: '#c5c0b6',
                      background: 'rgba(255,255,255,.04)',
                      border: '1px solid rgba(255,255,255,.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212,178,106,.4)';
                      e.currentTarget.style.color = '#e3c27e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)';
                      e.currentTarget.style.color = '#c5c0b6';
                    }}
                  >
                    Muốn đổi giờ → hủy & đặt lại giúp anh/chị
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div
                    className="flex-1 flex items-center gap-2.5 rounded-xl px-4 py-3"
                    style={{
                      background: 'rgba(255,255,255,.045)',
                      border: '1px solid rgba(255,255,255,.1)',
                    }}
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendMessage();
                      }}
                      placeholder="Nhập tin nhắn trả lời khách…"
                      className="flex-1 bg-transparent border-none outline-none text-[13.5px] notranslate"
                      translate="no"
                      style={{
                        color: '#f3f0ea',
                        caretColor: '#d4b26a',
                      }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-11 h-11 flex-none rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
                      color: '#241a0a',
                      opacity: !input.trim() ? 0.5 : 1,
                      cursor: !input.trim() ? 'not-allowed' : 'pointer',
                      boxShadow: '0 8px 20px -8px rgba(212,178,106,.5)',
                    }}
                  >
                    <Send size={17} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div
              className="flex-1 flex flex-col items-center justify-center"
              style={{
                color: '#57534b',
              }}
            >
              <Search size={48} style={{ marginBottom: '16px', opacity: 0.15 }} />
              <p style={{ fontSize: '13.5px' }}>Chọn một đoạn chat đang chờ để bắt đầu hỗ trợ</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 9px;
          height: 9px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(212, 178, 106, 0.2);
          border-radius: 9px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
