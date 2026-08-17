import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast } from '../components/ui/Toast';
import type { ToastData, ToastTone } from '../components/ui/Toast';
import { useI18n } from './I18nContext';

interface ToastValue {
  showToast: (toast: {tone: ToastTone;title: string;body?: string;}) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: {children: React.ReactNode;}) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { t } = useI18n();

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback<ToastValue['showToast']>(
    ({ tone, title, body }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [...current.slice(-2), { id, tone, title, body }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-2.5">
        <AnimatePresence initial={false}>
          {toasts.map((toast) =>
          <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} closeLabel={t('common.close')} />
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>);

}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}