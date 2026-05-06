# 🚀 100 Mejoras Pendientes — Aula Virtual

Listado completo de mejoras organizadas por área y prioridad.
`🔴 Alta` `🟡 Media` `🟢 Baja`

---

## 🔐 Seguridad (12 mejoras)

| # | Prioridad | Mejora |
|---|-----------|--------|
| 1 | 🔴 | **Refresh tokens** — Implementar tokens de corta duración (15min) con refresh token de larga duración (7 días) para no exponer el JWT principal. |
| 2 | 🔴 | **Bloqueo de cuenta por intentos fallidos** — Bloquear temporalmente el usuario tras 5 intentos de login fallidos consecutivos (con contador en BD y tiempo de desbloqueo). |
| 3 | 🔴 | **Validación de inputs con Joi o Zod** — Validar todos los campos del body en cada endpoint antes de llegar al controller (tipo, longitud, formato). |
| 4 | 🔴 | **Sanitización contra XSS** — Usar `xss-clean` o `DOMPurify` para limpiar strings antes de guardarlos en BD. |
| 5 | 🔴 | **HTTPS en producción** — Configurar certificado SSL/TLS y forzar redirección de HTTP a HTTPS. |
| 6 | 🔴 | **Contraseñas con requisitos mínimos** — Validar en backend y frontend que la contraseña tenga al menos 8 caracteres, una mayúscula, un número y un símbolo. |
| 7 | 🟡 | **Auditoría de acciones** — Tabla `logs_auditoria` que registre quién hizo qué y cuándo (crear, editar, eliminar usuarios/cursos). |
| 8 | 🟡 | **Protección CSRF** — Agregar token CSRF en formularios sensibles (cambio de contraseña, datos de perfil). |
| 9 | 🟡 | **Expiración de sesión por inactividad** — Cerrar sesión automáticamente tras 30 minutos sin actividad en el frontend. |
| 10 | 🟡 | **Verificación de email al registrarse** — Enviar email de confirmación antes de activar la cuenta. |
| 11 | 🟡 | **Recuperación de contraseña por email** — Flujo completo de "olvidé mi contraseña" con token de un solo uso y expiración de 1 hora. |
| 12 | 🟢 | **2FA opcional** — Autenticación de dos factores con TOTP (Google Authenticator) para cuentas admin. |

---

## 🗄️ Backend — API y Base de Datos (18 mejoras)

| # | Prioridad | Mejora |
|---|-----------|--------|
| 13 | 🔴 | **Transacciones en operaciones críticas** — Usar `BEGIN / COMMIT / ROLLBACK` al crear inscripciones + notificaciones para garantizar consistencia. |
| 14 | 🔴 | **Soft delete en todas las entidades** — Agregar campo `deleted_at` a usuarios, cursos e inscripciones en lugar de borrar físicamente. |
| 15 | 🔴 | **Versionado de la API** — Prefijo `/api/v1/` para poder evolucionar la API sin romper clientes existentes. |
| 16 | 🔴 | **Manejo de errores tipados** — Crear clase `AppError` con código, mensaje y statusCode para respuestas de error consistentes. |
| 17 | 🟡 | **Caché con Redis** — Cachear respuestas de endpoints de solo lectura frecuentes (cursos, categorías) con TTL de 5 minutos. |
| 18 | 🟡 | **Compresión gzip** — Agregar `compression` middleware para reducir el tamaño de las respuestas JSON. |
| 19 | 🟡 | **Paginación con cursor** — Reemplazar paginación por offset con cursor-based pagination para listas grandes. |
| 20 | 🟡 | **Filtros avanzados en cursos** — Filtrar por `activo`, `duracion_horas`, `profesor_id` y rango de fechas desde la query. |
| 21 | 🟡 | **Endpoint de estadísticas por alumno** — `GET /api/alumnos/:id/estadisticas` con promedio, asistencia, tareas entregadas y pendientes. |
| 22 | 🟡 | **Endpoint de progreso de curso** — `GET /api/cursos/:id/progreso` que devuelva % de tareas entregadas y promedio del grupo. |
| 23 | 🟡 | **Exportar reportes en PDF** — Además de CSV, generar reportes completos en PDF con tablas y gráficas usando pdfkit. |
| 24 | 🟡 | **Webhooks para eventos** — Notificar sistemas externos cuando se crea una inscripción o se publica una calificación. |
| 25 | 🟡 | **Backup automático de BD** — Script cron que exporte la base de datos cada 24 horas y guarde los últimos 7 backups. |
| 26 | 🟡 | **Validación de archivos subidos** — Verificar tipo MIME real (no solo extensión) y escanear con antivirus antes de guardar. |
| 27 | 🟢 | **Full-text search en buscador** — Usar `MATCH AGAINST` de MySQL en lugar de `LIKE %texto%` para búsquedas más rápidas y relevantes. |
| 28 | 🟢 | **Historial de calificaciones** — Tabla `calificaciones_historial` que guarde cada cambio de nota con fecha y autor. |
| 29 | 🟢 | **API de estadísticas del dashboard** — Endpoint único `GET /api/dashboard/stats` que devuelva todos los contadores en una sola query. |
| 30 | 🟢 | **Documentación con Swagger/OpenAPI** — Generar documentación interactiva automática de todos los endpoints en `/api/docs`. |

