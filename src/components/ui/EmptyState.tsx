import React, { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-[14px] border border-dashed border-[#D8D2C9] ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#ECE7E1] flex items-center justify-center text-[#78716C] mb-3.5">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[#1C1917] tracking-tight">{title}</h3>
      <p className="mt-1 text-xs text-[#78716C] max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
