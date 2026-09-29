import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverLift = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-[14px] border border-[#ECE7E1] shadow-[0_2px_8px_rgba(28,25,23,0.03),0_8px_20px_rgba(28,25,23,0.02)] transition-all duration-150 ${
        hoverLift ? 'hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(28,25,23,0.06)] hover:border-[#D8D2C9]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
