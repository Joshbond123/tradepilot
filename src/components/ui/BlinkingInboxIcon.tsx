
import React from 'react';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlinkingInboxIconProps {
  hasUnread: boolean;
  className?: string;
}

export const BlinkingInboxIcon = ({ hasUnread, className }: BlinkingInboxIconProps) => {
  return (
    <div className="relative">
      <Mail className={cn("h-5 w-5", className)} />
      {hasUnread && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
          <div className="w-full h-full bg-red-500 rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  );
};
