'use client';

import { useState } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoteType } from '@/lib/types/job';

interface VoteButtonsProps {
  initialUpvotes: number;
  initialDownvotes?: number;
  initialUserVote?: VoteType | null;
  onVote: (type: VoteType) => Promise<void>;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VoteButtons({
  initialUpvotes,
  initialDownvotes = 0,
  initialUserVote,
  onVote,
  orientation = 'vertical',
  size = 'md',
  className,
}: VoteButtonsProps) {
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote || null);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [isPending, setIsPending] = useState(false);

  const handleVote = async (type: VoteType) => {
    if (isPending) return;

    // Optimistic UI update
    const previousVote = userVote;
    const newVote = previousVote === type ? null : type;

    // Adjust counts
    let newUp = upvotes;
    let newDown = downvotes;

    // Remove old vote impact
    if (previousVote === 'UPVOTE') newUp--;
    if (previousVote === 'DOWNVOTE') newDown--;

    // Add new vote impact
    if (newVote === 'UPVOTE') newUp++;
    if (newVote === 'DOWNVOTE') newDown++;

    setUserVote(newVote);
    setUpvotes(newUp);
    setDownvotes(newDown);
    setIsPending(true);

    try {
      await onVote(type);
    } catch (error) {
      // Rollback on failure
      setUserVote(previousVote);
      setUpvotes(initialUpvotes);
      setDownvotes(initialDownvotes);
    } finally {
      setIsPending(false);
    }
  };

  const isVertical = orientation === 'vertical';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div
      className={cn(
        'flex items-center gap-1 bg-white/50 backdrop-blur-sm rounded-xl border border-sage/20 p-1',
        isVertical ? 'flex-col' : 'flex-row',
        className
      )}
    >
      <button
        onClick={() => handleVote('UPVOTE')}
        disabled={isPending}
        className={cn(
          'p-1.5 rounded-lg transition-all duration-200 hover:bg-teal/10',
          userVote === 'UPVOTE' ? 'text-teal bg-teal/10 scale-110' : 'text-sage-foreground/40'
        )}
      >
        <ArrowBigUp className={cn(iconSize, userVote === 'UPVOTE' && 'fill-current')} />
      </button>
      
      <span className={cn('font-bold min-w-[20px] text-center text-[#2F3E46]', fontSize)}>
        {upvotes - downvotes}
      </span>

      <button
        onClick={() => handleVote('DOWNVOTE')}
        disabled={isPending}
        className={cn(
          'p-1.5 rounded-lg transition-all duration-200 hover:bg-red-500/10',
          userVote === 'DOWNVOTE' ? 'text-red-500 bg-red-500/10 scale-110' : 'text-sage-foreground/40'
        )}
      >
        <ArrowBigDown className={cn(iconSize, userVote === 'DOWNVOTE' && 'fill-current')} />
      </button>
    </div>
  );
}
