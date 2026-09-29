import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-[#ECE7E1] rounded-[8px] ${className}`}
      aria-hidden="true"
    />
  );
};
