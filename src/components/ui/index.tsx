/**
 * Shared UI Components for Kheti AI
 * Global Toast, Skeleton, Spinner, and Badge components
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// ─── Toast System ────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-300 shrink-0" />,
  };

  const colors = {
    success: 'bg-emerald-800 border-emerald-700',
    error: 'bg-rose-800 border-rose-700',
    info: 'bg-sky-800 border-sky-700',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Stack */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border text-white text-xs font-semibold max-w-sm ${colors[toast.type]}`}
            >
              {icons[toast.type]}
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-white/70 hover:text-white ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

// ─── Loading Spinner ─────────────────────────────────────────────────────────
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'text-emerald-700' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} ${color} animate-spin`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
};

// ─── Skeleton Card ───────────────────────────────────────────────────────────
export const SkeletonCard: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`bg-white border border-stone-200 rounded-xl p-5 animate-pulse ${className}`}>
    <div className="h-3 bg-stone-200 rounded w-1/3 mb-3" />
    <div className="h-5 bg-stone-200 rounded w-3/4 mb-2" />
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-3 bg-stone-100 rounded mb-2 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
    <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between">
      <div className="h-6 bg-stone-100 rounded w-20" />
      <div className="h-6 bg-stone-200 rounded w-24" />
    </div>
  </div>
);

// ─── Badge Component ─────────────────────────────────────────────────────────
type BadgeVariant = 'verified' | 'pending' | 'live' | 'success' | 'warning' | 'info';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  pulse?: boolean;
}

const badgeStyles: Record<BadgeVariant, string> = {
  verified: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  pending:  'bg-amber-50 text-amber-800 border-amber-200',
  live:     'bg-red-50 text-red-800 border-red-300',
  success:  'bg-green-50 text-green-800 border-green-200',
  warning:  'bg-orange-50 text-orange-800 border-orange-200',
  info:     'bg-sky-50 text-sky-800 border-sky-200',
};

export const Badge: React.FC<BadgeProps> = ({ variant, children, pulse = false }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${badgeStyles[variant]} ${pulse ? 'animate-pulse' : ''}`}>
    {children}
  </span>
);

// ─── Confirm Modal ───────────────────────────────────────────────────────────
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel, danger = false
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl"
        >
          <h3 className="text-base font-bold text-stone-900 mb-2">{title}</h3>
          <p className="text-sm text-stone-600 mb-5">{message}</p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs ${
                danger
                  ? 'bg-rose-700 hover:bg-rose-800'
                  : 'bg-emerald-800 hover:bg-emerald-900'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
