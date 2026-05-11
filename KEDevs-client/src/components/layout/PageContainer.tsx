import React from 'react';
import { LAYOUT } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <div className={cn(LAYOUT.maxWidth, 'mx-auto', LAYOUT.padding, LAYOUT.verticalSpacing, className)}>
      {children}
    </div>
  );
};
