# Frontend — Documentación

## Tecnologías

| Paquete | Uso |
|---------|-----|
| React 18 | Librería de UI |
| Vite | Bundler y servidor de desarrollo |
| React Router v6 | Navegación entre páginas |
| Zustand | Estado global |
| Axios | Peticiones HTTP al backend |
| Tailwind CSS | Estilos utilitarios |
| Lucide React | Iconos |
| Sonner | Notificaciones toast |
| react-spinners | Spinners de carga |

---

## Estructura de carpetas

```
frontend/src/
├── App.jsx               # Rutas principales y lógica de autenticación
├── main.jsx              # Punto de entrada, monta BrowserRouter
├── index.css             # Estilos globales y directivas de Tailwind
├── components/
│   ├── layout/
│   │   └── DashboardLayout.jsx   # Sidebar + header + área de contenido
│   └── ui/
│       ├── Button.jsx    # Botón reutilizable con variantes
│       ├── Card.jsx      # Contenedor con sombra y borde
│       ├── Input.jsx     # Campo de texto con label y error
│       ├── Modal.jsx     # Diálogo modal genérico
│       ├── Badge.jsx     # Etiqueta de estado/rol
│       └── Loader.jsx    # Spinner de carga (pantalla completa o inline)
├── pages/
│   ├── LandingPage.jsx   # Página pública de inicio
│   ├── LoginPage.jsx     # Formulario de inicio de sesión
│   ├── RegisterPage.jsx  # Formulario de registro
│   ├── DashboardPage.jsx # Panel con estadísticas
│   ├── CoursesPage.jsx   # CRUD de cursos
│   ├── EnrollmentsPage.jsx # CRUD de inscripciones
│   ├── UsersPage.jsx     # CRUD de usuarios
│   └── GradesPage.jsx    # CRUD de calificaciones
├── services/
│   └── api.js            # Cliente Axios + servicios por entidad
├── store/
│   ├── useAuthStore.js   # Estado de autenticación (persistido)
│   ├── useCourseStore.js # Estado de cursos e inscripciones
│   └── index.js          # Re-exportaciones
└── lib/
    └── utils.js          # Función cn() para combinar clases Tailwind
```

---

## Punto de entrada (`main.jsx`)

Monta la aplicación dentro de `BrowserRouter` con flags de compatibilidad para React Router v7:

```jsx
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
  <App />
</BrowserRouter>
```

---

## Rutas (`App.jsx`)

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | `LandingPage` | Público |
| `/admin` | `LoginPage` | Público |
| `/admin/register` | `RegisterPage` | Público |
| `/login` | Redirige a `/admin` | — |
| `/register` | Redirige a `/admin/register` | — |
| `/app` | `DashboardPage` | 🔒 Autenticado |
| `/app/cursos` | `CoursesPage` | 🔒 Autenticado |
| `/app/inscripciones` | `EnrollmentsPage` | 🔒 Autenticado |
| `/app/usuarios` | `UsersPage` | 🔒 Autenticado |
| `/app/calificaciones` | `GradesPage` | 🔒 Autenticado |
| `*` | Redirige a `/` | — |

**Protección de rutas:** Si el usuario no está autenticado e intenta acceder a `/app/*`, es redirigido a `/login`.

**Splash screen:** Al cargar la app se muestra un `Loader` de 1.8 segundos antes de renderizar las rutas.

---

## Estado global (`store/`)

### `useAuthStore` (persistido en localStorage)

```js
import { useAuthStore } from '../store';

const { user, token, isAuthenticated, login, logout } = useAuthStore();
```

| Campo/Acción | Tipo | Descripción |
|---|---|---|
| `user` | objeto | Datos del usuario (`id, nombre, email, rol`) |
| `token` | string | JWT activo |
| `isAuthenticated` | boolean | Si hay sesión activa |
| `login(user, token)` | función | Guarda sesión en store y localStorage |
| `logout()` | función | Limpia sesión del store y localStorage |

El estado se persiste automáticamente con la clave `auth-storage` usando el middleware `persist` de Zustand.

---

### `useCourseStore`

```js
import { useCourseStore } from '../store';

const { courses, enrollments, loading, setCourses, setEnrollments, setLoading } = useCourseStore();
```

Almacena en memoria los cursos e inscripciones cargados para evitar peticiones repetidas entre componentes.

---

## Cliente HTTP (`services/api.js`)

Instancia de Axios con base URL `http://localhost:3001/api`.

**Interceptor de request:** Agrega automáticamente el token JWT al header:
```
Authorization: Bearer <token>
```

**Interceptor de response:** Si el servidor responde `401`, limpia el token y redirige a `/login`.

### Servicios disponibles

