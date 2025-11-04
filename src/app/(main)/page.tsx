'use client';

import Image from 'next/image';
import { GoogleButton } from '@/src/components/features/auth/GoogleButton';
import { useAuth } from '@/src/hooks/useAuth';
import { signOut } from 'next-auth/react';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center py-32">
        <div className="animate-pulse text-2xl">Cargando...</div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-8 py-32">
      <h1 className="text-5xl font-bold">
        Welcome to <a href="https://nextjs.org" className="text-blue-light-500 hover:underline">Next.js!</a>
      </h1>
      
      {isAuthenticated ? (
        <div className="mt-8 flex flex-col items-center gap-6 rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
          <div className="text-center">
            {user?.image && (
              <Image 
                src={user.image} 
                alt={user.name || 'User'} 
                width={80}
                height={80}
                className="mx-auto mb-4 h-20 w-20 rounded-full object-cover"
              />
            )}
            <h2 className="text-2xl font-semibold">¡Hola, {user?.name}! 👋</h2>
            <p className="mt-2 text-gray-600">{user?.email}</p>
            <p className="mt-1 text-sm text-gray-400">ID: {user?.id}</p>
          </div>
          
          <button
            onClick={() => signOut()}
            className="rounded-md bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-4 w-full px-4">
          <p className="text-lg text-gray-600 text-center break-words w-full">
            Inicia sesión para continuar con el prototipo
          </p>
          <GoogleButton size="lg" />
        </div>
      )}

      <p className="mt-8 text-sm text-gray-500">
        Get started by editing <code className="font-mono bg-gray-100 px-2 py-1 rounded">src/app/page.tsx</code>
      </p>
    </section>
  );
}
