'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock, 
  Zap,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { contactService } from '@/services/contactService';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject) {
      toast.error('Please select a subject');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await contactService.submitMessage(formData);
      if (response.success) {
        setSubmitted(true);
        toast.success('Message sent. We\'ll respond within 1–2 business days.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-12 text-center rounded-[3rem] border-none shadow-2xl bg-white animate-in zoom-in duration-500">
           <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="h-12 w-12" />
           </div>
           <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Message Sent</h2>
           <p className="text-slate-500 font-medium leading-relaxed mb-10">
              Thank you for reaching out. Your inquiry has been logged, and our team will respond within <span className="text-primary font-bold">1–2 business days</span>.
           </p>
           <Button className="w-full rounded-2xl h-14 font-black shadow-lg shadow-primary/20" onClick={() => setSubmitted(false)}>
              Send Another Message
           </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-8 pb-12 animate-in fade-in duration-700">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
           <Badge variant="outline" className="rounded-lg font-black tracking-widest text-[10px] uppercase bg-primary/10 text-primary border-none px-3 py-1 mb-2">
              Support
           </Badge>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact Us</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           {/* Contact Form */}
           <div className="lg:col-span-7">
              <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                 <CardContent className="p-10 md:p-14">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                          <MessageSquare className="h-6 w-6" />
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-slate-900">Send Message</h2>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fill out the form below</p>
                       </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Your Name</p>
                             <Input 
                                placeholder="John Doe" 
                                className="h-14 rounded-2xl bg-muted/5 border-border/50 font-bold px-6 focus-visible:ring-primary/20" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required 
                             />
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</p>
                             <Input 
                                placeholder="john@company.com" 
                                type="email" 
                                className="h-14 rounded-2xl bg-muted/5 border-border/50 px-6 font-bold focus-visible:ring-primary/20" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required 
                             />
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Subject</p>
                          <Select 
                            value={formData.subject} 
                            onValueChange={(val) => setFormData({...formData, subject: val})}
                          >
                            <SelectTrigger className="h-14 rounded-2xl bg-muted/5 border-border/50 px-6 font-bold focus:ring-primary/20">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50 shadow-xl">
                              <SelectItem value="GENERAL">General Inquiry</SelectItem>
                              <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                              <SelectItem value="SUPPORT">Support / Bug Report</SelectItem>
                              <SelectItem value="PRESS">Press / Media</SelectItem>
                              <SelectItem value="CAREERS">Careers</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>

                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Message</p>
                          <Textarea 
                             placeholder="How can we help you?" 
                             className="min-h-[180px] rounded-[2rem] bg-muted/5 border-border/50 p-6 font-bold leading-relaxed focus-visible:ring-primary/20"
                             value={formData.message}
                             onChange={(e) => setFormData({...formData, message: e.target.value})}
                             required
                          />
                       </div>

                       <Button 
                        disabled={isSubmitting}
                        className="w-full h-16 rounded-[2rem] font-black bg-slate-900 text-white shadow-xl shadow-slate-900/10 gap-3 text-lg group"
                       >
                          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                       </Button>
                    </form>
                 </CardContent>
              </Card>
           </div>

           {/* Contact Info */}
           <div className="lg:col-span-5 space-y-6">
              {[
                 { 
                    icon: Mail, 
                    label: 'Email', 
                    value: 'support@kedevelopers.com', 
                    color: 'text-primary',
                    bg: 'bg-primary/5'
                 },
                 { 
                    icon: Phone, 
                    label: 'Phone', 
                    value: '+254 (0) 700 000 000', 
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-50'
                 },
                 { 
                    icon: MapPin, 
                    label: 'Location', 
                    value: 'Nairobi Garage, 8th Floor, Pinetree Plaza, Ngong Road', 
                    color: 'text-amber-500',
                    bg: 'bg-amber-50'
                 }
              ].map((item, i) => (
                 <Card key={i} className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white group hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-8 flex items-start gap-6">
                       <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", item.bg)}>
                          <item.icon className={cn("h-6 w-6", item.color)} />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                          <p className="text-sm font-black text-slate-900 leading-relaxed">{item.value}</p>
                       </div>
                    </CardContent>
                 </Card>
              ))}

              <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group mt-12">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -mr-16 -mt-16" />
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                       <Clock className="h-5 w-5 text-amber-400" />
                       <h3 className="font-black tracking-tight uppercase text-xs">Hours</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed">
                       Our engineering and support teams maintain high-availability during business hours <span className="text-white font-bold">(08:00 - 18:00 EAT)</span>.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                       <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                             <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800" />
                          ))}
                       </div>
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Monday – Friday</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}