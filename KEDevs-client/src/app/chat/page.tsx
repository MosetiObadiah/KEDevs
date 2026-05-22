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
  Check,
  Plus,
  Phone,
  Paperclip,
  ChevronDown,
  Search,
  CheckCheck,
  Smile,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Helper: get 2-letter initials from name
const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper: map name to specific background color ramps (blue, amber, green)
const getInitialsColors = (name: string) => {
  if (!name) return 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30';
  const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    // Blue ramp
    "bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30",
    // Amber ramp
    "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    // Green ramp
    "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  ];
  return colors[charCodeSum % colors.length];
};

// Helper: dynamic relative elapsed time formatting (e.g. 12m, 2h, 1d)
const getRelativeTime = (isoString: string | null) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Helper: dynamic visual topic tag generator for premium feel
const getConversationTags = (conv: ConversationSummary) => {
  const name = conv.otherUserName.toLowerCase();
  const msg = (conv.lastMessage || '').toLowerCase();
  
  const tags: { text: string; variant: 'question' | 'help' | 'some' | 'bug' | 'followup' | 'request' }[] = [];

  if (msg.includes('?') || msg.includes('how') || msg.includes('why')) {
    tags.push({ text: 'Question', variant: 'question' });
  }
  if (msg.includes('help') || msg.includes('need') || msg.includes('please')) {
    tags.push({ text: 'Help wanted', variant: 'help' });
  }
  if (msg.includes('bug') || msg.includes('error') || msg.includes('issue') || msg.includes('fail')) {
    tags.push({ text: 'Bug', variant: 'bug' });
  }
  if (msg.includes('perfect') || msg.includes('great') || msg.includes('thanks') || msg.includes('thank')) {
    tags.push({ text: 'Follow up', variant: 'followup' });
  }
  
  if (tags.length === 0) {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (hash % 3 === 0) {
      tags.push({ text: 'Question', variant: 'question' });
      tags.push({ text: 'Help wanted', variant: 'help' });
    } else if (hash % 3 === 1) {
      tags.push({ text: 'Some content', variant: 'some' });
    } else {
      tags.push({ text: 'Follow up', variant: 'followup' });
    }
  }

  return tags.slice(0, 2);
};

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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Toggle Block Conversation Option
  const handleToggleBlockConversation = async () => {
    if (!activeConvId) return;
    try {
      const res = await chatService.toggleBlock(activeConvId);
      if (res.success && res.data) {
        const isBlocked = isDeveloper ? res.data.blockedByDeveloper : res.data.blockedByEmployer;
        toast.success(isBlocked ? 'Conversation blocked successfully.' : 'Conversation unblocked.');
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  blockedByDeveloper: res.data.blockedByDeveloper,
                  blockedByEmployer: res.data.blockedByEmployer,
                }
              : c
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to toggle block state.');
    }
  };

  // Delete Conversation Option
  const handleDeleteConversation = async () => {
    if (!activeConvId) return;
    if (!window.confirm('Are you sure you want to delete this chat history? This action is local and cannot be undone.')) return;
    try {
      const res = await chatService.deleteConversation(activeConvId);
      if (res.success) {
        toast.success('Chat deleted successfully.');
        // Remove from local list and reset active conversation selection
        setConversations((prev) => prev.filter((c) => c.id !== activeConvId));
        setActiveConvId(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete chat.');
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

  const amIBlocked = activeConv
    ? isDeveloper
      ? activeConv.blockedByDeveloper
      : activeConv.blockedByEmployer
    : false;

  const areTheyBlocked = activeConv
    ? isDeveloper
      ? activeConv.blockedByEmployer
      : activeConv.blockedByDeveloper
    : false;

  const isBlocked = amIBlocked || areTheyBlocked;

  const isUnlocked = activeConv ? activeConv.developerAccepted && activeConv.employerAccepted : false;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Real-time conversation search filtering
  const filteredConversations = conversations.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.otherUserName.toLowerCase().includes(query) ||
      (c.lastMessage || '').toLowerCase().includes(query)
    );
  });

  // Count total unread chats
  const totalUnreadCount = conversations.reduce((acc, curr) => acc + curr.unreadCount, 0);

  return (
    <div className="min-h-[calc(100vh-112px)] lg:h-[calc(100vh-112px)] lg:overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F19] font-sans w-full flex flex-col justify-center">
      <div className="w-full px-0 sm:px-4 md:px-6 py-2 flex-1 lg:max-h-full flex flex-col lg:overflow-hidden">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-0 sm:gap-4 flex-1 lg:max-h-full lg:overflow-hidden">
          
          {/* Left Panel: Chat Profiles */}
          <div className={cn("flex flex-col h-full lg:max-h-full lg:overflow-hidden", activeConvId ? "hidden md:flex md:col-span-4" : "flex md:col-span-4")}>
            <Card className="flex-1 border-0 sm:border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] flex flex-col overflow-hidden shadow-none sm:shadow-sm rounded-none sm:rounded-2xl lg:max-h-full">
              
              {/* Messages Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                      Messages
                    </h3>
                    <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    {totalUnreadCount > 0 && (
                      <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {totalUnreadCount}
                      </span>
                    )}
                  </div>
                  
                  {/* Plus button to add connection */}
                  <Button 
                    onClick={() => router.push('/developers')}
                    size="icon" 
                    className="h-9 w-9 rounded-full bg-primary hover:bg-primary/95 text-white border-none flex items-center justify-center shrink-0 shadow-sm"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {/* Search bar */}
                <div className="relative bg-[#F4F1EA]/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-1.5 flex items-center h-11">
                  <Search className="h-5 w-5 text-slate-500 ml-2 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full bg-transparent border-none text-base font-semibold text-slate-800 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              {/* Chat Thread List */}
              {loadingConv ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Syncing conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                    <Users className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 dark:text-white">No chats found</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] mx-auto mt-1 leading-relaxed">
                      {searchQuery ? "Try checking spelling or reset query." : "Accept contact requests inside Notifications page."}
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="flex-1 p-2 overflow-y-auto">
                  <div className="space-y-1">
                    {filteredConversations.map((conv) => {
                      const isActive = conv.id === activeConvId;
                      const unlocked = conv.developerAccepted && conv.employerAccepted;

                      return (
                        <button
                          key={conv.id}
                          onClick={() => setActiveConvId(conv.id)}
                          className={cn(
                            "w-full text-left p-3.5 rounded-2xl transition-all flex gap-3.5 relative group border",
                            isActive
                              ? "bg-primary/5 border-primary/20 dark:bg-primary/5 dark:border-primary/20 shadow-sm"
                              : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/20"
                          )}
                        >
                          <div className={cn("h-[40px] w-[40px] rounded-full flex items-center justify-center text-xs font-bold border shrink-0 relative", getInitialsColors(conv.otherUserName))}>
                            {getInitials(conv.otherUserName)}
                            {/* Online status indicator */}
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white dark:border-[#0F172A] bg-emerald-500" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <h4 className={cn(
                                "text-base font-bold truncate pr-1 group-hover:text-primary transition-colors",
                                isActive ? "text-primary dark:text-primary" : "text-slate-900 dark:text-slate-100"
                              )}>
                                {conv.otherUserName}
                              </h4>
                              <span className="text-sm text-slate-400 font-medium shrink-0">
                                {getRelativeTime(conv.lastMessageAt)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center gap-2 mt-0.5">
                              <p className="text-sm text-slate-500 dark:text-slate-400 truncate font-medium flex-1">
                                {conv.lastMessage || <span className="text-slate-400/60 dark:text-slate-500/60 italic">No messages yet</span>}
                              </p>
                              
                              <div className="flex items-center gap-1.5 shrink-0">
                                {conv.unreadCount > 0 && (
                                  <span className="h-[20px] min-w-[20px] px-1 flex items-center justify-center text-xs font-bold rounded-full bg-[#185FA5] text-white">
                                    {conv.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </div>

          {/* Right Panel: Active Chat Viewport */}
          <div className={cn("flex flex-col h-full lg:max-h-full lg:overflow-hidden", activeConvId ? "flex md:col-span-8" : "hidden md:flex md:col-span-8")}>
            {activeConvId && activeConv ? (
              <Card className="flex-1 border-0 sm:border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] flex flex-col overflow-hidden shadow-none sm:shadow-sm rounded-none sm:rounded-2xl lg:max-h-full">
                
                {/* Viewport Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveConvId(null)}
                      className="md:hidden h-10 w-10 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mr-1 shrink-0"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className={cn("h-[40px] w-[40px] rounded-full flex items-center justify-center text-xs font-bold border shrink-0 relative", getInitialsColors(activeConv.otherUserName))}>
                      {getInitials(activeConv.otherUserName)}
                      {/* Online status indicator */}
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white dark:border-[#0F172A] bg-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {activeConv.otherUserName}
                      </h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        Online
                      </p>
                    </div>
                  </div>

                  {/* Header Actions: Call & More */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Voice and video calls coming soon!")}
                      className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2 h-10 font-semibold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <Phone className="h-4 w-4" /> Call
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl flex items-center justify-center shadow-sm"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={handleToggleBlockConversation}>
                          {amIBlocked ? 'Unblock Chat' : 'Block Chat'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          variant="destructive"
                          onClick={handleDeleteConversation}
                        >
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Acceptance Banners (The Double Opt-In Magic!) */}
                {!isUnlocked && (
                  <div className="p-4 shrink-0 border-b border-amber-100 dark:border-amber-900/30 bg-amber-500/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-3 items-start">
                      <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider"> Reciprocal Chat Activation Required</h5>
                        <p className="text-sm text-amber-700 dark:text-amber-500 font-medium leading-relaxed mt-0.5 max-w-lg">
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
                        className="bg-primary text-white hover:bg-primary/95 font-semibold text-sm rounded-xl shadow-md border-none px-4 h-10 shrink-0 flex items-center gap-1.5"
                      >
                        Accept & Start Chat
                      </Button>
                    )}
                  </div>
                )}

                {/* Message Log Viewport (Grouped by consecutive senders) */}
                <div className="flex-1 overflow-hidden relative p-4 flex flex-col bg-white dark:bg-[#0F172A]">
                  {loadingMessages ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="h-7 w-7 text-primary animate-spin" />
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Retrieving logs...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-slate-400">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-950 dark:text-white">No Messages Sent Yet</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Start typing to kick off your reciprocal dialogue.</p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea ref={scrollAreaRef} className="flex-1 pr-2">
                      <div className="flex flex-col gap-5 py-4">
                        {(() => {
                          const uniqueMessages = Array.from(
                            new Map(messages.map((msg) => [msg.id, msg])).values()
                          );
                          const orderedMessages = [...uniqueMessages].reverse();

                          // Group consecutive messages by sender
                          interface MessageGroup {
                            senderId: string;
                            senderName: string;
                            avatar: string | null;
                            messages: ChatMessage[];
                            isMe: boolean;
                          }

                          const groups: MessageGroup[] = [];
                          let currentGroup: MessageGroup | null = null;

                          orderedMessages.forEach((msg) => {
                            const isMe = msg.senderId === user?.id;
                            const senderAvatar = isMe 
                              ? (user?.avatar || user?.avatarUrl || null) 
                              : (activeConv.otherUserAvatar || null);

                            if (currentGroup && currentGroup.senderId === msg.senderId) {
                              currentGroup.messages.push(msg);
                            } else {
                              currentGroup = {
                                senderId: msg.senderId,
                                senderName: msg.senderName,
                                avatar: senderAvatar,
                                messages: [msg],
                                isMe,
                              };
                              groups.push(currentGroup);
                            }
                          });

                          return groups.map((group, groupIdx) => {
                            return (
                              <div
                                key={groupIdx}
                                className={cn(
                                  "flex gap-3.5 items-start w-full",
                                  group.isMe ? "justify-end" : "justify-start"
                                )}
                              >
                                {/* Incoming Avatar (on the left) */}
                                {!group.isMe && (
                                  <div className={cn("h-[40px] w-[40px] rounded-full flex items-center justify-center text-xs font-bold border shrink-0 relative mt-0.5", getInitialsColors(group.senderName))}>
                                    {getInitials(group.senderName)}
                                  </div>
                                )}

                                {/* Message bubbles column */}
                                <div
                                  className={cn(
                                    "flex flex-col gap-2 max-w-[70%]",
                                    group.isMe ? "items-end" : "items-start"
                                  )}
                                >
                                  {group.messages.map((msg) => {
                                    return (
                                      <div key={msg.id} className={cn("flex flex-col gap-1 w-full", group.isMe ? "items-end" : "items-start")}>
                                        <div
                                          className={cn(
                                            "rounded-2xl px-4 py-2.5 text-base md:text-lg font-medium leading-relaxed shadow-sm relative",
                                            group.isMe
                                              ? "bg-[#185FA5] text-white rounded-br-none"
                                              : "bg-white dark:bg-[#0F172A] border-[0.5px] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none"
                                          )}
                                        >
                                          <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold px-1">
                                          {formatTime(msg.createdAt)}{group.isMe && " · Delivered"}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Outgoing Avatar (on the right) */}
                                {group.isMe && (
                                  <div className={cn("h-[40px] w-[40px] rounded-full flex items-center justify-center text-xs font-bold border shrink-0 relative mt-0.5", getInitialsColors(user?.fullName || "Me"))}>
                                    {getInitials(user?.fullName || "Me")}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                {/* Input Text Form (Single integrated pill-shaped row) */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] shrink-0 flex flex-col items-center gap-1.5">
                  <form onSubmit={handleSendMessage} className="w-full">
                    <div className="flex items-center gap-2 bg-[#F4F1EA]/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl px-2 py-1.5 h-13">
                      {/* Attachment Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => toast.success("Attachments feature coming soon!")}
                        className="h-11 w-11 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full shrink-0"
                      >
                        <Paperclip className="h-6 w-6" />
                      </Button>

                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={
                          isBlocked
                            ? amIBlocked
                              ? "You have blocked this conversation. Unblock to type..."
                              : "This conversation is blocked."
                            : !isUnlocked 
                            ? "Reciprocal activation required to begin typing..." 
                            : "Type a message..."
                        }
                        disabled={!isUnlocked || isBlocked || sending}
                        className="flex-1 bg-transparent border-none text-base text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 disabled:cursor-not-allowed px-1"
                      />

                      {/* Emoji Icon */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => toast.success("Emojis coming soon!")}
                        disabled={isBlocked}
                        className="h-11 w-11 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full shrink-0"
                      >
                        <Smile className="h-6 w-6" />
                      </Button>

                      {/* Send Button */}
                      <Button
                        type="submit"
                        disabled={!isUnlocked || isBlocked || !inputText.trim() || sending}
                        className="h-11 w-11 rounded-xl bg-[#185FA5] hover:bg-[#185FA5]/90 text-white flex items-center justify-center shrink-0 shadow-sm border-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </Button>
                    </div>
                  </form>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs shadow-sm mr-1">Shift</kbd>+<kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs shadow-sm mx-1">Enter</kbd> for new line
                  </p>
                </div>

              </Card>
            ) : (
              <Card className="flex-1 border-0 sm:border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl border-dashed">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                  <MessageSquare className="h-7 w-7 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Secure Chat Hub</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 max-w-[320px] mx-auto mt-1 leading-relaxed font-medium font-sans">
                    Select a conversation profile from the left list to begin messaging.
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
