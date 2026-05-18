// src/components/chat/ChatSidebar.tsx
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { chatService, ConversationSummary } from '@/services/chatService';
import { MessageSquare, Users, Loader2, Calendar } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ChatWindow from './ChatWindow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnreadChange?: (totalUnread: number) => void;
}

export default function ChatSidebar({ open, onOpenChange, onUnreadChange }: ChatSidebarProps) {
  const { stompClient } = useNotification();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const fetchConversations = useCallback(async (isCancelled: () => boolean = () => false) => {
    if (!open) return;
    setLoading(true);
    try {
      const response = await chatService.getConversations();
      if (!isCancelled() && response.success && response.data) {
        setConversations(response.data);
        updateTotalUnread(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  }, [open, onUnreadChange]);

  useEffect(() => {
    let cancelled = false;
    fetchConversations(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [fetchConversations]);

  const updateTotalUnread = (list: ConversationSummary[]) => {
    const total = list.reduce((acc, curr) => acc + curr.unreadCount, 0);
    if (onUnreadChange) {
      onUnreadChange(total);
    }
  };

  // Real-time Sidebar Updates via WS
  useEffect(() => {
    if (!stompClient) return;

    let subscription: any = null;

    const subscribe = () => {
      subscription = stompClient.subscribe('/user/queue/chats', (message) => {
        try {
          const payload = JSON.parse(message.body);
          const event = payload.data || payload;
          if (payload.type === 'NEW_CHAT_MESSAGE') {
            setConversations((prev) => {
              const idx = prev.findIndex((c) => c.id === event.conversationId);
              if (idx === -1) {
                // New connection initialized, refetch completely
                fetchConversations();
                return prev;
              }

              const updated = [...prev];
              const target = { ...updated[idx] };
              target.lastMessage = event.content;
              target.lastMessageAt = event.createdAt;

              // Increment if not actively viewing
              if (activeConversationId !== event.conversationId) {
                target.unreadCount += 1;
              }

              // Pull from index and move to front
              updated.splice(idx, 1);
              const newList = [target, ...updated];
              updateTotalUnread(newList);
              return newList;
            });
          }
        } catch (err) {
          console.error(err);
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
  }, [stompClient, activeConversationId]);

  // Listen for global open-chat-conversation events
  useEffect(() => {
    const handleOpenChat = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { requestId } = customEvent.detail || {};
      if (requestId) {
        onOpenChange(true);
        const found = conversations.find((c) => c.contactRequestId === requestId);
        if (found) {
          handleConversationSelect(found.id);
        } else {
          setLoading(true);
          try {
            const response = await chatService.getConversations();
            if (response.success && response.data) {
              setConversations(response.data);
              updateTotalUnread(response.data);
              const reFound = response.data.find((c) => c.contactRequestId === requestId);
              if (reFound) {
                handleConversationSelect(reFound.id);
              }
            }
          } catch (err) {
            console.error('Failed to resolve conversation for request:', err);
          } finally {
            setLoading(false);
          }
        }
      }
    };

    window.addEventListener('open-chat-conversation', handleOpenChat);
    return () => {
      window.removeEventListener('open-chat-conversation', handleOpenChat);
    };
  }, [conversations, onOpenChange]);

  const handleConversationSelect = (convId: string) => {
    setActiveConversationId(convId);
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          const cleared = { ...c, unreadCount: 0 };
          setTimeout(() => {
            updateTotalUnread(
              prev.map((item) => (item.id === convId ? cleared : item))
            );
          }, 0);
          return cleared;
        }
        return c;
      })
    );
  };

  const handleMessageSentOrReceived = () => {
    // Force silent recount updates on message ticks
    updateTotalUnread(conversations);
  };

  const formatLastMessageTime = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();

    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="p-0 w-full sm:max-w-md bg-slate-950 border-slate-900 shadow-2xl flex flex-col h-full font-sans text-slate-100"
      >
        <SheetHeader className="px-6 py-5 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
          <SheetTitle className="text-lg font-black tracking-tight text-white flex items-center gap-2.5">
            <MessageSquare className="h-5 w-5 text-sky-400" /> Chat
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500 font-medium">
            This is a real time communication channel between you and the other user
          </SheetDescription>
        </SheetHeader>

        {activeConversationId && activeConv ? (
          <div className="flex-1 p-4 h-full bg-slate-950">
            <ChatWindow
              conversationId={activeConversationId}
              otherUserName={activeConv.otherUserName}
              otherUserAvatar={activeConv.otherUserAvatar}
              onClose={() => setActiveConversationId(null)}
              onMessageSent={handleMessageSentOrReceived}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-7 w-7 text-sky-500 animate-spin" />
                <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Syncing connections...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800">
                  <Users className="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-300">No Active Channels</h4>
                  <p className="text-xs text-slate-500 max-w-[220px] mx-auto mt-1 leading-relaxed">
                    Chat becomes authorized immediately after a contact request is accepted by both parties.
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-2.5">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleConversationSelect(conv.id)}
                      className="w-full text-left p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-900/60 hover:border-slate-800/80 transition-all flex gap-3.5 group relative"
                    >
                      <Avatar className="h-11 w-11 border border-slate-800">
                        <AvatarImage src={conv.otherUserAvatar || undefined} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-tr from-sky-400 to-blue-500 text-white font-black text-sm">
                          {conv.otherUserName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="text-xs font-black text-slate-100 group-hover:text-sky-400 transition-colors truncate pr-2">
                            {conv.otherUserName}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-bold tracking-tight">
                            {formatLastMessageTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                          {conv.lastMessage || <span className="text-slate-600 italic">No messages yet</span>}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <Badge className="absolute right-4 bottom-4 h-5 min-w-5 p-1 flex items-center justify-center text-[9px] font-black rounded-full bg-gradient-to-tr from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-500/20 animate-pulse">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
