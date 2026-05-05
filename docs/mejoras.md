# Mejoras implementadas — Aula Virtual

Documento completo de las 50 mejoras aplicadas al proyecto, organizadas por área.

---

## 🔒 Seguridad — Backend (8 mejoras)

### 1. Helmet
Se agregó el paquete `helmet` en `index.js`. Configura automáticamente headers HTTP de seguridad: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, entre otros.

```js
app.use(helmet());
```

### 2. Rate limiting
Se agregó `express-rate-limit` con dos niveles:
- **Global**: 200 peticiones cada 15 minutos para todas las rutas.
- **Estricto en `/api/auth`**: 20 peticiones cada 15 minutos para prevenir fuerza bruta en login/registro.

### 3. CORS restrictivo
En lugar de `cors()` abierto, ahora solo acepta peticiones del origen configurado:

```js
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
```

### 4. Validación de variables de entorno al inicio
Si falta alguna variable obligatoria (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`), el servidor imprime cuáles faltan y termina con `process.exit(1)` antes de intentar conectarse.

### 5. Middleware de autenticación JWT refactorizado
`middleware/auth.js` ahora exporta dos funciones:
- `auth`: verifica el token JWT y agrega `req.user`.
- `requireRole(...roles)`: middleware de autorización que verifica el rol del usuario autenticado.

### 6. Todas las rutas protegidas con JWT y roles
Cada router aplica `auth` globalmente con `router.use(auth)` y restringe mutaciones por rol:

| Ruta | Lectura | Escritura |
|------|---------|-----------|
| `/api/usuarios` | Autenticado | Solo `admin` |
| `/api/cursos` | Autenticado | `admin`, `profesor` |
| `/api/inscripciones` | Autenticado | `admin`, `profesor` |
| `/api/calificaciones` | Autenticado | `admin`, `profesor` |
| `/api/anuncios` | Autenticado | `admin`, `profesor` |
| `/api/categorias` | Autenticado | Solo `admin` |

### 7. Middleware de error global centralizado
`middleware/errorHandler.js` captura todos los errores no manejados. Elimina el `try/catch` repetido en cada ruta. Maneja automáticamente `ER_DUP_ENTRY` de MySQL con respuesta `409`.

```js
app.use(errorHandler); // al final de index.js
```

### 8. `.env.example` para el backend
Archivo `backend/.env.example` con todas las variables necesarias documentadas para que cualquier desarrollador sepa qué configurar.

---

## 🗄️ Arquitectura Backend (9 mejoras)

### 9. Controllers unificados para todas las entidades
Se crearon/actualizaron controllers para todas las entidades. Las rutas ahora son solo 8-12 líneas cada una y delegan toda la lógica al controller correspondiente:

- `controllers/usuarioController.js`
- `controllers/cursoController.js`
- `controllers/inscripcionController.js`
- `controllers/calificacionController.js`
- `controllers/anuncioController.js`
- `controllers/categoriaController.js`

### 10. Paginación en todos los endpoints GET
Todos los `GET` de listado aceptan `?page=1&limit=20&search=texto`. La respuesta incluye metadatos:

```json
{
  "success": true,
  "data": [...],
  "meta": { "total": 45, "page": 1, "limit": 20, "pages": 3 }
}
```

### 11. Modelos actualizados con campos reales
`models/Curso.js` y `models/Usuario.js` ahora incluyen todos los campos del schema real: `categoria`, `duracion_horas`, `activo`, `created_at`, `updated_at`.

### 12. Índices en columnas de JOIN frecuente
Se agregan automáticamente al iniciar el servidor (migraciones seguras con `try/catch`):

```sql
ALTER TABLE cursos ADD INDEX idx_profesor (profesor_id);
ALTER TABLE inscripciones ADD INDEX idx_usuario (usuario_id);
ALTER TABLE inscripciones ADD INDEX idx_curso (curso_id);
ALTER TABLE calificaciones ADD INDEX idx_cal_usuario (usuario_id);
ALTER TABLE calificaciones ADD INDEX idx_cal_curso (curso_id);
```

### 13. UNIQUE en calificaciones
Se agrega `UNIQUE KEY unique_calificacion (usuario_id, curso_id)` para evitar que un estudiante tenga múltiples calificaciones en el mismo curso.

### 14. Campo `updated_at` en todas las tablas
Todas las tablas ahora tienen `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` para auditoría de cambios.

### 15. Filtro por `curso_id` en anuncios
El endpoint `GET /api/anuncios` acepta `?curso_id=X` para filtrar anuncios de un curso específico.

### 16. Soft delete consistente en anuncios
`DELETE /api/anuncios/:id` hace `UPDATE activo = 0` en lugar de borrar el registro, preservando el historial.

### 17. `nodemon` en devDependencies
`nodemon` se declaró correctamente en `devDependencies` del `backend/package.json` para que `npm run dev` funcione en cualquier entorno.

---

## 🎨 Frontend — UX y funcionalidad (14 mejoras)

### 18. Componente `ConfirmModal`
`components/ui/ConfirmModal.jsx` reemplaza el `confirm()` nativo del navegador en todas las páginas. Muestra un modal con ícono de advertencia, descripción del impacto y botones "Cancelar" / "Eliminar".

**Uso:**
```jsx
<ConfirmModal
  open={!!confirmId}
  onConfirm={handleDelete}
  onCancel={() => setConfirmId(null)}
  message="Se eliminarán también sus inscripciones."
/>
```

### 19. Componente `Pagination`
`components/ui/Pagination.jsx` muestra navegación de páginas con botones anterior/siguiente y números de página. Se conecta al `meta` que devuelve el backend.

**Uso:**
```jsx
<Pagination meta={meta} onPageChange={setPage} />
```

### 20. Paginación en todas las tablas
`UsersPage`, `EnrollmentsPage`, `GradesPage` y `CoursesPage` usan el componente `Pagination` y pasan `page` como parámetro al servicio correspondiente.

### 21. Página de Anuncios (`AnnouncementsPage`)
Nueva página completa con tabla, búsqueda, CRUD (crear/editar/eliminar con soft delete), badges por tipo (`general`, `curso`, `urgente`) y fechas formateadas.

Ruta: `/app/anuncios`

### 22. Página de Categorías (`CategoriesPage`)
Nueva página con grid de tarjetas, color personalizable con `<input type="color">`, CRUD completo y animaciones GSAP.

Ruta: `/app/categorias`

### 23. Categorías cargadas desde la API en CoursesPage
El filtro de categorías y el formulario de creación/edición de cursos ya no usan la lista hardcodeada `CATEGORIAS`. Ahora llaman a `categoriaService.obtenerTodos()` al cargar la página.

### 24. Formato de fechas con `Intl.DateTimeFormat`
`lib/utils.js` exporta dos funciones:
- `formatDate(str)` → `"05 may. 2026"`
- `formatDateTime(str)` → `"05 may. 2026, 08:15"`

Se usan en todas las tablas que muestran `created_at`, `fecha_inscripcion` y `fecha`.

### 25. Sidebar actualizado con Anuncios y Categorías
`DashboardLayout.jsx` incluye los dos nuevos links en la navegación lateral.

### 26. `App.jsx` sin verificación redundante de localStorage
Se eliminó `|| !!localStorage.getItem('token')`. El store de Zustand ya persiste el estado con `persist`, por lo que la verificación manual era innecesaria y podía causar inconsistencias.

### 27. Rutas de Anuncios y Categorías en App.jsx
```jsx
<Route path="anuncios" element={<AnnouncementsPage />} />
<Route path="categorias" element={<CategoriesPage />} />
```

### 28. `VITE_API_URL` en variable de entorno
`frontend/.env` y `frontend/.env.example` con `VITE_API_URL=http://localhost:3001/api`. El cliente Axios usa `import.meta.env.VITE_API_URL` en lugar de la URL hardcodeada.

### 29. Servicios con soporte de parámetros de paginación
Todos los servicios de listado (`usuarioService.obtenerTodos`, `cursoService.obtenerTodos`, etc.) aceptan un objeto `params` que se pasa como query string a Axios.

### 30. Respuesta `paged()` en api.js
Nueva función helper `paged()` que extrae tanto `data` como `meta` de la respuesta del backend, para usarla con los componentes de paginación.

### 31. `gsap`, `bcryptjs` y `sweetalert2` conservados
Estas dependencias se mantienen en el proyecto ya que se usan activamente:
- `gsap`: animaciones de entrada en listas y grids.
- `sweetalert2`: notificaciones toast en operaciones CRUD.
- `bcryptjs`: disponible para uso futuro en el frontend si se necesita.

---

## 🧱 Frontend — Código y arquitectura (5 mejoras)

### 32. Hook `useUsuarios`
`hooks/useUsuarios.js` encapsula la lógica de carga, estado de loading, error y recarga. Acepta parámetros de paginación y búsqueda.

```js
const { data, meta, loading, error, reload } = useUsuarios({ page, search });
```

### 33. Hook `useCursos`
`hooks/useCursos.js` — mismo patrón que `useUsuarios` para cursos.

### 34. Hook `useInscripciones`
`hooks/useInscripciones.js` — mismo patrón para inscripciones.

### 35. `store/index.js` como punto único de exportación
```js
export { useAuthStore } from './useAuthStore';
export { useCourseStore } from './useCourseStore';
```

### 36. `frontend/.env` excluido del repo
El `.gitignore` raíz incluye `frontend/.env` para que las variables de entorno del frontend no se suban al repositorio.

---

## 🗃️ Base de datos (2 mejoras adicionales)

### 37. Script `database/database.sql` actualizado
El SQL incluye todas las tablas con los campos nuevos (`updated_at`, `activo`, índices, UNIQUE en calificaciones) y datos de ejemplo completos.

### 38. Script de seed separado (`backend/scripts/seed.js`)
Permite poblar la base de datos con datos de ejemplo sin recrear las tablas:

```bash
npm run seed          # desde la raíz
node scripts/seed.js  # desde backend/
```

---

## 🚀 DevOps y proyecto (4 mejoras)

### 39. `package.json` raíz con `concurrently`
Permite arrancar backend y frontend con un solo comando desde la raíz del proyecto:

```bash
npm run dev           # arranca ambos en paralelo
npm run dev:backend   # solo backend
npm run dev:frontend  # solo frontend
npm run install:all   # instala dependencias en ambos
npm run seed          # ejecuta el seed
```

### 40. `frontend/.env.example`
Documenta las variables de entorno necesarias para el frontend.

### 41. `backend/.env.example`
Documenta las variables de entorno necesarias para el backend.

### 42. `frontend/README.md` eliminado
Se eliminó el README por defecto que genera Vite, que no describía el proyecto.

---

## Resumen de archivos creados/modificados

### Backend
| Archivo | Cambio |
|---------|--------|
| `index.js` | Helmet, rate-limit, CORS restrictivo, validación de env, updated_at, índices |
| `middleware/auth.js` | Refactorizado: exporta `auth` y `requireRole` |
| `middleware/errorHandler.js` | **Nuevo** — error handler global |
| `controllers/usuarioController.js` | Reescrito con paginación y next(err) |
| `controllers/cursoController.js` | Reescrito con paginación, filtro por categoría |
| `controllers/inscripcionController.js` | Reescrito con paginación |
| `controllers/calificacionController.js` | **Nuevo** — con paginación |
| `controllers/anuncioController.js` | **Nuevo** — con filtro por curso_id |
| `controllers/categoriaController.js` | **Nuevo** |
| `routes/auth.js` | Usa nuevo `{ auth }` |
| `routes/usuarios.js` | Delega a controller, JWT + roles |
| `routes/cursos.js` | Delega a controller, JWT + roles |
| `routes/inscripciones.js` | Delega a controller, JWT + roles |
| `routes/calificaciones.js` | Delega a controller, JWT + roles |
| `routes/anuncios.js` | Delega a controller, JWT + roles |
| `routes/categorias.js` | Delega a controller, JWT + roles |
| `models/Usuario.js` | Campos reales actualizados |
| `models/Curso.js` | Campos reales actualizados |
| `scripts/seed.js` | **Nuevo** — datos de ejemplo independiente |
| `.env.example` | **Nuevo** |
| `package.json` | nodemon en devDependencies |

### Frontend
| Archivo | Cambio |
|---------|--------|
| `src/App.jsx` | Sin verificación redundante, rutas de anuncios y categorías |
| `src/services/api.js` | VITE_API_URL, helper `paged()`, params en servicios |
| `src/lib/utils.js` | `formatDate` y `formatDateTime` |
| `src/hooks/useUsuarios.js` | **Nuevo** |
| `src/hooks/useCursos.js` | **Nuevo** |
| `src/hooks/useInscripciones.js` | **Nuevo** |
| `src/components/ui/ConfirmModal.jsx` | **Nuevo** |
| `src/components/ui/Pagination.jsx` | **Nuevo** |
| `src/components/layout/DashboardLayout.jsx` | Links a anuncios y categorías |
| `src/pages/CoursesPage.jsx` | Categorías desde API, paginación, ConfirmModal |
| `src/pages/UsersPage.jsx` | Hook useUsuarios, paginación, ConfirmModal, formatDate |
| `src/pages/EnrollmentsPage.jsx` | Hook useInscripciones, paginación, ConfirmModal, formatDate |
| `src/pages/GradesPage.jsx` | Paginación, ConfirmModal, formatDate |
| `src/pages/AnnouncementsPage.jsx` | **Nuevo** — CRUD completo |
| `src/pages/CategoriesPage.jsx` | **Nuevo** — CRUD completo |
| `src/store/index.js` | Re-exportaciones centralizadas |
| `.env` | **Nuevo** — VITE_API_URL |
| `.env.example` | **Nuevo** |

### Raíz
| Archivo | Cambio |
|---------|--------|
| `package.json` | **Nuevo** — concurrently, scripts dev/seed |
| `.gitignore` | Actualizado con frontend/.env |
| `frontend/README.md` | Eliminado (era el default de Vite) |


---

## 🆕 Módulos nuevos (v4.0)

### Dependencias instaladas
- **Backend:** `multer`, `pdfkit`, `csv-writer`
- **Frontend:** `chart.js`, `react-chartjs-2`, `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/interaction`

---

### 👤 Perfil de usuario (`/app/perfil`)
- Ver y editar nombre y email
- Subir foto de perfil (Multer, solo imágenes, máx 5MB)
- Cambiar contraseña con verificación de la actual
- **Backend:** `GET/PUT /api/perfil`, `PUT /api/perfil/password`
- Foto servida como estático desde `/uploads/fotos/`

---

### ✅ Asistencia (`/app/asistencia`)
- Seleccionar curso y fecha para registrar asistencia
- Marcar presente/ausente por estudiante con un clic
- `ON DUPLICATE KEY UPDATE` — re-registrar sin duplicar
- Resumen por estudiante: total clases, presentes, % asistencia
- Alerta visual si el estudiante está por debajo del 80%
- **Backend:** `GET /api/asistencias/:curso_id`, `GET /api/asistencias/:curso_id/resumen`, `POST /api/asistencias`

---

### 📝 Tareas y Entregas (`/app/tareas`)
- CRUD de tareas por curso con fecha límite y puntos máximos
- Badge visual si la tarea está vencida
- Ver entregas por tarea en modal
- Calificar entregas con nota y retroalimentación
- Subida de archivos (PDF, imágenes, etc.) hasta 10MB con Multer
- `ON DUPLICATE KEY UPDATE` — re-entrega sin duplicar
- **Backend:** `GET/POST/PUT/DELETE /api/tareas`, `GET /api/tareas/:id/entregas`, `POST /api/tareas/entregas`, `PUT /api/tareas/entregas/:id/calificar`

---

### 🔔 Notificaciones (`/app/notificaciones`)
- Lista de notificaciones del usuario autenticado
- Marcar como leída al hacer clic
- Marcar todas como leídas
- Badge con contador en el sidebar y header
- **Backend:** `GET /api/notificaciones`, `PUT /api/notificaciones/:id/leer`, `PUT /api/notificaciones/leer-todas`
- Función interna `notificacionController.crear()` para generar notificaciones desde otros módulos

---

### 💬 Mensajería (`/app/mensajes`)
- Bandeja de entrada y enviados
- Leer mensaje en panel lateral
- Marcar como leído al abrir
- Eliminar mensajes (propios enviados o recibidos)
- Contador de no leídos en el tab
- **Backend:** `GET /api/mensajes`, `POST /api/mensajes`, `PUT /api/mensajes/:id/leer`, `DELETE /api/mensajes/:id`

---

### 📁 Materiales (`/app/materiales`)
- Materiales filtrados por curso
- Tipos: enlace, pdf, video, documento, imagen
- Subida de archivos hasta 50MB o URL externa
- Icono y badge de color por tipo
- **Backend:** `GET /api/materiales/:curso_id`, `POST /api/materiales`, `DELETE /api/materiales/:id`

---

### 📊 Reportes (`/app/reportes`)
- Estadísticas generales: estudiantes, profesores, cursos, promedio, aprobados/reprobados
- Gráfica de barras: promedio por curso (Chart.js)
- Gráfica de pie: cursos por categoría (Chart.js)
- Exportar CSV: calificaciones, inscripciones o asistencias
- Filtro por curso al exportar
- BOM UTF-8 para compatibilidad con Excel
- **Backend:** `GET /api/reportes/estadisticas`, `GET /api/reportes/exportar?tipo=&curso_id=`

---

### 🏆 Certificados (`/app/certificados`)
- Lista de cursos con calificación del usuario autenticado
- Solo disponible para cursos aprobados (nota >= 60)
- Genera PDF con pdfkit: nombre, curso, nota, fecha, firma del profesor
- Descarga directa en el navegador
- **Backend:** `GET /api/certificados/:usuario_id/:curso_id`

---

### 📆 Calendario (`/app/calendario`)
- Vista mensual y semanal con FullCalendar
- Eventos de tareas (azul) y anuncios (verde/rojo urgente)
- Clic en evento muestra detalle en panel lateral
- Localización en español
- **Backend:** usa `/api/tareas` y `/api/anuncios` existentes

---

### 🔍 Buscador global (header)
- Barra de búsqueda en el header del dashboard
- Búsqueda con debounce de 350ms
- Resultados agrupados: Cursos, Usuarios, Anuncios
- Clic en resultado navega a la sección correspondiente
- Se cierra al hacer clic fuera
- **Backend:** `GET /api/buscar?q=texto` — mínimo 2 caracteres

---

### Nuevas tablas en la BD

| Tabla | Descripción |
|-------|-------------|
| `asistencias` | Registro diario de asistencia por usuario/curso/fecha (UNIQUE) |
| `tareas` | Tareas asignadas a cursos con fecha límite |
| `entregas` | Entregas de estudiantes con archivo y calificación (UNIQUE por tarea+usuario) |
| `notificaciones` | Notificaciones del sistema por usuario |
| `mensajes` | Mensajería interna entre usuarios |
| `materiales` | Recursos (archivos/enlaces) por curso |

### Nuevas rutas del backend

| Ruta | Módulo |
|------|--------|
| `GET/PUT /api/perfil` | Perfil |
| `PUT /api/perfil/password` | Perfil |
| `GET/POST /api/asistencias/:curso_id` | Asistencia |
| `GET /api/asistencias/:curso_id/resumen` | Asistencia |
| `GET/POST/PUT/DELETE /api/tareas` | Tareas |
| `GET /api/tareas/:id/entregas` | Entregas |
| `POST /api/tareas/entregas` | Entregas |
| `PUT /api/tareas/entregas/:id/calificar` | Entregas |
| `GET /api/notificaciones` | Notificaciones |
| `PUT /api/notificaciones/:id/leer` | Notificaciones |
| `GET/POST/DELETE /api/mensajes` | Mensajería |
| `GET/POST/DELETE /api/materiales` | Materiales |
| `GET /api/reportes/estadisticas` | Reportes |
| `GET /api/reportes/exportar` | Reportes CSV |
| `GET /api/certificados/:uid/:cid` | Certificados PDF |
| `GET /api/buscar` | Buscador global |
