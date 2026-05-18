// src/components/chat/ChatWindow.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { chatService, ChatMessage } from '@/services/chatService';
import { useAuth } from '@/context/AuthContext';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  conversationId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  onClose: () => void;
  onMessageSent: () => void;
}

export default function ChatWindow({
  conversationId,
  otherUserName,
  otherUserAvatar,
  onClose,
  onMessageSent,
}: ChatWindowProps) {
  const { stompClient } = useNotification();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sending, setSending] = useState(false);

  // Rate Limiting Visual Safeguards
  const [msgCountThisMinute, setMsgCountThisMinute] = useState(0);
  const rateLimitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Load message logs
  const fetchMessages = async (pageToLoad: number, append = false) => {
    if (pageToLoad === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await chatService.getMessages(conversationId, pageToLoad, 20);
      if (response.success && response.data) {
        const newMsgs = response.data.content || [];
        
        // Reverse array because pageable is sorted desc (newest first), but we render oldest to newest
        const sortedNewMsgs = [...newMsgs].reverse();

        if (append) {
          // Prepend historical messages for reverse infinite scroll
          const container = scrollContainerRef.current;
          const prevScrollHeight = container ? container.scrollHeight : 0;

          setMessages((prev) => [...sortedNewMsgs, ...prev]);
          setHasMore(!response.data.last);
          setPage(pageToLoad);

          // Maintain scroll position after DOM update
          setTimeout(() => {
            if (container) {
              container.scrollTop = container.scrollHeight - prevScrollHeight;
            }
          }, 50);
        } else {
          setMessages(sortedNewMsgs);
          setHasMore(!response.data.last);
          setPage(0);
          isInitialLoad.current = true;
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      toast.error('Could not fetch message logs.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMessages(0);
  }, [conversationId]);

  // WebSocket Subscription Guard for Stomp Client
  useEffect(() => {
    if (!stompClient) return;

    let subscription: any = null;

    const subscribe = () => {
      subscription = stompClient.subscribe('/user/queue/chats', (message) => {
        try {
          const payload = JSON.parse(message.body);
          const event = payload.data || payload;
          if (payload.type === 'NEW_CHAT_MESSAGE' && event.conversationId === conversationId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === event.id)) return prev;
              return [...prev, event];
            });
            // Mark conversation read on receipt if we are active
            chatService.getMessages(conversationId, 0, 1).catch(() => {});
            onMessageSent();
            // Scroll to bottom
            setTimeout(scrollToBottom, 50);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket event:', err);
        }
      });
    };

    if (stompClient.connected) {
      subscribe();
    } else {
      const checkInterval = setInterval(() => {
        if (stompClient.connected) {
          subscribe();
          clearInterval(checkInterval);
        }
      }, 500);
      return () => {
        clearInterval(checkInterval);
        if (subscription) subscription.unsubscribe();
      };
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [stompClient, conversationId]);

  // Adjust scroll on initial load
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad.current) {
      scrollToBottom();
      isInitialLoad.current = false;
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // Reverse Scroll Handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasMore && !loadingMore && !loading) {
      fetchMessages(page + 1, true);
    }
  };

  // Send Message Method with rate limit guards
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    if (msgCountThisMinute >= 10) {
      toast.error('Spam alert: maximum 10 messages per minute allowed.');
      return;
    }

    const messageText = input.trim();
    setInput('');
    setSending(true);

    try {
      const response = await chatService.sendMessage(conversationId, messageText);
      if (response.success && response.data) {
        const newMsg = response.data;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);
        onMessageSent();

        // Increment rate limit tracker
        setMsgCountThisMinute((prev) => prev + 1);
        if (!rateLimitTimeoutRef.current) {
          rateLimitTimeoutRef.current = setTimeout(() => {
            setMsgCountThisMinute(0);
            rateLimitTimeoutRef.current = null;
          }, 60000);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send message.');
      setInput(messageText); // Restore input on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={otherUserAvatar || undefined} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold">
              {otherUserName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-black text-foreground">{otherUserName}</h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" /> Active Connection
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Message Feed */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-6 space-y-4 scrollbar-thin scrollbar-thumb-border scroll-smooth bg-muted/10"
      >
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Fetching encrypted logs...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center border border-border">
              <Send className="h-5 w-5 text-sky-500" />
            </div>
            <h4 className="text-sm font-black text-foreground">Secure Vault Established</h4>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              Say hello! Your connection is fully authorized and ready for live transmission.
            </p>
          </div>
        ) : (
          (() => {
            const uniqueMsgs = Array.from(
              new Map(messages.map((msg) => [msg.id, msg])).values()
            );
            return uniqueMsgs.map((msg, index) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn('flex flex-col max-w-[75%]', isMe ? 'ml-auto items-end' : 'mr-auto items-start')}
                >
                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed transition-all shadow-sm',
                      isMe
                        ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white rounded-br-none shadow-blue-500/10'
                        : 'bg-muted text-foreground rounded-bl-none border border-border shadow-sm'
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-bold mt-1.5 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            });
          })()
        )}
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSend} className="p-4 bg-card border-t border-border space-y-2">
        {msgCountThisMinute >= 8 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
            <AlertCircle className="h-3.5 w-3.5" /> Rate Limit Warning ({10 - msgCountThisMinute} left)
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a secure message..."
            className="flex-1 bg-background border-input focus-visible:ring-sky-500 text-foreground placeholder-muted-foreground h-11 rounded-xl shadow-inner text-sm font-medium"
            disabled={sending}
            maxLength={2000}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/20 transition-all shrink-0 active:scale-95 border-none"
            disabled={sending || !input.trim()}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4 text-white" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
