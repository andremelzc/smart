import { signIn, signOut } from 'next-auth/react';

export const authService = {
  signInWithGoogle: async (callbackUrl: string = '/') => {
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  },

  signInWithCredentials: async (email: string, password: string, callbackUrl: string = '/') => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  },

  signOut: async (callbackUrl: string = '/login') => {
    try {
      await signOut({ callbackUrl });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  },
};