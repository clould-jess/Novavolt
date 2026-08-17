import React from 'react';
import { cn } from '../../utils/cn';

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Always required: icon-only controls need an accessible name. */
  label: string;
  icon: React.ReactNode;
  tone?: 'neutral' | 'action' | 'danger';
  size?: 'sm' | 'md';
}

const tones = {
  neutral: 'text-muted hover:text-ink hover:bg-surface',
  action: 'text-action hover:bg-sky-50',
  danger: 'text-bad hover:bg-red-50'
};

export function IconButton({ label, icon, tone = 'neutral', size = 'md', className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-xl border border-transparent transition-colors duration-200 ease-signature disabled:opacity-50',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        tones[tone],
        className
      )}
      {...rest}>
      
      {icon}
    </button>);

}