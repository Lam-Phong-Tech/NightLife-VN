'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { authSessionChangeEvent, getAuthUser } from '@/lib/auth/session';
import {
  memberNotificationCreatedEvent,
  type MemberNotificationSocketPayload,
} from '@/lib/api/notifications';
import { getSupportSocketConfig } from "@/lib/socket-config";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : (getAuthUser()?.id ?? null),
  );
  const activeUserId = userId ?? sessionUserId ?? undefined;

  useEffect(() => {
    const updateSessionUser = () => {
      setSessionUserId(getAuthUser()?.id ?? null);
    };

    window.addEventListener(authSessionChangeEvent, updateSessionUser);
    window.addEventListener('storage', updateSessionUser);

    return () => {
      window.removeEventListener(authSessionChangeEvent, updateSessionUser);
      window.removeEventListener('storage', updateSessionUser);
    };
  }, []);

  useEffect(() => {
    // Connect to Backend WebSocket server
    const socketConfig = getSupportSocketConfig();

    const socketInstance = io(socketConfig.host, {
      path: socketConfig.path,
      transports: ['websocket'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (activeUserId) {
        socketInstance.emit('join_room', { userId: activeUserId });
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('booking_status_updated', (data) => {
      window.dispatchEvent(new CustomEvent('nightlife:booking-status-updated', { detail: data }));

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Trạng thái lịch đặt đã cập nhật', {
          body: `Lịch đặt tại ${data?.store?.name || 'Vietyoru'} vừa có trạng thái mới.`,
        });
      }
    });

    socketInstance.on(
      'member_notification_created',
      (data: MemberNotificationSocketPayload) => {
        window.dispatchEvent(
          new CustomEvent(memberNotificationCreatedEvent, { detail: data }),
        );

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Bạn có thông báo mới', {
            body: 'Vietyoru vừa gửi một cập nhật mới cho bạn.',
          });
        }
      },
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [activeUserId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
