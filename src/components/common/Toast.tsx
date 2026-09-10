import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { fadeDown } from '../../animations/variants';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map(toast => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
            info: <Info className="w-5 h-5 text-blue-600 shrink-0" />
          };

          const borderColors = {
            success: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
            warning: 'border-amber-200 bg-amber-50/90 text-amber-950',
            error: 'border-rose-200 bg-rose-50/90 text-rose-950',
            info: 'border-blue-200 bg-blue-50/90 text-blue-950'
          };

          return (
            <motion.div
              key={toast.id}
              initial={fadeDown.initial}
              animate={fadeDown.animate}
              exit={fadeDown.exit}
              transition={fadeDown.transition}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${borderColors[toast.type]}`}
            >
              {icons[toast.type]}
              <div className="flex-1 text-sm">
                <div className="font-semibold">{toast.title}</div>
                {toast.message && <div className="text-xs opacity-90 mt-0.5">{toast.message}</div>}
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-gray-400 hover:text-gray-700 p-0.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
