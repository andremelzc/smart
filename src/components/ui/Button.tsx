import React from 'react';
import { Plus, Download, Share2, Settings, LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  disabled?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  children, 
  variant = 'primary', 
  size = 'md',
  iconOnly = false,
  leftIcon,
  rightIcon,
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed leading-none";
  
  const variants: Record<string, string> = {
    primary: `
      bg-[var(--blue-light-500)] text-white
      hover:bg-[var(--blue-light-600)]
      active:bg-[var(--blue-light-700)]
      focus:ring-[var(--blue-light-300)]
    `,
    ghost: `
      border-2 border-[var(--blue-light-500)] text-[var(--blue-light-500)] bg-transparent
      hover:bg-[var(--blue-light-50)] hover:border-[var(--blue-light-600)]
      active:bg-[var(--blue-light-100)] active:border-[var(--blue-light-700)]
      focus:ring-[var(--blue-light-300)]
    `,
    text: `
      text-[var(--blue-light-500)] bg-transparent
      hover:bg-[var(--blue-light-50)]
      active:bg-[var(--blue-light-100)]
      focus:ring-[var(--blue-light-300)]
    `
  };

  const sizes: Record<string, string> = {
    sm: iconOnly ? 'w-8 h-8' : 'px-3 py-1.5 text-sm gap-1.5',
    md: iconOnly ? 'w-10 h-10' : 'px-4 py-2 text-base gap-2',
    lg: iconOnly ? 'w-12 h-12' : 'px-6 py-3 text-lg gap-2.5',
    xl: iconOnly ? 'w-14 h-14' : 'px-8 py-4 text-xl gap-3'
  };

  const borderRadius = iconOnly ? 'rounded-full' : 'rounded-full';

  const iconSizes: Record<string, number> = {
    sm: 14,
    md: 18,
    lg: 20,
    xl: 24
  };

  const IconLeft = leftIcon;
  const IconRight = rightIcon;

  return (
    <button
      ref={ref}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${borderRadius}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {IconLeft && <IconLeft size={iconSizes[size]} />}
      {children}
      {IconRight && <IconRight size={iconSizes[size]} />}
    </button>
  );
});