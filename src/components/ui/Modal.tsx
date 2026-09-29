import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-xs transition-opacity duration-150"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-white rounded-[14px] border border-[#ECE7E1] shadow-[0_12px_40px_rgba(28,25,23,0.14)] z-10 overflow-hidden transform transition-all duration-200 animate-in fade-in zoom-in-95`}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#ECE7E1]">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-[#1C1917] tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-[#78716C] leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F2EC] rounded-[8px] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
