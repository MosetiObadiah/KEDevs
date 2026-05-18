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
  latestNotification: any | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [latestNotification, setLatestNotification] = useState<any | null>(null);

  const refreshUnreadCount = async () => {
    if (!isLoggedIn || user?.accountStatus === 'BANNED' || user?.accountStatus === 'SUSPENDED') return;
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(Number(response.data.count));
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
    if (!isLoggedIn || !user || user.accountStatus === 'BANNED' || user.accountStatus === 'SUSPENDED') {
      if (stompClient) {
        stompClient.deactivate();
        setStompClient(null);
      }
      return;
    }

    const token = localStorage.getItem('token');

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
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
          
          // More robust approach: fetch the actual count from backend to ensure synchronization
          refreshUnreadCount();
          setLatestNotification(notification);
          // Toast disabled per user request to keep notifications silent until inbox is visited
        } catch (err) {
          console.error('Error parsing websocket message:', err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP Handshake / Connection Error:', frame.headers['message']);
      console.error('Additional Details:', frame.body);
    };

    client.onWebSocketError = (event) => {
      console.error('WebSocket Error:', event);
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
      clearUnreadCount: () => setUnreadCount(0),
      latestNotification
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
