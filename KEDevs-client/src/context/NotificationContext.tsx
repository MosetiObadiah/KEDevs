'use client';
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  stompClient: Client | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user, isLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [latestNotification, setLatestNotification] = useState<any | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!user || !isLoggedIn || isLoading || user.accountStatus === 'BANNED' || user.accountStatus === 'SUSPENDED') return;
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(Number(response.data.count));
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [user, isLoggedIn, isLoading]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [user, refreshUnreadCount]);

  useEffect(() => {
    if (!isLoggedIn || !user || user.accountStatus === 'BANNED' || user.accountStatus === 'SUSPENDED') {
      setStompClient(null);
      return;
    }

    // ws_token is stored in sessionStorage (tab-scoped) specifically for STOMP handshakes.
    // SockJS/STOMP cannot use httpOnly cookies during the WebSocket upgrade.
    const wsToken = sessionStorage.getItem('ws_token');

    let isDeactivating = false;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: {
        Authorization: `Bearer ${wsToken}`
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
          const notification = payload.data || payload;
          
          refreshUnreadCount();
          setLatestNotification(notification);
        } catch (err) {
          console.error('Error parsing websocket message:', err);
        }
      });
    };

    client.onStompError = (frame) => {
      if (isDeactivating) return;
      console.error('STOMP Handshake / Connection Error:', frame.headers['message']);
      console.error('Additional Details:', frame.body);
    };

    client.onWebSocketError = (event) => {
      if (isDeactivating) return;
      // SockJS tries native WS first, this fires on fallback — not a real error
      // Only log if STOMP itself isn't connected
      if (!client.connected) {
        console.error('WS failed and no fallback connected:', event);
      }
    };

    client.activate();
    setStompClient(client);

    return () => {
      isDeactivating = true;
      client.deactivate();
    };
  }, [isLoggedIn, user?.id, user?.accountStatus, refreshUnreadCount]);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const incrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const contextValue = useMemo(() => ({
    unreadCount,
    decrementUnreadCount,
    incrementUnreadCount,
    refreshUnreadCount,
    clearUnreadCount,
    latestNotification,
    stompClient
  }), [
    unreadCount,
    decrementUnreadCount,
    incrementUnreadCount,
    refreshUnreadCount,
    clearUnreadCount,
    latestNotification,
    stompClient
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
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
