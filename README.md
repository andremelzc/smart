# Smart 🏠

Plataforma moderna de reservas de recintos y espacios, construida con Next.js 15 y Oracle Database. Smart permite a los anfitriones gestionar sus propiedades y a los usuarios encontrar y reservar espacios de manera sencilla.

## 🚀 Características

### Para Usuarios
- 🔍 **Búsqueda avanzada** - Encuentra recintos por ubicación, capacidad y disponibilidad
- 📅 **Gestión de reservas** - Reserva y administra tus espacios
- 👤 **Perfil personalizado** - Gestiona tu información personal y preferencias
- 🗺️ **Mapas interactivos** - Visualiza ubicaciones con Leaflet
- ⭐ **Sistema de reseñas** - Comparte tu experiencia con otros usuarios

### Para Anfitriones
- 🏢 **Gestión de recintos** - Publica y administra tus propiedades
- 📊 **Dashboard analítico** - Visualiza estadísticas y rendimiento
- 💬 **Mensajería** - Comunícate con los huéspedes
- 📈 **Reportes** - Seguimiento de reservas y ganancias
- ⚙️ **Configuración avanzada** - Personaliza la disponibilidad y precios

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Lucide Icons, Custom Components
- **Database**: Oracle Database 21c
- **ORM**: node-oracledb
- **Authentication**: NextAuth.js 4
- **Maps**: Leaflet + React Leaflet
- **Development**: Turbopack, ESLint

## 📁 Estructura del Proyecto

```
smart/
├── src/
│   ├── app/                      # App Router de Next.js
│   │   ├── (main)/              # Rutas públicas principales
│   │   ├── account/             # Gestión de cuenta de usuario
│   │   ├── host/                # Panel de anfitrión
│   │   │   ├── dashboard/       # Dashboard principal
│   │   │   ├── properties/      # Gestión de recintos
│   │   │   ├── bookings/        # Reservas recibidas
│   │   │   └── reviews/         # Reseñas de huéspedes
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/            # Endpoints de autenticación
│   │   │   └── profile/         # Endpoints de perfil
│   │   ├── auth/                # Páginas de autenticación
│   │   └── prototipo/           # Prototipos y demos
│   ├── components/              # Componentes reutilizables
│   │   ├── layout/              # Componentes de layout
│   │   ├── profile/             # Componentes de perfil
│   │   └── ui/                  # Componentes UI base
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useAuth.ts           # Hook de autenticación
│   │   ├── useProfile.ts        # Hook de gestión de perfil
│   │   └── useProfileEditing.ts # Hook de edición de perfil
│   ├── lib/                     # Utilidades y configuración
│   │   └── oracle.ts            # Conexión a Oracle DB
│   ├── services/                # Servicios y lógica de negocio
│   │   ├── auth.service.ts      # Servicio de autenticación
│   │   └── profile.service.ts   # Servicio de perfil
│   ├── types/                   # Definiciones TypeScript
│   └── util/                    # Funciones utilitarias
├── public/                      # Archivos estáticos
├── tailwind.config.ts           # Configuración de Tailwind
├── next.config.ts               # Configuración de Next.js
└── tsconfig.json                # Configuración de TypeScript
```

## 🚦 Rutas Principales

### Públicas
- `/` - Página de inicio con búsqueda
- `/properties` - Lista de recintos disponibles
- `/properties/[slug]` - Detalle de recinto
- `/auth/login` - Inicio de sesión
- `/auth/register` - Registro de usuario

### Protegidas (Usuario)
- `/account/profile` - Perfil público
- `/account/personal-info` - Información personal
- `/account/trips` - Historial de viajes
- `/account/reservas` - Mis reservas

### Protegidas (Anfitrión)
- `/host/dashboard` - Dashboard principal
- `/host/properties` - Gestión de recintos
- `/host/bookings` - Reservas recibidas
- `/host/reviews` - Reseñas
- `/host/messages` - Mensajes

## ⚙️ Setup del Proyecto

### Prerrequisitos

- Node.js 20+ 
- npm o yarn
- Oracle Database 21c (local o remoto)
- Oracle Instant Client (para node-oracledb)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/andremelzc/smart.git
cd smart
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Database
ORACLE_USER=tu_usuario
ORACLE_PASSWORD=tu_password
ORACLE_CONNECTION_STRING=localhost:1521/XEPDB1

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_key_super_segura

# Application
NODE_ENV=development
```

4. **Configurar Oracle Instant Client**

Descarga e instala Oracle Instant Client según tu sistema operativo:
- [Oracle Instant Client Downloads](https://www.oracle.com/database/technologies/instant-client/downloads.html)

En Windows, asegúrate de agregar el directorio al PATH.

5. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📜 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo con Turbopack
npm run build    # Genera el build de producción
npm run start    # Inicia el servidor de producción
npm run lint     # Ejecuta el linter
```

## 🔐 Autenticación

La aplicación utiliza NextAuth.js con Oracle Database como proveedor de credenciales:

- **Registro**: Los usuarios se registran con email y contraseña
- **Login**: Autenticación mediante stored procedures de Oracle
- **Roles**: Sistema de roles (user, host) para permisos diferenciados
- **Sesiones**: Gestión de sesiones con JWT

## 🗄️ Base de Datos

### Stored Procedures Principales

- `PKG_USUARIO.CREAR_USUARIO` - Registro de nuevos usuarios
- `PKG_USUARIO.VALIDAR_CREDENCIALES` - Validación de login
- `PKG_USUARIO.ACTUALIZAR_PERFIL` - Actualización de perfil
- `PKG_USUARIO.ACTUALIZAR_AVATAR` - Actualización de imagen de perfil

### Esquema Principal

- `USUARIO` - Información de usuarios
- `RECINTO` - Propiedades/espacios
- `RESERVA` - Reservas realizadas
- `RESENA` - Reseñas de usuarios
- `MENSAJE` - Sistema de mensajería

## 🎨 Sistema de Diseño

### Paleta de Colores

```css
/* Blues */
--blue-light-50: #e6f2ff
--blue-light-500: #3b82f6
--blue-vivid-500: #2563eb

/* Grays */
--gray-50: #f9fafb
--gray-500: #6b7280
--gray-900: #111827
```

### Layout Optimizado

- **Navbar fijo**: Siempre visible en la parte superior
- **Sidebar fijo**: Navegación accesible sin scroll
- **Contenido scrollable**: Scroll independiente del sidebar
- **Responsive**: Diseño adaptable a todos los dispositivos

## 🚀 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Docker

```bash
# Construir imagen
docker build -t smart-app .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env.local smart-app
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y está bajo desarrollo activo.

## 📞 Soporte

Para preguntas o issues, por favor abre un issue en el repositorio de GitHub.

---

Construido con Next.js y Oracle Database
