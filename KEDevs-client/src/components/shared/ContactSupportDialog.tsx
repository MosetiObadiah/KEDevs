'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { HeadphonesIcon, Send } from 'lucide-react';

const ISSUE_TYPES = [
  { value: 'account', label: 'Account Issue' },
  { value: 'payment', label: 'Payment Issue' },
  { value: 'technical', label: 'Technical Problem' },
  { value: 'verification', label: 'Verification Issue' },
  { value: 'other', label: 'Other' },
];

interface ContactSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactSupportDialog({ open, onOpenChange }: ContactSupportDialogProps) {
  const [issueType, setIssueType] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!issueType) { toast.error('Please select an issue type'); return; }
    if (!message.trim() || message.trim().length < 10) { toast.error('Please describe your issue (at least 10 characters)'); return; }
    try {
      setIsSending(true);
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ issueType, message }),
      });
      toast.success('Support request sent. Our team will respond within 24 hours.');
      setIssueType('');
      setMessage('');
      onOpenChange(false);
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
