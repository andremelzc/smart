# 🗄️ Integración de Base de Datos con NextAuth

## Flujo de Autenticación con Base de Datos

Cuando un usuario inicia sesión con Google, ocurre lo siguiente:

```
Usuario → Google OAuth → NextAuth Callback → userService → Base de Datos
```

### 📍 Ubicación de la lógica

La lógica de base de datos está en **2 lugares**:

1. **`src/services/user.service.ts`** - Operaciones de base de datos
2. **`src/app/api/auth/[...nextauth]/route.ts`** - Callbacks de NextAuth que usan el servicio

---

## 🔄 Flujo Completo del Callback JWT

### Paso 1: Usuario hace clic en "Continuar con Google"

```tsx
<GoogleButton /> // Ejecuta signIn('google')
```

### Paso 2: Google autentica y devuelve a NextAuth

NextAuth recibe:
- `account` - Token de acceso de Google
- `profile` - Información del usuario de Google (email, nombre, foto, etc.)

### Paso 3: Se ejecuta el callback `jwt()`

```typescript
async jwt({ token, account, profile }) {
  if (account && profile?.sub && profile?.email) {
    // 1. Buscar si el usuario ya existe
    const existingUser = await userService.findByProviderId(profile.sub);
    
    if (existingUser) {
      // ✅ Usuario existente
      await userService.updateLastLogin(existingUser.id);
      token.isNewUser = false;
    } else {
      // 🆕 Usuario nuevo
      const newUser = await userService.createUser({...});
      token.isNewUser = true;
    }
  }
}
```

### Paso 4: Se ejecuta el callback `session()`

```typescript
async session({ session, token }) {
  session.user.id = token.id; // Exponemos el ID al cliente
  return session;
}
```

### Paso 5: Usuario redirigido a la app

El cliente ahora puede usar:
```tsx
const { user } = useAuth();
console.log(user.id); // ID de tu base de datos
```

---

## 🛠️ Cómo implementar con tu base de datos

### Opción 1: Prisma (Recomendado)

1. **Instalar Prisma:**
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

2. **Definir el schema (`prisma/schema.prisma`):**
```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  image       String?
  createdAt   DateTime @default(now())
  lastLoginAt DateTime @default(now())
  accounts    Account[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}
```

3. **Actualizar `user.service.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userService = {
  async findByProviderId(providerId: string) {
    const account = await prisma.account.findUnique({
      where: { 
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: providerId
        }
      },
      include: { user: true }
    });
    return account?.user || null;
  },

  async createUser(data) {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        image: data.image,
        accounts: {
          create: {
            type: 'oauth',
            provider: data.provider,
            providerAccountId: data.providerId,
          }
        }
      }
    });
  },

  async updateLastLogin(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  },

  // ... resto de métodos
};
```

### Opción 2: MongoDB + Mongoose

```typescript
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  image: String,
  googleId: String,
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export const userService = {
  async findByProviderId(providerId: string) {
    return await User.findOne({ googleId: providerId });
  },

  async createUser(data) {
    return await User.create({
      email: data.email,
      name: data.name,
      image: data.image,
      googleId: data.providerId,
    });
  },
  
  // ... resto de métodos
};
```

### Opción 3: PostgreSQL directo

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const userService = {
  async findByProviderId(providerId: string) {
    const result = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [providerId]
    );
    return result.rows[0] || null;
  },

  async createUser(data) {
    const result = await pool.query(
      'INSERT INTO users (email, name, image, google_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [data.email, data.name, data.image, data.providerId]
    );
    return result.rows[0];
  },
  
  // ... resto de métodos
};
```

---

## 📊 Información disponible del usuario de Google

Cuando el usuario inicia sesión con Google, recibes:

```typescript
profile = {
  sub: "103547991597142817347", // Google ID único
  name: "John Doe",
  email: "john@gmail.com",
  picture: "https://lh3.googleusercontent.com/...",
  email_verified: true,
  locale: "es",
}
```

---

## 🎯 Casos de uso comunes

### 1. Detectar usuario nuevo y mostrar onboarding

```typescript
// En el callback jwt:
if (!existingUser) {
  const newUser = await userService.createUser({...});
  token.isNewUser = true; // Marcamos que es nuevo
}

