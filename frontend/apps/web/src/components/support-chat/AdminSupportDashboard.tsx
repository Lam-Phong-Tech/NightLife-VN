'use client';

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, UserCircle } from 'lucide-react';

export function AdminSupportDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pendingTickets, setPendingTickets] = useState<any[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

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
      // Phương án 2: UI Blocking
      setPendingTickets(prev => 
        prev.map(t => t.id === data.ticketId ? { ...t, claimedByOther: true } : t)
      );
      
      // Auto remove after 2 seconds
      setTimeout(() => {
        setPendingTickets(prev => prev.filter(t => t.id !== data.ticketId));
      }, 2000);
    });

    newSocket.on('receive_message', (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const claimTicket = async (ticketId: string) => {
    if (!socket) return;

    socket.emit('claim_ticket', { ticketId, adminId }, (response: any) => {
      if (response.success) {
        setActiveTicketId(ticketId);
        setPendingTickets(prev => prev.filter(t => t.id !== ticketId));
        // Load history for this ticket via REST
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support/history?ticketId=${ticketId}`)
          .then(res => res.json())
          .then(data => setMessages(data));
      } else {
        // Phương án 1: Tranh chấp DB thất bại
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
      userId: adminId, // Sender is admin
    });
    
    setInput('');
  };

  return (
    <div className="flex h-[800px] border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Cột trái: Pending Tickets */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">Đang chờ (Broadcasting)</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {pendingTickets.map(ticket => (
            <div 
              key={ticket.id} 
              className={`p-3 mb-2 rounded border ${ticket.claimedByOther ? 'bg-gray-100 opacity-50' : 'bg-white border-gray-200 hover:border-primary'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <UserCircle size={20} className="text-gray-500" />
                  <span className="font-medium text-sm">
                    {ticket.userId ? ticket.user?.displayName : 'Khách vãng lai'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">Vừa xong</span>
              </div>
              <button 
                onClick={() => claimTicket(ticket.id)}
                disabled={ticket.claimedByOther}
                className="w-full bg-primary text-white text-sm py-1.5 rounded disabled:bg-gray-400 transition"
              >
                {ticket.claimedByOther ? 'Đang có người nhận...' : 'Nhận (Claim)'}
              </button>
            </div>
          ))}
          {pendingTickets.length === 0 && (
            <div className="text-center text-gray-500 mt-10 text-sm">Không có tin nhắn chờ</div>
          )}
        </div>
      </div>

      {/* Cột phải: Active Chat */}
      <div className="w-2/3 flex flex-col">
        {activeTicketId ? (
          <>
            <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
              <h2 className="font-semibold">Phòng Chat Đang Xử Lý</h2>
              <button className="text-red-500 text-sm border border-red-500 px-3 py-1 rounded hover:bg-red-50">
                Hoàn tất (Close)
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[70%] rounded-lg p-2.5 text-sm ${
                    msg.senderType === 'ADMIN'
                      ? 'bg-primary text-white ml-auto'
                      : msg.senderType === 'SYSTEM'
                      ? 'bg-blue-100 text-blue-800 text-center mx-auto text-xs w-full max-w-md'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-primary text-white p-2 px-4 rounded-md disabled:bg-gray-300 flex items-center gap-2"
              >
                <Send size={18} /> Gửi
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
            <p>Chọn một đoạn chat đang chờ để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}
