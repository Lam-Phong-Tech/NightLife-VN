'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Search, Send } from 'lucide-react';

export function AdminSupportDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pendingTickets, setPendingTickets] = useState<any[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // MOCK admin user
  const adminId = 'mock-admin-id';
  const role = 'ADMIN';

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL + '/support', {
      query: { adminId, role },
    });
    setSocket(newSocket);

    // Initial load pending tickets via REST API (Mocked here)
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
  }, []);

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
    
    socket.emit('send_message', {
      ticketId: activeTicketId,
      content: input,
      userId: adminId,
    });
    
    setInput('');
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
    <div className="flex flex-col h-[calc(100vh-100px)] min-h-[600px] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#0c0c0f] text-gray-800 dark:text-[#f3f0ea] font-sans antialiased shadow-sm transition-colors duration-200">
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 bg-red-500 text-white px-5 py-3 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 font-medium text-sm">
          {toast}
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        
        {/* Cột trái: Pending Tickets / Hội thoại */}
        <div className="w-[320px] flex-none border-r border-gray-200 dark:border-white/5 flex flex-col bg-gray-50/50 dark:bg-white/5 transition-colors duration-200">
          <div className="p-4 pb-3">
            <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 shadow-sm transition-colors duration-200">
              <Search size={16} className="text-gray-400 dark:text-[#6f6b62]" />
              <input 
                type="text" 
                placeholder="Tìm hội thoại…" 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-[#f3f0ea] placeholder-gray-400 dark:placeholder-[#6f6b62]"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <span className="whitespace-nowrap text-[11px] font-semibold text-gray-900 dark:text-[#241a0a] bg-gray-200 dark:bg-gradient-to-br dark:from-[#f0dda8] dark:to-[#d4b26a] px-3 py-1.5 rounded-lg">Đang chờ</span>
              <span className="whitespace-nowrap text-[11px] text-gray-500 dark:text-[#9b958a] px-3 py-1.5 rounded-lg cursor-pointer bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 transition-colors duration-200">Tất cả</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 custom-scrollbar">
            {pendingTickets.map(ticket => {
              const isClaimed = ticket.claimedByOther;
              const avatarLetter = (ticket.user?.displayName || 'K').charAt(0).toUpperCase();
              
              return (
                <div 
                  key={ticket.id} 
                  onClick={() => !isClaimed && claimTicket(ticket.id)}
                  className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border 
                    ${isClaimed ? 'bg-gray-100 dark:bg-white/5 opacity-50 border-transparent' : 'bg-white dark:bg-transparent border-gray-200 dark:border-transparent hover:border-[#d4b26a]/40 dark:hover:bg-white/5'}
                  `}
                >
                  <div className="relative w-10 h-10 flex-none rounded-full flex items-center justify-center font-bold text-sm text-[#241a0a] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-[#f4e3b4] dark:to-[#d4b26a]">
                    {avatarLetter}
                    {!isClaimed && (
                      <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-[#100f14]"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[13px] font-semibold truncate flex-1">
                        {ticket.userId ? ticket.user?.displayName : 'Khách vãng lai'}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-[#57534b] flex-none ml-2">Vừa xong</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-[#8c8679] truncate mb-1">
                      {isClaimed ? 'Đang có Admin nhận...' : 'Đang chờ hỗ trợ...'}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-[#57534b]">
                      Phiên hỗ trợ
                    </div>
                  </div>
                </div>
              );
            })}
            
            {pendingTickets.length === 0 && (
              <div className="text-center text-gray-400 dark:text-[#57534b] mt-8 text-xs">Không có tin nhắn chờ</div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_#5fbf86] animate-pulse"></span>
            <span className="text-[10px] text-gray-500 dark:text-[#8c8679] leading-tight flex-1">Chat realtime trong hệ thống — không dùng ứng dụng ngoài</span>
          </div>
        </div>

        {/* Cột phải: Active Chat Thread */}
        <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(212,178,106,.03),transparent)] transition-colors duration-200">
          {activeTicketId ? (
            <>
              {/* Header của khung chat */}
              <div className="flex-none flex items-center gap-3 py-3 px-5 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0c0c0f]/60 backdrop-blur-sm transition-colors duration-200 z-10">
                <div className="w-10 h-10 flex-none rounded-full flex items-center justify-center font-bold text-sm text-[#241a0a] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-[#f4e3b4] dark:to-[#d4b26a]">
                  C
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">Đang xử lý hỗ trợ</div>
                  <div className="text-[11px] text-green-600 dark:text-[#7fd3a2] mt-0.5">● Đang trực tuyến</div>
                </div>
                <button 
                  onClick={closeTicket}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 dark:text-[#e3c27e] bg-red-50 hover:bg-red-100 dark:bg-[#d4b26a]/10 dark:hover:bg-[#d4b26a]/20 border border-red-200 dark:border-[#d4b26a]/30 px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  Hoàn tất (Close)
                </button>
              </div>
              
              {/* Vùng hiển thị tin nhắn */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2 custom-scrollbar">
                {messages.map((m, idx) => {
                  const isAdmin = m.senderType === 'ADMIN';
                  const isSystem = m.senderType === 'SYSTEM';

                  if (isSystem) {
                    return (
                      <div key={idx} className="flex justify-center my-2">
                        <div className="text-[11px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-[#9b958a] px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10">
                          {m.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[70%]">
                        <div className={`text-[13px] leading-relaxed px-4 py-2.5 shadow-sm ${
                          isAdmin 
                            ? 'text-gray-900 dark:text-[#241a0a] bg-gray-100 dark:bg-gradient-to-br dark:from-[#f0dda8] dark:to-[#d4b26a] rounded-[15px_15px_4px_15px] font-medium border border-gray-200 dark:border-transparent' 
                            : 'text-gray-800 dark:text-[#e6e2da] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[15px_15px_15px_4px]'
                        }`}>
                          {m.content}
                        </div>
                        <div className={`text-[9.5px] text-gray-400 dark:text-[#57534b] mt-1.5 ${isAdmin ? 'text-right' : 'text-left'}`}>
                          {formatTime(m.createdAt)} {isAdmin ? '· Admin' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Khu vực nhập tin nhắn */}
              <div className="flex-none py-3 px-5 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0c0c0f]/60 backdrop-blur-sm transition-colors duration-200">
                {/* Các câu hỏi gợi ý */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <button onClick={() => setInput('Admin đã xác nhận với quán — bàn của anh/chị đã được giữ ạ ✓')} className="text-[11px] text-gray-600 hover:text-gray-900 dark:text-[#c5c0b6] bg-white dark:bg-white/5 border border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-[#d4b26a]/40 dark:hover:text-[#e3c27e] px-3 py-1.5 rounded-full transition-colors duration-200">
                    Đã xác nhận với quán ✓
                  </button>
                  <button onClick={() => setInput('Dạ muốn đổi giờ/số người, anh/chị vui lòng hủy & đặt lại. Em hỗ trợ tạo booking mới ngay ạ.')} className="text-[11px] text-gray-600 hover:text-gray-900 dark:text-[#c5c0b6] bg-white dark:bg-white/5 border border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-[#d4b26a]/40 dark:hover:text-[#e3c27e] px-3 py-1.5 rounded-full transition-colors duration-200">
                    Muốn đổi giờ → hủy & đặt lại giúp anh/chị
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 transition-colors duration-200 shadow-sm dark:shadow-none">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendMessage();
                      }}
                      placeholder="Nhập tin nhắn trả lời khách…"
                      className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-[#f3f0ea] text-[13.5px] placeholder-gray-400"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-11 h-11 flex-none rounded-xl bg-gray-900 text-white dark:bg-gradient-to-br dark:from-[#f4e3b4] dark:to-[#b6924a] dark:text-[#241a0a] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 dark:shadow-[0_8px_20px_-8px_rgba(212,178,106,0.5)] transition-all duration-200"
                  >
                    <Send size={18} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-[#57534b]">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Chọn một đoạn chat đang chờ để bắt đầu hỗ trợ</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(212, 178, 106, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
