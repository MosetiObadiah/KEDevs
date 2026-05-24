'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Clock,
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  Reply
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { contactService } from '@/services/contactService';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminSupport() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await contactService.getSupportMessages(page, 20);
      if (res.success && res.data) {
        setMessages(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err: any) {
      setError('Failed to load support messages');
      toast.error('Failed to load support messages');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // When a row is expanded, auto-mark it as read
  const handleExpandRow = async (id: string, isRead: boolean) => {
    const next = expandedRow === id ? null : id;
    setExpandedRow(next);

    if (next && !isRead) {
      try {
        await contactService.markMessageRead(id);
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
      } catch {
        // Silently ignore — not critical
      }
    }
  };

  const handleSendReply = async (msg: any) => {
    const reply = replyTexts[msg.id]?.trim();
    if (!reply || reply.length < 5) {
      toast.error('Please write a reply (at least 5 characters)');
      return;
    }
    setSendingReply(msg.id);
    try {
      const res = await contactService.replyToMessage(msg.id, reply);
      if (res.success) {
        toast.success(`Reply sent to ${msg.email}`);
        setMessages(prev => prev.map(m =>
          m.id === msg.id
            ? { ...m, adminReply: reply, repliedAt: new Date().toISOString(), isRead: true }
            : m
        ));
        setReplyTexts(prev => ({ ...prev, [msg.id]: '' }));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(null);
    }
  };

  const filtered = messages.filter(msg => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      msg.name?.toLowerCase().includes(q) ||
      msg.email?.toLowerCase().includes(q) ||
      msg.subject?.toLowerCase().includes(q) ||
      msg.message?.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
          <MessageSquare className="h-4 w-4" />
          <span>{totalElements.toLocaleString()} messages</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl font-black gap-2 border-slate-100 h-9"
            onClick={fetchMessages}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="rounded-xl-[2.5rem] border-none shadow-2xl shadow-slate-200/40 overflow-hidden bg-white">
        <CardContent className="p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by name, email, subject, or message content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-2xl bg-slate-50 border-none font-medium text-sm"
              />
            </div>
          </div>

          <div className="rounded-xl-[2rem] border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 px-6">Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 px-6">Sender</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 px-6">Subject</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 px-6">Status</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 px-6 text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Loading messages...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-danger-300" />
                        <p className="text-sm font-medium text-danger-400">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchMessages} className="mt-2 rounded-xl font-medium">
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="h-8 w-8 text-slate-200" />
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                          {search ? 'No matching messages' : 'No messages yet'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((msg) => (
                    <React.Fragment key={msg.id}>
                      <TableRow
                        className={cn(
                          "border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer",
                          !msg.isRead && "bg-cyan-50/30"
                        )}
                        onClick={() => handleExpandRow(msg.id, msg.isRead)}
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                            <span className="whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm">{msg.name}</p>
                              <a href={`mailto:${msg.email}`} onClick={e => e.stopPropagation()} className="text-[10px] font-medium text-cyan-600 hover:underline flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {msg.email}
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge className="rounded-xl font-black text-[9px] uppercase tracking-widest border-none px-2 py-0.5 bg-slate-100 text-slate-700">
                            {msg.subject}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {msg.adminReply ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-none flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Replied
                              </Badge>
                            ) : msg.isRead ? (
                              <Badge className="bg-slate-100 text-slate-600 border-none">Read</Badge>
                            ) : (
                              <Badge className="bg-cyan-100 text-cyan-700 border-none">Unread</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100">
                            {expandedRow === msg.id
                              ? <ChevronUp className="h-4 w-4 text-slate-500" />
                              : <ChevronDown className="h-4 w-4 text-slate-500" />}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {expandedRow === msg.id && (
                        <TableRow className="border-slate-50 bg-slate-50/30">
                          <TableCell colSpan={5} className="py-6 px-10">
                            <div className="space-y-5">
                              {/* Original message */}
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Original Message</p>
                                <p className="text-sm font-medium text-slate-700 bg-white border border-slate-100 px-4 py-4 rounded-xl whitespace-pre-wrap leading-relaxed shadow-sm">
                                  {msg.message}
                                </p>
                              </div>

                              {/* Admin reply section */}
                              {msg.adminReply ? (
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Reply Sent — {formatDate(msg.repliedAt)}
                                  </p>
                                  <p className="text-sm font-medium text-slate-700 bg-emerald-50 border border-emerald-100 px-4 py-4 rounded-xl whitespace-pre-wrap leading-relaxed shadow-sm">
                                    {msg.adminReply}
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                    <Reply className="h-3.5 w-3.5" />
                                    Reply to {msg.name}
                                  </p>
                                  <Textarea
                                    placeholder={`Type your reply to ${msg.name}...`}
                                    className="min-h-[120px] rounded-xl border-slate-200 font-medium text-sm resize-none focus-visible:ring-primary/20"
                                    value={replyTexts[msg.id] || ''}
                                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [msg.id]: e.target.value }))}
                                    maxLength={2000}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-slate-400 font-medium">
                                      {(replyTexts[msg.id] || '').length}/2000
                                    </p>
                                    <Button
                                      size="sm"
                                      className="rounded-xl font-black gap-2 px-6"
                                      onClick={(e) => { e.stopPropagation(); handleSendReply(msg); }}
                                      disabled={sendingReply === msg.id}
                                    >
                                      {sendingReply === msg.id ? (
                                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</>
                                      ) : (
                                        <><Send className="h-3.5 w-3.5" /> Send Reply</>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
              {filtered.length} of {totalElements.toLocaleString()} entries shown
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl border-slate-100"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium text-slate-500 px-2">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl border-slate-100"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
