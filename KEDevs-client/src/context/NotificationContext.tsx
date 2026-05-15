'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '@/services/notificationService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';

interface NotificationContextType {
  unreadCount: number;
  decrementUnreadCount: () => void;
  incrementUnreadCount: () => void;
  refreshUnreadCount: () => void;
  clearUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [stompClient, setStompClient] = useState<Client | null>(null);

  const refreshUnreadCount = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(Number(response.data));
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      refreshUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      if (stompClient) {
        stompClient.deactivate();
        setStompClient(null);
      }
      return;
    }

    const token = localStorage.getItem('token');
    // Always point SockJS to the absolute backend URL in development to bypass Next.js static rewrite issues
    const socketUrl = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/ws` 
      : 'http://localhost:8080/ws';

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log('WebSocket STOMP Connected');
      client.subscribe('/user/queue/notifications', (message) => {
        try {
          const payload = JSON.parse(message.body);
          // Web socket framing payloads map into `payload.data` or root if serialized differently.
          // Standard backend pattern wraps into: WebSocketEvent { type, data }
          const notification = payload.data || payload;
          
          setUnreadCount(prev => prev + 1);
          // Toast disabled per user request to keep notifications silent until inbox is visited
        } catch (err) {
          console.error('Error parsing websocket message:', err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP Handshake / Connection Error:', frame.headers['message']);
    };

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [isLoggedIn, user?.id]);

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      decrementUnreadCount: () => setUnreadCount(prev => Math.max(0, prev - 1)),
      incrementUnreadCount: () => setUnreadCount(prev => prev + 1),
      refreshUnreadCount,
      clearUnreadCount: () => setUnreadCount(0)
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
