'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a fallback that uses alert() if context not available
    return {
      showToast: (type: ToastType, title: string, message?: string) => {
        alert(`${title}${message ? ': ' + message : ''}`);
      },
      success: (title: string, message?: string) => alert(`${title}${message ? ': ' + message : ''}`),
      error: (title: string, message?: string) => alert(`Error: ${title}${message ? ': ' + message : ''}`),
      warning: (title: string, message?: string) => alert(`Warning: ${title}${message ? ': ' + message : ''}`),
      info: (title: string, message?: string) => alert(`${title}${message ? ': ' + message : ''}`),
    };
  }
  return context;
}

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-400',
    titleColor: 'text-green-300',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-400',
    titleColor: 'text-red-300',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-300',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast('success', title, message),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => showToast('error', title, message, 6000),
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => showToast('warning', title, message, 5000),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => showToast('info', title, message),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const config = TOAST_CONFIG[toast.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                className={`pointer-events-auto ${config.bgColor} ${config.borderColor} border backdrop-blur-xl rounded-2xl p-4 shadow-xl`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${config.titleColor}`}>{toast.title}</p>
                    {toast.message && (
                      <p className="text-sm text-white/70 mt-0.5">{toast.message}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-white/40 hover:text-white/70 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
