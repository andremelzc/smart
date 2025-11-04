// components/auth/GoogleButton.tsx
'use client';

import React, { useState } from 'react';
import { authService } from '@/src/services/auth.service';

interface GoogleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  callbackUrl?: string;
}

export const GoogleButton = React.forwardRef<HTMLButtonElement, GoogleButtonProps>(({
  children = 'Continuar con Google',
  variant = 'light',
  size = 'md',
  callbackUrl = '/',
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authService.signInWithGoogle(callbackUrl);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md leading-none";

  const variants: Record<string, string> = {
    light: `
      bg-white text-[#3c4043] border border-[#dadce0]
      hover:bg-[#f8f9fa] hover:border-[#d2e3fc] hover:shadow-sm
      active:bg-[#f1f3f4] active:border-[#d2e3fc]
      focus:ring-[#4285f4]/20
      shadow-sm
    `,
    dark: `
      bg-[#4285f4] text-white border border-transparent
      hover:bg-[#3b78e7] hover:shadow-md
      active:bg-[#3367d6]
      focus:ring-[#4285f4]/40
      shadow-sm
    `
  };

  const sizes: Record<string, string> = {
    sm: 'h-9 px-3 text-sm gap-2',
    md: 'h-10 px-4 text-base gap-3',
    lg: 'h-12 px-6 text-lg gap-3'
  };

  const logoSizes: Record<string, number> = {
    sm: 16,
    md: 18,
    lg: 20
  };

  return (
    <button
      ref={ref}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      onClick={handleGoogleSignIn}
      {...props}
    >
      <svg
        width={logoSizes[size]}
        height={logoSizes[size]}
        viewBox="0 0 18 18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" fillRule="evenodd">
          <path
            d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            fill="#EA4335"
          />
        </g>
      </svg>
      <span className="font-medium">
        {isLoading ? 'Cargando...' : children}
      </span>
    </button>
  );
});

GoogleButton.displayName = 'GoogleButton';