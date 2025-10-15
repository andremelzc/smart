# Guía de Autenticación con Google

## Archivos Modificados/Creados

### 1. **TypeScript Types** (`src/types/next-auth.d.ts`)
Extiende los tipos de NextAuth para incluir `user.id` en la sesión y token JWT.

### 2. **Configuración de NextAuth** (`src/app/api/auth/[...nextauth]/route.ts`)
Configuración mejorada con:
- **Callbacks JWT y Session**: Persiste el `user.id` y `accessToken`
- **Estrategia de sesión**: JWT (recomendado para serverless)
- **Duración de sesión**: 30 días con actualización cada 24 horas
- **Debug mode**: Activado en desarrollo
- **Google OAuth**: Con parámetros optimizados (consent, offline access)

### 3. **Hook useAuth** (`src/hooks/useAuth.ts`)
Hook personalizado para acceder fácilmente a la sesión en cualquier componente.

---

## Cómo Usar el Hook `useAuth`

### Ejemplo Básico

```tsx
'use client';

import { useAuth } from '@/src/hooks/useAuth';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <div>Por favor inicia sesión</div>;
  }

  return (
    <div>
      <h1>Bienvenido, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>ID: {user?.id}</p>
      {user?.image && <img src={user.image} alt="Avatar" />}
    </div>
  );
}
```

### Propiedades Disponibles

```tsx
const {
  user,            // Objeto con: id, name, email, image
  isAuthenticated, // true si el usuario está autenticado
  isLoading,       // true mientras se carga la sesión
  session,         // Objeto completo de sesión (incluye expires)
  status,          // 'loading' | 'authenticated' | 'unauthenticated'
} = useAuth();
```

### Ejemplo con Renderizado Condicional

```tsx
'use client';

import { useAuth } from '@/src/hooks/useAuth';
import { GoogleButton } from '@/src/components/features/auth/GoogleButton';
import { signOut } from 'next-auth/react';

export default function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header>
      {isLoading ? (
        <span>...</span>
      ) : isAuthenticated ? (
        <div>
          <span>Hola, {user?.name}</span>
          <button onClick={() => signOut()}>Salir</button>
        </div>
      ) : (
        <GoogleButton />
      )}
    </header>
  );
}
```

### Ejemplo Protegiendo una Página

```tsx
'use client';

import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return null;

  return (
    <div>
      <h1>Dashboard de {user?.name}</h1>
      {/* Tu contenido protegido aquí */}
    </div>
  );
}
```

---

## Variables de Entorno Necesarias

Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
NEXTAUTH_SECRET=genera_uno_con_openssl_rand_-base64_32
NEXTAUTH_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**: 
- Nunca commitees el archivo `.env.local`
- Genera un nuevo `NEXTAUTH_SECRET` con: `openssl rand -base64 32`
- En producción, actualiza `NEXTAUTH_URL` a tu dominio

---

## Acceder a la Sesión desde Server Components

Si necesitas la sesión en un Server Component:

```tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';

export default async function ServerPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>No autenticado</div>;
  }

  return <div>Hola {session.user?.name}</div>;
}
```

---

## Cerrar Sesión

```tsx
import { signOut } from 'next-auth/react';

// En cualquier componente cliente:
<button onClick={() => signOut()}>Cerrar Sesión</button>

// O con callback URL:
<button onClick={() => signOut({ callbackUrl: '/' })}>
  Cerrar Sesión
</button>
```

---

## Testing

Para probar la autenticación:
1. Asegúrate que el servidor está corriendo: `npm run dev`
2. Ve a cualquier página que use el hook `useAuth`
3. Haz clic en el botón de Google
4. Después de autenticar, verás tu información de usuario

---

## Próximos Pasos Opcionales

- Crear un componente `<ProtectedRoute>` reutilizable
- Añadir middleware para proteger rutas automáticamente
- Crear páginas de login y error personalizadas
- Implementar roles y permisos
