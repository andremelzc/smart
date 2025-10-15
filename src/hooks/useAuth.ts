'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

interface UseAuthReturn {
  user: Session['user'] | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

/**
 * Custom hook to easily access authentication state
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, isLoading } = useAuth();
 * 
 * if (isLoading) return <LoadingSpinner />;
 * if (!isAuthenticated) return <LoginPrompt />;
 * 
 * return <div>Welcome {user?.name}!</div>;
 * ```
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    isAuthenticated: !!session && status === 'authenticated',
    isLoading: status === 'loading',
    session,
    status,
  };
}
