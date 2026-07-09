'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Send } from 'lucide-react';

// Giả định có context hoặc hook lấy thông tin user đăng nhập
// import { useAuth } from '@/hooks/useAuth';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // const { user, token } = useAuth(); // MOCK
  const user = null; // MOCK: giả sử chưa đăng nhập
  const token = null;

  useEffect(() => {
    let sessionId = localStorage.getItem('guest_session_id');
    if (!sessionId && !user) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('guest_session_id', sessionId);
    }

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL + '/support', {
      query: user ? { token } : { sessionId },
    });

    setSocket(newSocket);

    newSocket.on('system_message', (msg: any) => {
      setMessages((prev) => [...prev, { ...msg, senderType: 'SYSTEM' }]);
      if (msg.content.includes('ngoài giờ làm việc')) {
        setIsOffline(true);
      }
    });

    newSocket.on('receive_message', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.close();
    };
  }, [user, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const sessionId = localStorage.getItem('guest_session_id');
    if (user && sessionId) {
      fetch(process.env.NEXT_PUBLIC_API_URL + '/api/support/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestSessionId: sessionId, userId: user['id'] })
      }).then(res => res.json()).then(data => {
        if (data.success) {
          localStorage.removeItem('guest_session_id');
        }
      }).catch(console.error);
    }
  }, [user]);

  const handleOpen = () => {
    setIsOpen(true);
    if (socket) {
      socket.emit('check_status', undefined, (response: any) => {
        setIsOffline(!response.isOnline);
      });
    }
  };

  const sendMessage = () => {
    if (!input.trim() || isOffline || !socket) return;
    
    const sessionId = localStorage.getItem('guest_session_id');
    socket.emit('send_message', {
      content: input,
      guestSessionId: user ? undefined : sessionId,
      userId: user ? user['id'] : undefined,
    });
    
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-primary text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">Hỗ trợ trực tuyến</h3>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[80%] rounded-lg p-2 text-sm ${
                  msg.senderType === 'GUEST' || msg.senderType === 'USER'
                    ? 'bg-primary text-white ml-auto'
                    : msg.senderType === 'SYSTEM'
                    ? 'bg-gray-200 text-gray-800 text-center mx-auto text-xs'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isOffline}
              placeholder={isOffline ? "Ngoài giờ làm việc..." : "Nhập tin nhắn..."}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={isOffline || !input.trim()}
              className="bg-primary text-white p-2 rounded-md disabled:bg-gray-300"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
