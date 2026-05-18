'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'mint' | 'sage' | 'neutral' | 'amber' | 'red';

interface PillBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const PillBadge = ({
  variant = 'neutral',
  children,
  className,
}: PillBadgeProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'mint':
        return "bg-cyan-50 text-cyan-600 border-emerald-100 hover:bg-cyan-50";
      case 'sage':
        return "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10";
      case 'amber':
        return "bg-azure-50 text-azure-500 border-azure-100 hover:bg-azure-50";
      case 'red':
        return "bg-danger-50 text-danger-500 border-danger-100 hover:bg-danger-50";
      case 'neutral':
      default:
        return "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200";
    }
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        "rounded-2xl font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 border shadow-sm transition-all duration-300",
        getVariantStyles(),
        className
      )}
    >
      {children}
    </Badge>
  );
};
