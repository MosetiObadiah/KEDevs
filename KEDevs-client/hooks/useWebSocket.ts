'use client';

import { useEffect } from 'react';
import { socketClient } from '@/lib/socket';

export const useWebSocket = (topic: string, onMessage: (data: any) => void) => {
  useEffect(() => {
    socketClient.activate();
    socketClient.subscribe(topic, onMessage);

    return () => {
      socketClient.unsubscribe(topic, onMessage);
    };
  }, [topic, onMessage]);
};
