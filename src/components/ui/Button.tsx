import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-[10px] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[#FF7A59] focus-visible:outline-offset-2';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 font-semibold',
      md: 'px-4 py-2 text-sm gap-2 font-medium',
      lg: 'px-5 py-2.5 text-base gap-2.5 font-semibold',
    };

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-[#FF7A59] via-[#F0467E] to-[#FFB547] text-white shadow-[0_2px_10px_rgba(255,122,89,0.28)] hover:shadow-[0_4px_16px_rgba(255,122,89,0.38)] hover:-translate-y-0.5 border-none font-semibold',
      secondary:
        'bg-white text-[#1C1917] border border-[#ECE7E1] hover:border-[#D8D2C9] hover:bg-[#F7F4EE] shadow-[0_1px_3px_rgba(28,25,23,0.04)] hover:-translate-y-0.5',
      outline:
        'bg-transparent text-[#1C1917] border border-[#ECE7E1] hover:border-[#1C1917] hover:bg-white',
      ghost:
        'bg-transparent text-[#78716C] hover:text-[#1C1917] hover:bg-[#F2EDE4]',
      danger:
        'bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2] hover:bg-[#FEE2E2] hover:border-[#FCA5A5]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
