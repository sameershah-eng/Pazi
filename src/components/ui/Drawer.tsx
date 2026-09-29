import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'xl',
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

  const widthStyles = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1917]/35 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          role="dialog"
          aria-modal="true"
          className={`w-screen ${widthStyles[width]} bg-white border-l border-[#ECE7E1] shadow-[0_20px_50px_rgba(28,25,23,0.18)] flex flex-col transform transition-transform duration-200 animate-in slide-in-from-right`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#ECE7E1] bg-[#FAF8F5]">
            <div>
              <h2 className="text-base font-bold text-[#1C1917] tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-[#78716C] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#ECE7E1] rounded-[8px] transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
