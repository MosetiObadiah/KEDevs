// src/app/chat/page.tsx
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { chatService, ConversationSummary, ChatMessage } from '@/services/chatService';
import { 
  MessageSquare, 
  Users, 
  Loader2, 
  Send, 
  Clock, 
  User, 
  ShieldCheck, 
  Mail, 
  AlertCircle, 
  ArrowLeft,
  Lock,
  Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

function ChatHubContent() {
  const { user } = useAuth();
  const { stompClient } = useNotification();
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestIdParam = searchParams.get('requestId');

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Active chat viewport states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Check if current user role matches
  const isDeveloper = user?.role === 'DEVELOPER';

  // 1. Fetch conversations initially
  const fetchConversations = async () => {
    setLoadingConv(true);
    try {
      const response = await chatService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
        
        // Handle redirect parameter if passed
        if (requestIdParam) {
          const found = response.data.find((c) => c.contactRequestId === requestIdParam);
          if (found) {
            setActiveConvId(found.id);
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      toast.error('Could not sync chat channels.');
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, requestIdParam]);

  // 2. Fetch messages for active conversation
  const fetchMessages = async (convId: string, pageNum = 0, append = false) => {
    if (pageNum === 0) setLoadingMessages(true);
    try {
      const response = await chatService.getMessages(convId, pageNum, 20);
      if (response.success && response.data) {
        const list = response.data.content || [];
        setMessages((prev) => {
          const merged = append ? [...prev, ...list] : list;
          return Array.from(new Map(merged.map((m) => [m.id, m])).values());
        });
        setHasMore(!response.data.last);
        setPage(pageNum);
        
        // Scroll to bottom on initial load
        if (pageNum === 0) {
          setTimeout(scrollToBottom, 50);
        }
      }
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      toast.error('Could not load chat history.');
    } finally {
      if (pageNum === 0) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId, 0, false);
      // Mark read locally by zeroing count
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConvId ? { ...c, unreadCount: 0 } : c))
      );
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  // Auto-accept invitation if parameter is present
  const autoAcceptParam = searchParams.get('autoAccept');
  useEffect(() => {
    if (activeConvId && autoAcceptParam === 'true' && conversations.length > 0) {
      const conv = conversations.find(c => c.id === activeConvId);
      if (conv) {
        const currentAccepted = isDeveloper ? conv.developerAccepted : conv.employerAccepted;
        if (!currentAccepted) {
          const performAutoAccept = async () => {
            try {
              const res = await chatService.acceptConversation(activeConvId);
              if (res.success && res.data) {
                toast.success('Successfully accepted chat invitation!');
                setConversations(prev =>
                  prev.map(c =>
                    c.id === activeConvId
                      ? {
                          ...c,
                          developerAccepted: res.data.developerAccepted,
                          employerAccepted: res.data.employerAccepted,
                        }
                      : c
                  )
                );
                // Clear URL cleanly
                router.replace('/chat');
              }
            } catch (err) {
              console.error('Auto accept failed:', err);
            }
          };
          performAutoAccept();
        }
      }
    }
  }, [activeConvId, conversations, autoAcceptParam]);

  // 3. Setup STOMP subscriptions
  useEffect(() => {
    if (!stompClient) return;

    let subscription: any = null;

    const subscribe = () => {
      subscription = stompClient.subscribe('/user/queue/chats', (message) => {
        try {
          const payload = JSON.parse(message.body);
          const event = payload.data || payload;

          if (payload.type === 'NEW_CHAT_MESSAGE') {
            // If it belongs to currently active conversation, append it
            if (activeConvId === event.conversationId) {
              setMessages((prev) => {
                if (prev.find((m) => m.id === event.id)) return prev;
                return [event, ...prev];
              });
              setTimeout(scrollToBottom, 50);
            }

            // Update conversation summaries list
            setConversations((prev) => {
              const idx = prev.findIndex((c) => c.id === event.conversationId);
              if (idx === -1) {
                fetchConversations();
                return prev;
              }
              const updated = [...prev];
              const target = { ...updated[idx] };
              target.lastMessage = event.content;
              target.lastMessageAt = event.createdAt;
              if (activeConvId !== event.conversationId) {
                target.unreadCount += 1;
              }
              updated.splice(idx, 1);
              return [target, ...updated];
            });
          } else if (payload.type === 'CHAT_ACTIVATED') {
            // Triggered when both participants have accepted
            setConversations((prev) =>
              prev.map((c) =>
                c.id === event.id
                  ? {
                      ...c,
                      developerAccepted: event.developerAccepted,
                      employerAccepted: event.employerAccepted,
                    }
                  : c
              )
            );
            toast.success(`Chat with ${event.otherUserName} has been fully activated!`);
          }
        } catch (err) {
          console.error('STOMP Event processing error:', err);
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
  }, [stompClient, activeConvId]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // 4. Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || sending) return;

    setSending(true);
    try {
      const response = await chatService.sendMessage(activeConvId, inputText.trim());
      if (response.success && response.data) {
        const newMsg = response.data;
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMsg.id)) return prev;
          return [newMsg, ...prev];
        });
        setInputText('');
        setTimeout(scrollToBottom, 50);

        // Update list preview
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === activeConvId);
          if (idx === -1) return prev;
          const updated = [...prev];
          const target = { ...updated[idx] };
          target.lastMessage = newMsg.content;
          target.lastMessageAt = newMsg.createdAt;
          updated.splice(idx, 1);
          return [target, ...updated];
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to dispatch message.');
    } finally {
      setSending(false);
    }
  };

  // 5. Accept Conversation Option (Opt-In)
  const handleAcceptConversation = async () => {
    if (!activeConvId) return;
    try {
      const res = await chatService.acceptConversation(activeConvId);
      if (res.success && res.data) {
        toast.success('You have accepted the chat request!');
        // Update local list summary state
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  developerAccepted: res.data.developerAccepted,
                  employerAccepted: res.data.employerAccepted,
                }
              : c
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to accept invitation.');
    }
  };

  // 6. Helpers
  const amIAccepted = activeConv
    ? isDeveloper
      ? activeConv.developerAccepted
      : activeConv.employerAccepted
    : false;

  const otherAccepted = activeConv
    ? isDeveloper
      ? activeConv.employerAccepted
      : activeConv.developerAccepted
    : false;

  const isUnlocked = activeConv ? activeConv.developerAccepted && activeConv.employerAccepted : false;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-sans">
      <div className="container mx-auto px-6 pt-8 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          
          {/* Left Panel: Chat Profiles */}
          <div className="md:col-span-4 flex flex-col h-full">
            <Card className="flex-1 border-border/50 bg-background flex flex-col overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border bg-card">
                <h3 className="text-sm font-black tracking-tight text-foreground flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-primary" /> Active Contacts
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                  Authorizations are reciprocal. Double opt-in active channels.
                </p>
              </div>

              {loadingConv ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Syncing profiles...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-background">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">No Connections Yet</h4>
                    <p className="text-[10px] text-muted-foreground max-w-[180px] mx-auto mt-1 leading-relaxed">
                      Accept incoming contact requests inside Notifications page to configure chat channels.
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-1">
                    {conversations.map((conv) => {
                      const isActive = conv.id === activeConvId;
                      const unlocked = conv.developerAccepted && conv.employerAccepted;

                      return (
                        <button
                          key={conv.id}
                          onClick={() => setActiveConvId(conv.id)}
                          className={cn(
                            "w-full text-left p-3 rounded-xl transition-all flex gap-3 relative group border",
                            isActive
                              ? "bg-primary/5 border-primary/20"
                              : "bg-transparent border-transparent hover:bg-muted/30"
                          )}
                        >
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={conv.otherUserAvatar || undefined} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-tr from-sky-400 to-blue-500 text-white font-black text-xs">
                              {conv.otherUserName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <h4 className={cn(
                                "text-xs font-black truncate pr-1 group-hover:text-primary transition-colors",
                                isActive ? "text-primary" : "text-foreground"
                              )}>
                                {conv.otherUserName}
                              </h4>
                              <span className="text-[8px] text-muted-foreground font-bold tracking-tight shrink-0">
                                {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate font-medium">
                              {conv.lastMessage || <span className="text-muted-foreground/60 italic">No messages yet</span>}
                            </p>
                            
                            {/* Opt-in badges */}
                            <div className="flex gap-1.5 mt-1.5">
                              {!unlocked ? (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0 rounded border-none font-bold uppercase tracking-wider gap-0.5">
                                  <Lock className="h-2 w-2" /> Pending Double Opt-in
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0 rounded border-none font-bold uppercase tracking-wider gap-0.5">
                                  <Check className="h-2 w-2" /> Active Connection
                                </Badge>
                              )}
                            </div>
                          </div>

                          {conv.unreadCount > 0 && (
                            <Badge className="absolute right-3 top-3 h-4 min-w-4 p-0.5 flex items-center justify-center text-[8px] font-black rounded-full bg-gradient-to-tr from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-500/20">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </div>

          {/* Right Panel: Active Chat Viewport (Matching jobs/my-posts cards style) */}
          <div className="md:col-span-8 flex flex-col h-full">
            {activeConvId && activeConv ? (
              <Card className="flex-1 border-border/50 bg-background flex flex-col overflow-hidden shadow-sm">
                
                {/* Viewport Header */}
                <div className="p-4 border-b border-border bg-card flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3.5">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={activeConv.otherUserAvatar || undefined} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-tr from-sky-400 to-blue-500 text-white font-black text-xs">
                        {activeConv.otherUserName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-xs font-black text-foreground">
                        {activeConv.otherUserName}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-bold tracking-tight mt-0.5">
                        {isUnlocked ? '🟢 Secure Channel Active' : '🟡 Awaiting Authorizations'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acceptance Banners (The Double Opt-In Magic!) */}
                {!isUnlocked && (
                  <div className="p-4 shrink-0 border-b border-border bg-amber-500/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-3 items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-black text-amber-800 uppercase tracking-wider"> Reciprocal Chat Activation Required</h5>
                        <p className="text-[10px] text-amber-700 font-medium leading-relaxed mt-0.5 max-w-lg">
                          {!amIAccepted 
                            ? `👋 ${activeConv.otherUserName} is ready to start a chat with you! Click Accept & Start Chat below to activate your chat interface.`
                            : `⏳ You have authorized the chat invitation. Waiting for ${activeConv.otherUserName} to also accept and start chat before messages can be exchanged.`
                          }
                        </p>
                      </div>
                    </div>
                    {!amIAccepted && (
                      <Button 
                        onClick={handleAcceptConversation} 
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-md border-none shrink-0"
                      >
                        Accept & Start Chat
                      </Button>
                    )}
                  </div>
                )}

                {/* Message Log Viewport */}
                <div className="flex-1 overflow-hidden relative p-4 flex flex-col bg-background">
                  {loadingMessages ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Retrieving logs...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">No Messages Sent Yet</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Start typing to kick off your reciprocal dialogue.</p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea ref={scrollAreaRef} className="flex-1 pr-2">
                      <div className="flex flex-col-reverse gap-3.5 py-2">
                        {(() => {
                          const uniqueMessages = Array.from(
                            new Map(messages.map((msg) => [msg.id, msg])).values()
                          );
                          return uniqueMessages.map((msg) => {
                            const isMe = msg.senderId === user?.id;
                            return (
                              <div
                                key={msg.id}
                                className={cn(
                                  "flex flex-col max-w-[70%] rounded-2xl p-3 text-xs font-medium leading-relaxed relative",
                                  isMe
                                    ? "self-end bg-primary text-white rounded-br-none shadow-md shadow-primary/5"
                                    : "self-start bg-muted text-foreground rounded-bl-none border border-border/50"
                                )}
                              >
                                {!isMe && (
                                  <span className="text-[8px] font-bold text-muted-foreground mb-1 block uppercase tracking-wider">
                                    {msg.senderName}
                                  </span>
                                )}
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <span className={cn(
                                  "text-[8px] font-semibold block mt-1.5 text-right",
                                  isMe ? "text-white/70" : "text-muted-foreground/70"
                                )}>
                                  {formatTime(msg.createdAt)}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                {/* Input Text Form */}
                <div className="p-4 border-t border-border bg-card shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-2.5">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        !isUnlocked 
                          ? "Reciprocal activation required to begin typing..." 
                          : "Type a secure message..."
                      }
                      disabled={!isUnlocked || sending}
                      className="flex-1 h-11 bg-background border border-border/70 rounded-xl px-4 text-xs font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 disabled:bg-muted/50 disabled:cursor-not-allowed"
                    />
                    <Button
                      type="submit"
                      disabled={!isUnlocked || !inputText.trim() || sending}
                      className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/95 text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/10 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </div>

              </Card>
            ) : (
              <Card className="flex-1 border-border/50 bg-background flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-sm border-dashed">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">Secure Chat Hub</h3>
                  <p className="text-xs text-muted-foreground max-w-[280px] mx-auto mt-1 leading-relaxed">
                    Select a connection profile from the left drawer list to initialize a live reciprocal viewport.
                  </p>
                </div>
              </Card>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ChatHubPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <ChatHubContent />
    </Suspense>
  );
}
