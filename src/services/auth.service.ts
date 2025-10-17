import { signIn, signOut } from 'next-auth/react';

export const authService = {
  // Inicia la sesión del usuario con Google OAuth.
  signInWithGoogle: (callbackUrl: string = '/') => {
    return signIn('google', { callbackUrl });
  },

  // Inicia la sesión del usuario con credenciales (email y contraseña).
  signInWithCredentials: async (email: string, password: string) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      console.error('Error de credenciales:', result.error);
      // Puedes lanzar un error más amigable para la UI
      throw new Error('Las credenciales son incorrectas o el usuario no existe.');
    }

    return result;
  },

  // Cierra la sesión del usuario.
  signOut: (callbackUrl: string = '/login') => {
    return signOut({ callbackUrl });
  },
};