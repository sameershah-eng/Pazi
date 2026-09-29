import React from 'react';

export type BadgeVariant =
  | 'active'
  | 'paused'
  | 'running'
  | 'queued'
  | 'succeeded'
  | 'failed'
  | 'connected'
  | 'disconnected'
  | 'neutral'
  | 'gradient';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const styles: Record<BadgeVariant, { container: string; dot?: string }> = {
    active: {
      container: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
      dot: 'bg-[#10B981]',
    },
    running: {
      container: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
      dot: 'bg-[#3B82F6]',
    },
    succeeded: {
      container: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
      dot: 'bg-[#22C55E]',
    },
    paused: {
      container: 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]',
      dot: 'bg-[#A8A29E]',
    },
    queued: {
      container: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
      dot: 'bg-[#F59E0B]',
    },
    failed: {
      container: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
      dot: 'bg-[#EF4444]',
    },
    connected: {
      container: 'bg-[#F0FDF9] text-[#0FB5A6] border-[#99F6E4]',
      dot: 'bg-[#0FB5A6]',
    },
    disconnected: {
      container: 'bg-[#F5F5F4] text-[#A8A29E] border-[#E7E5E4]',
      dot: 'bg-[#D6D3D1]',
    },
    neutral: {
      container: 'bg-[#FAF8F5] text-[#57534E] border-[#ECE7E1]',
    },
    gradient: {
      container: 'bg-gradient-to-r from-[#FF7A59]/10 via-[#F0467E]/10 to-[#FFB547]/10 text-[#FF7A59] border-[#FF7A59]/25 font-semibold',
      dot: 'bg-[#FF7A59]',
    },
  };

  const current = styles[variant];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full select-none ${sizeClasses} ${current.container} ${className}`}
    >
      {current.dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${current.dot} ${
            pulse || variant === 'running' || variant === 'active' ? 'animate-pulse' : ''
          }`}
        />
      )}
      {children}
    </span>
  );
};
