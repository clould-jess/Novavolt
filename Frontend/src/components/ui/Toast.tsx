import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XCircleIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastTone = 'success' | 'error' | 'info' | 'warn';

export interface ToastData {
  id: string;
  tone: ToastTone;
  title: string;
  body?: string;
}

const icons: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2Icon className="h-4 w-4 text-ok" />,
  error: <XCircleIcon className="h-4 w-4 text-bad" />,
  info: <InfoIcon className="h-4 w-4 text-action" />,
  warn: <AlertTriangleIcon className="h-4 w-4 text-warn" />
};

const accents: Record<ToastTone, string> = {
  success: 'border-l-ok',
  error: 'border-l-bad',
  info: 'border-l-action',
  warn: 'border-l-warn'
};

export function Toast({ toast, onDismiss, closeLabel }: {toast: ToastData;onDismiss: () => void;closeLabel: string;}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex w-[min(22rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-l-4 border-line bg-white p-3.5 shadow-card',
        accents[toast.tone]
      )}>
      
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {icons[toast.tone]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.body && <p className="mt-0.5 text-2xs leading-relaxed text-muted">{toast.body}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={closeLabel}
        className="shrink-0 rounded-lg p-1 text-muted transition-colors duration-150 hover:bg-surface hover:text-ink">
        
        <XIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.div>);

}