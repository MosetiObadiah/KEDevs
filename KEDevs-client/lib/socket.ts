import { Client, type Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = `${process.env.NEXT_PUBLIC_API_URL}/ws`;

export class SocketClient {
  private client: Client;
  private subscriptions: Map<string, any> = new Map();
  private callbacks: Map<string, Set<(payload: any) => void>> = new Map();
  private isConnecting = false;

  constructor() {
    this.client = new Client({
      brokerURL: SOCKET_URL.replace('http', 'ws'),
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
      },
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('STOMP: ' + str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected to WebSocket: ' + (frame.headers['user-name'] || 'authenticated user'));
      this.isConnecting = false;
      // Re-subscribe all active topics
      this.callbacks.forEach((callbacks, topic) => {
        this.createSubscription(topic);
      });
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error: ', frame.headers['message']);
      this.isConnecting = false;
    };

    this.client.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
      this.isConnecting = false;
    };
  }

  activate() {
    if (!this.client.active && !this.isConnecting) {
      this.isConnecting = true;
      this.client.activate();
    }
  }

  deactivate() {
    this.client.deactivate();
  }

  subscribe(topic: string, callback: (payload: any) => void) {
    if (!this.callbacks.has(topic)) {
      this.callbacks.set(topic, new Set());
    }
    this.callbacks.get(topic)!.add(callback);

    if (this.client.connected) {
      this.createSubscription(topic);
    } else {
      this.activate();
    }
  }

  private createSubscription(topic: string) {
    if (this.subscriptions.has(topic)) return;

    const sub = this.client.subscribe(topic, (message: Message) => {
      const payload = JSON.parse(message.body);
      this.callbacks.get(topic)?.forEach(cb => cb(payload));
    });
    this.subscriptions.set(topic, sub);
  }

  unsubscribe(topic: string, callback: (payload: any) => void) {
    const topicCallbacks = this.callbacks.get(topic);
    if (topicCallbacks) {
      topicCallbacks.delete(callback);
      if (topicCallbacks.size === 0) {
        this.subscriptions.get(topic)?.unsubscribe();
        this.subscriptions.delete(topic);
        this.callbacks.delete(topic);
      }
    }
  }
}

export const socketClient = new SocketClient();
