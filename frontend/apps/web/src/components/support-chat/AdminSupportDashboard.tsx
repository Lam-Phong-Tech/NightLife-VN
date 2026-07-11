'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Search, Send } from 'lucide-react';

import { getAuthUser } from '@/lib/auth/session';

export function AdminSupportDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pendingTickets, setPendingTickets] = useState<any[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getAuthUser();
    if (user) setCurrentUser(user);
  }, []);

  const adminId = currentUser?.id;
  const role = currentUser?.role || 'ADMIN';

  useEffect(() => {
    if (!currentUser) return; // Wait for user to be loaded

    const adminId = currentUser.id;
    const role = currentUser.role || 'ADMIN';

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL + '/support', {
      query: { adminId, role },
    });
    setSocket(newSocket);

    // Initial load pending tickets via REST API (Mocked here)
    // Add auth token if required by your backend
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/support/pending')
      .then(res => res.json())
      .then(data => setPendingTickets(data))
      .catch(console.error);

    newSocket.on('new_ticket', (ticket: any) => {
      setPendingTickets(prev => [ticket, ...prev]);
    });

    newSocket.on('ticket_claimed', (data: { ticketId: string; adminId: string }) => {
      setPendingTickets(prev => 
        prev.map(t => t.id === data.ticketId ? { ...t, claimedByOther: true } : t)
      );
      
      setTimeout(() => {
        setPendingTickets(prev => prev.filter(t => t.id !== data.ticketId));
      }, 2000);
    });

    newSocket.on('receive_message', (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('ticket_closed', (data: { ticketId: string }) => {
      setActiveTicketId(prev => {
        if (prev === data.ticketId) {
          setMessages([]);
          setToast('Đoạn chat đã được đóng.');
          setTimeout(() => setToast(null), 3000);
          return null;
        }
        return prev;
      });
    });

    newSocket.on('session_merged', (data: { ticketId: string, user: any }) => {
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

  const claimTicket = async (ticketId: string) => {
    if (!socket) return;

    socket.emit('claim_ticket', { ticketId, adminId }, (response: any) => {
      if (response.success) {
        setActiveTicketId(ticketId);
        setPendingTickets(prev => prev.filter(t => t.id !== ticketId));
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support/history?ticketId=${ticketId}`)
          .then(res => res.json())
          .then(data => setMessages(data));
      } else {
        setToast('Rất tiếc, đoạn chat này vừa được tiếp nhận');
        setPendingTickets(prev => prev.filter(t => t.id !== ticketId));
        setTimeout(() => setToast(null), 3000);
      }
    });
  };

  const sendMessage = () => {
    if (!input.trim() || !activeTicketId || !socket) return;
    
    const text = input.trim();
    setInput('');

    const localTempId = 'temp-' + Date.now().toString();
    setMessages(prev => [...prev, {
      id: localTempId,
      senderType: 'ADMIN',
      content: text,
      createdAt: new Date().toISOString()
    }]);

    socket.emit('send_message', {
      ticketId: activeTicketId,
      content: text,
      userId: adminId,
      isAdmin: true,
    }, (response: any) => {
      if (response && response.id) {
        setMessages(prev => prev.map(m => m.id === localTempId ? { ...m, id: response.id } : m));
      }
    });
  };

  const closeTicket = () => {
    if (!socket || !activeTicketId) return;
    socket.emit('close_ticket', { ticketId: activeTicketId }, (response: any) => {
      if (response.success) {
        setActiveTicketId(null);
        setMessages([]);
      }
    });
  };

  const activeTicketInfo = pendingTickets.find(t => t.id === activeTicketId) || {
    id: activeTicketId,
    userId: null,
    user: { displayName: 'Đang tải...' }
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

  return (
    <div 
      className="flex flex-col h-[calc(100vh-100px)] min-h-[600px] rounded-xl overflow-hidden font-sans antialiased"
      style={{
        background: '#0c0c0f',
        color: '#f3f0ea',
        border: '1px solid rgba(255,255,255,.06)'
      }}
    >
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 bg-red-500 text-white px-5 py-3 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 font-medium text-sm">
          {toast}
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        
        {/* Cột trái: Pending Tickets / Hội thoại */}
        <div 
          className="w-[320px] flex-none flex flex-col"
          style={{
            borderRight: '1px solid rgba(255,255,255,.06)',
            background: 'rgba(255,255,255,.012)'
          }}
        >
          <div className="p-4 pb-3">
            <div 
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)'
              }}
            >
              <Search size={14} style={{ color: '#8c8679' }} />
              <input 
                type="text" 
                placeholder="Tìm hội thoại…" 
                className="bg-transparent border-none outline-none text-xs w-full"
                style={{
                  color: '#f3f0ea',
                  caretColor: '#d4b26a'
                }}
              />
            </div>
            <div className="flex gap-1.5 mt-2.5">
              <span 
                className="whitespace-nowrap text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                style={{
                  color: '#241a0a',
                  background: 'linear-gradient(135deg,#f0dda8,#d4b26a)'
                }}
              >
                Đang chờ
              </span>
              <span 
                className="whitespace-nowrap text-[11px] px-3 py-1.5 rounded-lg cursor-pointer"
                style={{
                  color: '#9b958a',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)'
                }}
              >
                Tất cả
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
            {pendingTickets.map(ticket => {
              const isClaimed = ticket.claimedByOther;
              const isSelected = ticket.id === activeTicketId;
              const avatarLetter = (ticket.user?.displayName || 'K').charAt(0).toUpperCase();
              
              return (
                <div 
                  key={ticket.id} 
                  onClick={() => !isClaimed && claimTicket(ticket.id)}
                  className="flex gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150"
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(135deg,rgba(212,178,106,.12),rgba(255,255,255,.02))' 
                      : 'transparent',
                    border: isSelected 
                      ? '1px solid rgba(212,178,106,.36)' 
                      : '1px solid transparent',
                    opacity: isClaimed ? 0.5 : 1
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
                      fontSize: '14px'
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
                          border: '2px solid #0c0c0f'
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center" style={{ gap: '7px' }}>
                      <span 
                        className="truncate flex-1"
                        style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}
                      >
                        {ticket.userId ? ticket.user?.displayName : 'Khách vãng lai'}
                      </span>
                      <span 
                        className="flex-none"
                        style={{ fontSize: '9.5px', color: '#57534b' }}
                      >
                        Vừa xong
                      </span>
                    </div>
                    <div 
                      className="truncate"
                      style={{ fontSize: '11px', color: '#8c8679', marginTop: '3px' }}
                    >
                      {isClaimed ? 'Đang có Admin nhận...' : 'Đang chờ hỗ trợ...'}
                    </div>
                    <div 
                      style={{ fontSize: '9.5px', color: '#57534b', marginTop: '3px' }}
                    >
                      Phiên hỗ trợ {ticket.id.substring(0, 8)}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {pendingTickets.length === 0 && (
              <div 
                className="text-center mt-8 text-xs"
                style={{ color: '#57534b' }}
              >
                Không có tin nhắn chờ
              </div>
            )}
          </div>

          <div 
            className="p-3 flex items-center gap-2"
            style={{
              borderTop: '1px solid rgba(255,255,255,.05)'
            }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: '#5fbf86',
                boxShadow: '0 0 7px #5fbf86',
                animation: 'pulse 2s infinite'
              }}
            />
            <span 
              className="leading-tight flex-1"
              style={{
                fontSize: '10px',
                color: '#8c8679'
              }}
            >
              Chat realtime trong hệ thống — không dùng ứng dụng ngoài
            </span>
            <span 
              className="flex-none"
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '1px',
                color: '#8c8679',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.1)',
                padding: '4px 7px',
                borderRadius: '6px'
              }}
            >
              P1
            </span>
          </div>
        </div>

        {/* Cột phải: Active Chat Thread */}
        <div 
          className="flex-1 min-w-0 flex flex-col"
          style={{
            background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(212,178,106,.03), transparent)'
          }}
        >
          {activeTicketId ? (
            <>
              {/* Header của khung chat */}
              <div 
                className="flex-none flex items-center gap-3 py-3.5 px-5 z-10"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,.06)',
                  background: 'rgba(12,12,15,.6)',
                  backdropFilter: 'blur(8px)'
                }}
              >
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
                    fontSize: '14px'
                  }}
                >
                  {(activeTicketInfo.user?.displayName || 'C').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#f3f0ea' }}>
                    {activeTicketInfo.userId ? activeTicketInfo.user?.displayName : 'Khách vãng lai'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#7fd3a2', marginTop: '1px' }}>
                    ● Đang trực tuyến
                  </div>
                </div>
                <button 
                  onClick={closeTicket}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#e3c27e',
                    background: 'rgba(212,178,106,.1)',
                    border: '1px solid rgba(212,178,106,.32)'
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
                            color: '#8c8679'
                          }}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[62%]">
                        <div 
                          style={
                            isAdmin 
                              ? {
                                  fontSize: '13px',
                                  lineHeight: 1.55,
                                  color: '#241a0a',
                                  background: 'linear-gradient(135deg, #f0dda8, #d4b26a)',
                                  padding: '11px 15px',
                                  borderRadius: '15px 15px 4px 15px',
                                  fontWeight: 500
                                }
                              : {
                                  fontSize: '13px',
                                  lineHeight: 1.55,
                                  color: '#e6e2da',
                                  background: 'rgba(255,255,255,.055)',
                                  border: '1px solid rgba(255,255,255,.08)',
                                  padding: '11px 15px',
                                  borderRadius: '15px 15px 15px 4px'
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
                            textAlign: isAdmin ? 'right' : 'left'
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
                className="flex-none py-3 px-5"
                style={{
                  borderTop: '1px solid rgba(255,255,255,.06)',
                  background: 'rgba(12,12,15,.6)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                {/* Các câu hỏi gợi ý */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <button 
                    onClick={() => setInput('Admin đã xác nhận với quán — bàn của anh/chị đã được giữ ạ ✓')} 
                    className="text-[11px] px-3 py-1.5 rounded-full transition-all duration-150"
                    style={{
                      color: '#c5c0b6',
                      background: 'rgba(255,255,255,.04)',
                      border: '1px solid rgba(255,255,255,.1)'
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
                    className="text-[11px] px-3 py-1.5 rounded-full transition-all duration-150"
                    style={{
                      color: '#c5c0b6',
                      background: 'rgba(255,255,255,.04)',
                      border: '1px solid rgba(255,255,255,.1)'
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
                      border: '1px solid rgba(255,255,255,.1)'
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
                      className="flex-1 bg-transparent border-none outline-none text-[13.5px]"
                      style={{
                        color: '#f3f0ea',
                        caretColor: '#d4b26a'
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
                      boxShadow: '0 8px 20px -8px rgba(212,178,106,.5)'
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
                color: '#57534b'
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
