'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { HeadphonesIcon, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { contactService } from '@/services/contactService';

const ISSUE_TYPES = [
  { value: 'Account Issue', label: 'Account Issue' },
  { value: 'Payment Issue', label: 'Payment Issue' },
  { value: 'Technical Problem', label: 'Technical Problem' },
  { value: 'Verification Issue', label: 'Verification Issue' },
  { value: 'Other', label: 'Other' },
];

interface ContactSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactSupportDialog({ open, onOpenChange }: ContactSupportDialogProps) {
  const { user } = useAuth();
  const [issueType, setIssueType] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    if (!issueType) { toast.error('Please select an issue type'); return; }
    if (!message.trim() || message.trim().length < 10) { toast.error('Please describe your issue (at least 10 characters)'); return; }
    try {
      setIsSending(true);
      const res = await contactService.submitMessage({
        name: name.trim(),
        email: email.trim(),
        subject: issueType,
        message: message.trim(),
      });
      if (res.success) {
        toast.success('Support request sent. Our team will respond within 24 hours.');
        setIssueType('');
        setMessage('');
        if (!user) { setName(''); setEmail(''); }
        onOpenChange(false);
      } else {
        toast.error(res.message || 'Failed to send. Please try again.');
      }
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeadphonesIcon className="w-5 h-5 text-primary" />
            Contact Support
          </DialogTitle>
          <DialogDescription>
            Describe your issue and our team will get back to you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={!!user?.fullName}
              />
            </div>
            <div className="space-y-2">
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={!!user?.email}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Issue Type <span className="text-destructive">*</span></Label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Message <span className="text-destructive">*</span></Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your issue in detail..."
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={isSending} className="gap-2">
            {isSending ? 'Sending...' : (<><Send className="w-4 h-4" /> Send Message</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
