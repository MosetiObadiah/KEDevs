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

import { PageContainer } from '@/components/layout/PageContainer';

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
         <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <Card className="max-w-md w-full p-8 text-center rounded-2xl border border-slate-100 shadow-sm bg-white">
               <div className="h-16 w-16 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8" />
               </div>
               <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Message Sent</h2>
               <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
                  Thank you for reaching out. Your inquiry has been logged, and our team will respond within <span className="text-primary font-semibold">1–2 business days</span>.
               </p>
               <Button className="w-full rounded-xl h-11 font-semibold text-xs shadow-none animate-none" onClick={() => setSubmitted(false)}>
                  Send Another Message
               </Button>
            </Card>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-muted/30 pt-8 pb-12 animate-in fade-in duration-300">
         <PageContainer className="max-w-5xl px-4 md:px-8">
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Us</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
               {/* Contact Form */}
               <div className="lg:col-span-7">
                  <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 md:p-8 flex flex-col w-full">
                     <CardContent className="p-0">
                        <div className="flex items-center gap-3 mb-8">
                           <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                              <MessageSquare className="h-5 w-5" />
                           </div>
                           <div>
                              <h2 className="text-lg font-bold text-slate-900">Send Message</h2>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Fill out the form below</p>
                           </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Your Name</p>
                                 <Input
                                    placeholder="John Doe"
                                    className="h-11 rounded-xl bg-slate-50/50 border-slate-200/50 font-medium px-4 text-xs focus-visible:ring-primary/20"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</p>
                                 <Input
                                    placeholder="john@company.com"
                                    type="email"
                                    className="h-11 rounded-xl bg-slate-50/50 border-slate-200/50 px-4 font-medium text-xs focus-visible:ring-primary/20"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                 />
                              </div>
                           </div>

                           <div className="space-y-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Subject</p>
                              <Select
                                 value={formData.subject}
                                 onValueChange={(val) => setFormData({ ...formData, subject: val })}
                              >
                                 <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 border-slate-200/50 px-4 font-medium text-xs focus:ring-primary/20">
                                    <SelectValue placeholder="Select a subject" />
                                 </SelectTrigger>
                                 <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    <SelectItem value="GENERAL" className="text-xs">General Inquiry</SelectItem>
                                    <SelectItem value="PARTNERSHIP" className="text-xs">Partnership</SelectItem>
                                    <SelectItem value="SUPPORT" className="text-xs">Support / Bug Report</SelectItem>
                                    <SelectItem value="PRESS" className="text-xs">Press / Media</SelectItem>
                                    <SelectItem value="CAREERS" className="text-xs">Careers</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>

                           <div className="space-y-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Message</p>
                              <Textarea
                                 placeholder="How can we help you?"
                                 className="min-h-[140px] rounded-xl bg-slate-50/50 border-slate-200/50 p-4 font-medium text-xs leading-relaxed focus-visible:ring-primary/20"
                                 value={formData.message}
                                 onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                 required
                              />
                           </div>

                           <Button
                              disabled={isSubmitting}
                              className="w-full h-11 rounded-xl font-semibold bg-primary hover:bg-primary/95 text-white gap-2 text-xs shadow-none border-none"
                           >
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                              {isSubmitting ? 'Sending...' : 'Send Message'}
                           </Button>
                        </form>
                     </CardContent>
                  </Card>
               </div>

               {/* Contact Info */}
               <div className="lg:col-span-5 space-y-4">
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
                        value: '0700000000',
                        color: 'text-cyan-600',
                        bg: 'bg-cyan-50'
                     },
                     {
                        icon: MapPin,
                        label: 'Location',
                        value: 'Nairobi Garage, 8th Floor, Pinetree Plaza, Ngong Road',
                        color: 'text-azure-500',
                        bg: 'bg-azure-50'
                     }
                  ].map((item, i) => (
                     <Card key={i} className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors shadow-none overflow-hidden group">
                        <CardContent className="p-6 flex items-start gap-4">
                           <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", item.bg)}>
                              <item.icon className={cn("h-5 w-5", item.color)} />
                           </div>
                           <div className="space-y-0.5 min-w-0">
                              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                              <p className="text-xs font-semibold text-slate-900 leading-relaxed truncate">{item.value}</p>
                           </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </div>
         </PageContainer>
      </div>
   );
}