---

## 🎨 Frontend — UX y Diseño (20 mejoras)

| # | Prioridad | Mejora |
|---|-----------|--------|
| 31 | 🔴 | **Modo oscuro** — Implementar dark mode con toggle en el header, persistido en localStorage. |
| 32 | 🔴 | **Diseño responsive completo** — Adaptar todos los dashboards para móvil y tablet (sidebar colapsable, tablas con scroll horizontal). |
| 33 | 🔴 | **Skeleton loaders** — Reemplazar los textos "Cargando..." por skeletons animados que imiten la forma del contenido. |
| 34 | 🔴 | **Manejo global de errores de red** — Mostrar banner o toast cuando el backend no responde, con botón de reintentar. |
| 35 | 🔴 | **Formularios con validación en tiempo real** — Mostrar errores de validación campo por campo mientras el usuario escribe, no solo al enviar. |
| 36 | 🟡 | **Drag & drop para subir archivos** — Zona de drop visual en materiales y tareas en lugar del input file nativo. |
| 37 | 🟡 | **Vista previa de archivos** — Mostrar preview de imágenes y PDFs antes de subirlos y después de descargarlos. |
| 38 | 🟡 | **Tabla con ordenamiento por columna** — Clic en encabezado de columna para ordenar ascendente/descendente. |
| 39 | 🟡 | **Exportar tabla a CSV desde el frontend** — Botón "Exportar" en tablas de usuarios, cursos e inscripciones. |
| 40 | 🟡 | **Breadcrumbs de navegación** — Mostrar ruta actual (ej: Dashboard > Cursos > Editar) para mejorar orientación. |
| 41 | 🟡 | **Tour de bienvenida** — Guía interactiva paso a paso para usuarios nuevos que explique cada sección del dashboard. |
| 42 | 🟡 | **Atajos de teclado** — `Ctrl+K` para abrir el buscador global, `Esc` para cerrar modales. |
| 43 | 🟡 | **Animaciones de transición entre páginas** — Fade in/out suave al navegar entre rutas con Framer Motion o GSAP. |
| 44 | 🟡 | **Indicador de progreso en subida de archivos** — Barra de progreso real durante la subida de materiales y entregas. |
| 45 | 🟡 | **Notificaciones en tiempo real** — Usar WebSockets o Server-Sent Events para recibir notificaciones sin recargar la página. |
| 46 | 🟡 | **Contador de caracteres en textareas** — Mostrar `X / 500 caracteres` en campos de descripción y comentarios. |
| 47 | 🟢 | **Tema de color personalizable** — Permitir al admin cambiar el color primario del sistema desde la configuración. |
| 48 | 🟢 | **Modo compacto de sidebar** — Opción para mostrar solo íconos sin texto en el sidebar para ganar espacio. |
| 49 | 🟢 | **Historial de navegación reciente** — Sección "Visitado recientemente" en el dashboard con los últimos 5 módulos visitados. |
| 50 | 🟢 | **Accesibilidad WCAG 2.1** — Agregar `aria-label`, roles ARIA, navegación por teclado y contraste de colores adecuado. |

---

## 👨‍🎓 Portal Alumno (10 mejoras)

