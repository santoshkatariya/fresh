import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { fadeIn, scaleIn } from '../../animations/variants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
  id = 'custom-modal'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id={id} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            exit={fadeIn.exit}
            transition={fadeIn.transition}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal box */}
          <motion.div
            initial={scaleIn.initial}
            animate={scaleIn.animate}
            exit={scaleIn.exit}
            transition={scaleIn.transition}
            className={`relative w-full ${maxWidths[maxWidth]} bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 my-8 text-stone-900`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-200 bg-stone-50/80">
                <h3 className="text-lg font-extrabold text-stone-900 tracking-tight">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