// En el callback session:
async session({ session, token }) {
  session.user.id = token.id;
  session.user.isNewUser = token.isNewUser; // Exponemos al cliente
  return session;
}

// En tu componente:
const { user, session } = useAuth();
if (session?.user?.isNewUser) {
  router.push('/onboarding');
}
```

### 2. Sincronizar datos de Google con tu DB

```typescript
// Actualizar foto/nombre si cambia en Google:
const profileImage = (profile as any).picture;
if (profile.name !== existingUser.name || profileImage !== existingUser.image) {
  await userService.updateProfile(existingUser.id, {
    name: profile.name,
    image: profileImage,
  });
}
```

### 3. Rastrear último login

```typescript
await userService.updateLastLogin(existingUser.id);

// Luego puedes mostrar en tu dashboard:
"Último acceso: hace 2 horas"
```

### 4. Guardar información adicional

```typescript
async createUser(data) {
  return await prisma.user.create({
    data: {
      ...data,
      // Puedes agregar campos personalizados:
      role: 'user',
      plan: 'free',
      onboardingCompleted: false,
      preferences: {
        create: {
          theme: 'light',
          notifications: true,
        }
      }
    }
  });
}
```

---

## 🐛 Debugging

### Ver logs en consola

Cuando un usuario inicie sesión, verás en la terminal del servidor:

```
🔐 Usuario iniciando sesión con Google
🔍 Buscando usuario por provider ID: 103547991597142817347
✨ Nuevo usuario, creando en DB...
✅ Usuario creado exitosamente: cm2abc123xyz
```

O si es usuario existente:

```
🔐 Usuario iniciando sesión con Google
🔍 Buscando usuario por provider ID: 103547991597142817347
👤 Usuario existente encontrado: john@gmail.com
🔄 Actualizando último login para usuario: cm2abc123xyz
```

### Verificar en el cliente

```tsx
const { user } = useAuth();
console.log('User ID from DB:', user?.id);
console.log('User email:', user?.email);
```

---

## ⚠️ Importante

1. **Los placeholders actuales retornan `null`** - Debes implementar tu base de datos
2. **El código actual solo logea en consola** - No persiste nada todavía
3. **Cambia `user.service.ts`** según tu stack (Prisma, MongoDB, etc.)
4. **Testea con una cuenta de Google de prueba** primero

---

## ✅ Checklist para producción

- [ ] Implementar `userService` con tu base de datos real
- [ ] Configurar conexión a DB (Prisma, MongoDB, etc.)
- [ ] Manejar errores de DB apropiadamente
- [ ] Agregar índices en campos de búsqueda (`email`, `providerId`)
- [ ] Implementar migraciones de DB
- [ ] Testear con múltiples usuarios
- [ ] Agregar logging/monitoring de errores

---

## 🚀 Ejemplo completo con Prisma

Si decides usar Prisma, aquí está el flujo completo:

### 1. Instalar y configurar
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### 2. Schema completo
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql" // o "mysql", "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  image       String?
  createdAt   DateTime @default(now())
  lastLoginAt DateTime @default(now())
  accounts    Account[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}
```

### 3. Migración
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Implementar userService completo
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userService = {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  },

  async findByProviderId(providerId: string) {
    const account = await prisma.account.findUnique({
      where: { 
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: providerId
        }
      },
      include: { user: true }
    });
    return account?.user || null;
  },

  async createUser(data: {
    email: string;
    name: string | null;
    image: string | null;
    providerId: string;
    provider: 'google' | 'credentials';
  }) {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        image: data.image,
        accounts: {
          create: {
            type: 'oauth',
            provider: data.provider,
            providerAccountId: data.providerId,
          }
        }
      }
    });
  },

  async updateLastLogin(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  },

  async updateProfile(userId: string, data: {
    name?: string | null;
    image?: string | null;
  }) {
    await prisma.user.update({
      where: { id: userId },
      data
    });
  },
};
```

### 5. Variable de entorno
```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

¡Y listo! Ya tienes persistencia completa de usuarios.