| # | Prioridad | Mejora |
|---|-----------|--------|
| 51 | 🔴 | **Progreso por curso** — Barra de progreso visual que muestre % de tareas entregadas y nota actual en cada curso inscrito. |
| 52 | 🔴 | **Inscripción propia a cursos** — Permitir al alumno inscribirse a cursos disponibles desde su portal sin necesidad del admin. |
| 53 | 🔴 | **Detalle de tarea** — Página de detalle de tarea con descripción completa, archivos adjuntos del profesor y estado de la entrega. |
| 54 | 🟡 | **Historial de entregas** — Ver todas las entregas anteriores con fecha, archivo y retroalimentación del profesor. |
| 55 | 🟡 | **Foro por curso** — Sección de preguntas y respuestas dentro de cada curso donde alumnos y profesor pueden participar. |
| 56 | 🟡 | **Notificación de nueva calificación** — Alerta automática cuando el profesor publica o actualiza una nota. |
| 57 | 🟡 | **Descarga masiva de materiales** — Botón para descargar todos los materiales de un curso en un ZIP. |
| 58 | 🟡 | **Gráfica de rendimiento personal** — Gráfica de línea con la evolución de notas a lo largo del tiempo. |
| 59 | 🟢 | **Compartir certificado** — Generar enlace público o imagen del certificado para compartir en redes sociales. |
| 60 | 🟢 | **Encuesta de satisfacción del curso** — Al completar un curso, mostrar formulario de valoración (1-5 estrellas + comentario). |

---

## 👨‍🏫 Portal Profesor (10 mejoras)

| # | Prioridad | Mejora |
|---|-----------|--------|
| 61 | 🔴 | **Creación de cursos desde el portal** — Formulario completo para que el profesor cree y edite sus propios cursos sin depender del admin. |
| 62 | 🔴 | **Importar calificaciones desde CSV** — Subir un archivo CSV con notas para cargar masivamente en lugar de una por una. |
| 63 | 🔴 | **Estadísticas del curso** — Panel con promedio del grupo, distribución de notas, % de asistencia y tasa de entrega de tareas. |
| 64 | 🟡 | **Plantillas de tareas** — Guardar tareas como plantillas reutilizables para asignarlas a múltiples cursos. |
| 65 | 🟡 | **Comentarios en entregas** — Agregar comentarios de texto enriquecido (negrita, listas) en la retroalimentación de entregas. |
| 66 | 🟡 | **Asistencia masiva** — Marcar todos como presentes con un clic y luego desmarcar los ausentes individualmente. |
| 67 | 🟡 | **Exportar lista de asistencia** — Descargar el registro de asistencia de un curso en formato Excel/CSV. |
| 68 | 🟡 | **Programar anuncios** — Crear anuncios con fecha de publicación futura para que se publiquen automáticamente. |
| 69 | 🟢 | **Banco de preguntas** — Crear preguntas de opción múltiple para generar exámenes automáticos. |
| 70 | 🟢 | **Videollamada integrada** — Botón para iniciar sesión de Jitsi Meet o Google Meet directamente desde el curso. |

---

## 👑 Panel Admin (10 mejoras)

| # | Prioridad | Mejora |
|---|-----------|--------|
| 71 | 🔴 | **Importar usuarios desde CSV** — Subir un CSV con nombre, email, rol y contraseña para crear usuarios masivamente. |
| 72 | 🔴 | **Dashboard con gráficas en tiempo real** — Actualizar automáticamente los contadores del dashboard cada 30 segundos. |
| 73 | 🔴 | **Gestión de permisos granular** — Definir qué acciones puede hacer cada rol (ej: profesor puede o no puede crear cursos). |
| 74 | 🟡 | **Activar/desactivar usuarios** — Toggle para suspender una cuenta sin eliminarla, bloqueando el acceso inmediatamente. |
| 75 | 🟡 | **Asignar múltiples profesores a un curso** — Soporte para co-docencia con tabla `curso_profesores`. |
| 76 | 🟡 | **Configuración global del sistema** — Panel para cambiar nombre de la plataforma, logo, colores y textos desde la UI. |
| 77 | 🟡 | **Reporte de actividad por usuario** — Ver el historial completo de acciones de un usuario específico. |
| 78 | 🟡 | **Gestión de períodos académicos** — Crear semestres/ciclos y asociar cursos a períodos para organizar el historial. |
| 79 | 🟢 | **Papelera de reciclaje** — Sección para ver y restaurar elementos eliminados (soft delete) antes de borrarlos definitivamente. |
| 80 | 🟢 | **Notificaciones masivas** — Enviar una notificación a todos los usuarios, a un rol específico o a los alumnos de un curso. |

---

## ⚡ Performance (8 mejoras)