```js
import { authService, cursoService, usuarioService, inscripcionService, calificacionService, anuncioService, categoriaService } from '../services/api';
```

| Servicio | Métodos |
|---------|---------|
| `authService` | `login(data)`, `register(data)` |
| `usuarioService` | `obtenerTodos()`, `crear(data)`, `actualizar(id, data)`, `eliminar(id)` |
| `cursoService` | `obtenerTodos()`, `crear(data)`, `actualizar(id, data)`, `eliminar(id)` |
| `inscripcionService` | `obtenerTodos()`, `crear(data)`, `eliminar(id)` |
| `calificacionService` | `obtenerTodos()`, `crear(data)`, `actualizar(id, data)`, `eliminar(id)` |
| `anuncioService` | `obtenerTodos()`, `crear(data)`, `actualizar(id, data)`, `eliminar(id)` |
| `categoriaService` | `obtenerTodos()`, `crear(data)`, `eliminar(id)` |

Todos los métodos devuelven promesas. Los que listan datos devuelven `{ data: [...] }` con el array ya extraído de la respuesta del backend.

---

## Layout del dashboard (`DashboardLayout.jsx`)

Estructura visual de la zona privada:

```
┌─────────────────────────────────────────┐
│  Sidebar (256px / 64px colapsado)       │
│  ┌──────────────────────────────────┐   │
│  │ Logo + nombre app                │   │
│  │ Navegación (NavLink activo)      │   │
│  │ Avatar + nombre + cerrar sesión  │   │
│  └──────────────────────────────────┘   │
│                                         │
│  Área principal                         │
│  ┌──────────────────────────────────┐   │
│  │ Header (botón toggle + avatar)   │   │
│  │ <Outlet /> ← página activa       │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

- El sidebar se puede colapsar con el botón del header (muestra solo iconos).
- `<Outlet />` renderiza la página activa según la ruta.
- El link activo se resalta con fondo `#eef2ff` y borde `#c7d2fe`.

---

## Páginas

### `LandingPage`
Página pública de presentación. Contiene hero, características y llamada a la acción hacia `/admin`.

### `LoginPage`
Formulario con email y contraseña. Al hacer login exitoso:
1. Llama `authService.login()`.
2. Guarda sesión con `useAuthStore.login(user, token)`.
3. Redirige a `/app`.

### `RegisterPage`
Formulario de registro con nombre, email, contraseña y rol. Solo permite `estudiante` o `profesor` (no `admin`).

### `DashboardPage`
Carga en paralelo cursos, inscripciones y usuarios con `Promise.all`. Muestra:
- 4 tarjetas de estadísticas (cursos, estudiantes, inscripciones, profesores).
- Gráfico de barras con los 5 cursos más populares.
- Lista de actividad reciente (últimas inscripciones).
- 3 métricas adicionales (tasa de inscripción, promedio por curso, cursos sin inscritos).

### `CoursesPage`
CRUD completo de cursos. Permite crear, editar y eliminar cursos con modal de formulario.

### `EnrollmentsPage`
CRUD de inscripciones. Muestra la relación usuario ↔ curso con datos del profesor.

### `UsersPage`
CRUD de usuarios. Permite cambiar nombre, email y rol.

### `GradesPage`
CRUD de calificaciones. Valida que la nota esté entre 0 y 100.

---

## Componentes UI

### `Button`
```jsx
<Button variant="default" size="default" loading={false}>Texto</Button>
```

| Variante | Apariencia |
|---------|-----------|
| `default` | Azul índigo (primario) |
| `destructive` | Rojo (eliminar) |
| `outline` | Borde gris (secundario) |
| `secondary` | Gris claro |
| `ghost` | Sin fondo |
| `success` | Verde |
| `warning` | Ámbar |

Cuando `loading={true}` muestra un spinner y deshabilita el botón.

### `Input`
```jsx
<Input label="Email" error="Campo requerido" {...register('email')} />
```
Incluye label, campo y mensaje de error en rojo.

### `Card`
Contenedor con fondo blanco, borde y sombra sutil.

### `Modal`
Diálogo con overlay oscuro. Acepta `isOpen`, `onClose`, `title` y `children`.

### `Badge`
Etiqueta de color para mostrar roles o estados.

### `Loader`
```jsx
<Loader fullScreen text="Cargando..." />  // pantalla completa
<Loader />                                 // inline
```

---

## Utilidades (`lib/utils.js`)

```js
import { cn } from '../lib/utils';

cn('base-class', condition && 'conditional-class', 'override-class');
```

Combina `clsx` (condicionales) con `tailwind-merge` (elimina clases Tailwind duplicadas/conflictivas).

---

## Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:5173)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```
