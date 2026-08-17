import React from 'react';
import { cn } from '../../utils/cn';

export type BadgeTone = 'neutral' | 'info' | 'accent' | 'success' | 'warn' | 'danger' | 'inverse';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface text-muted border-line',
  info: 'bg-sky-50 text-action border-sky-200',
  accent: 'bg-action text-white border-action',
  success: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
  warn: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
  danger: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  inverse: 'bg-white/10 text-white border-white/20'
};

export function Badge({ children, tone = 'neutral', icon, size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border font-semibold',
        size === 'sm' ? 'px-2.5 py-1 text-[0.75rem]' : 'px-3 py-1.5 text-2xs',
        tones[tone],
        className
      )}>
      
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>);

}