| # | Prioridad | Mejora |
|---|-----------|--------|
| 81 | 🔴 | **Lazy loading de rutas** — Usar `React.lazy` y `Suspense` para cargar cada página solo cuando se navega a ella. |
| 82 | 🔴 | **Optimización de imágenes** — Comprimir y redimensionar fotos de perfil al subirlas (máx 400x400px, WebP). |
| 83 | 🟡 | **Memoización de componentes** — Usar `React.memo` y `useMemo` en listas y tablas grandes para evitar re-renders innecesarios. |
| 84 | 🟡 | **Virtualización de listas largas** — Usar `react-window` para renderizar solo los elementos visibles en tablas con cientos de filas. |
| 85 | 🟡 | **Connection pooling optimizado** — Ajustar `connectionLimit`, `queueLimit` y `waitForConnections` según la carga esperada. |
| 86 | 🟡 | **Índices adicionales en BD** — Agregar índices en `asistencias.fecha`, `tareas.fecha_limite` y `mensajes.created_at`. |
| 87 | 🟢 | **Service Worker y PWA** — Convertir el frontend en PWA para funcionar offline y permitir instalación en móvil. |
| 88 | 🟢 | **CDN para archivos estáticos** — Servir imágenes y materiales desde un CDN (Cloudflare R2, AWS S3) en lugar del servidor local. |

---

## 🧪 Testing y Calidad (7 mejoras)

| # | Prioridad | Mejora |
|---|-----------|--------|
| 89 | 🔴 | **Tests unitarios del backend** — Agregar Jest + Supertest para probar cada controller de forma aislada con mocks de BD. |
| 90 | 🔴 | **Tests de integración E2E** — Usar Playwright o Cypress para probar flujos completos (login → inscripción → calificación). |
| 91 | 🟡 | **Tests unitarios del frontend** — Vitest + React Testing Library para probar componentes UI críticos. |
| 92 | 🟡 | **CI/CD con GitHub Actions** — Pipeline automático que corra los tests en cada push y bloquee el merge si fallan. |
| 93 | 🟡 | **Linting estricto** — Configurar ESLint con reglas de seguridad (`no-eval`, `no-implied-eval`) y Prettier para formato consistente. |
| 94 | 🟢 | **Cobertura de código** — Configurar Istanbul/c8 para medir cobertura y exigir mínimo 80% en módulos críticos. |
| 95 | 🟢 | **Análisis de dependencias vulnerables** — Integrar `npm audit` y Snyk en el pipeline de CI para detectar vulnerabilidades. |

---

## 🚢 DevOps y Despliegue (5 mejoras)

| # | Prioridad | Mejora |
|---|-----------|--------|
| 96 | 🔴 | **Dockerizar el proyecto** — `Dockerfile` para backend y frontend + `docker-compose.yml` con MySQL para levantar todo con un comando. |
| 97 | 🔴 | **Variables de entorno por ambiente** — Separar `.env.development`, `.env.staging` y `.env.production` con configuraciones distintas. |
| 98 | 🟡 | **Logs estructurados con Winston** — Reemplazar `console.log` por Winston con niveles (info, warn, error) y rotación de archivos de log. |
| 99 | 🟡 | **Health check endpoint** — `GET /api/health` que verifique conexión a BD, uso de memoria y tiempo de respuesta para monitoreo. |
| 100 | 🟢 | **Despliegue en la nube** — Guía de despliegue en Railway, Render o VPS con Nginx como reverse proxy, PM2 para el proceso Node y MySQL gestionado. |

---

## 📊 Resumen por prioridad

| Prioridad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 Alta | 35 | Críticas para seguridad, estabilidad y funcionalidad core |
| 🟡 Media | 43 | Mejoran significativamente la experiencia y el rendimiento |
| 🟢 Baja | 22 | Nice-to-have, diferenciadores y optimizaciones avanzadas |

## 📋 Resumen por área

| Área | Mejoras |
|------|---------|
| 🔐 Seguridad | 12 |
| 🗄️ Backend / API / BD | 18 |
| 🎨 Frontend / UX | 20 |
| 👨‍🎓 Portal Alumno | 10 |
| 👨‍🏫 Portal Profesor | 10 |
| 👑 Panel Admin | 10 |
| ⚡ Performance | 8 |
| 🧪 Testing / Calidad | 7 |
| 🚢 DevOps / Despliegue | 5 |
| **Total** | **100** |
