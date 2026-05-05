# Backend — Documentación

## Tecnologías

| Paquete | Uso |
|---------|-----|
| Express | Framework HTTP |
| MySQL2 | Driver de base de datos |
| bcryptjs | Hash de contraseñas |
| jsonwebtoken | Autenticación JWT |
| dotenv | Variables de entorno |
| cors | Permitir peticiones del frontend |

---

## Estructura de carpetas

```
backend/
├── index.js              # Punto de entrada: inicia BD y servidor
├── database/
│   └── db.js             # Pool de conexión compartido (lazy)
├── routes/               # Endpoints de la API
│   ├── auth.js
│   ├── usuarios.js
│   ├── cursos.js
│   ├── inscripciones.js
│   ├── calificaciones.js
│   ├── anuncios.js
│   └── categorias.js
├── controllers/          # Lógica de negocio separada
│   ├── authController.js
│   ├── cursoController.js
│   ├── inscripcionController.js
│   └── usuarioController.js
├── middleware/
│   └── auth.js           # Verificación de token JWT
├── models/               # Consultas SQL reutilizables
│   ├── Usuario.js
│   ├── Curso.js
│   └── Inscripcion.js
├── scripts/
│   └── initDB.js         # Script manual de inicialización
└── .env                  # Variables de entorno (no subir al repo)
```

---

## Configuración (.env)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=aula_virtual
PORT=3001
JWT_SECRET=tu_secreto_jwt
```

---

## Arranque del servidor (`index.js`)

El servidor sigue este flujo al iniciar:

1. Crea la base de datos si no existe (conexión temporal sin DB).
2. Crea el pool de conexiones y lo asigna al módulo `db.js` con `db.setPool(pool)`.
3. Crea todas las tablas con `CREATE TABLE IF NOT EXISTS`.
4. Ejecuta migraciones seguras (`ALTER TABLE`) para agregar columnas nuevas sin romper datos existentes.
5. Registra todas las rutas bajo `/api/`.
6. Levanta el servidor en el puerto configurado.

---

## Pool de conexión (`database/db.js`)

Usa un patrón **lazy**: el pool no se crea al importar el módulo, sino que `index.js` lo asigna después de crear la BD. Esto evita errores de conexión cuando la base de datos aún no existe.

```js
db.setPool(pool.promise()); // llamado desde index.js
db.execute(sql, params);    // usado en rutas y controllers
```

---

## Middleware de autenticación (`middleware/auth.js`)

Verifica el token JWT en el header `Authorization: Bearer <token>`.

- Si el token es válido, agrega `req.user = { userId, email, rol }` y llama `next()`.
- Si falta o es inválido, responde `401`.

Se usa en rutas protegidas:
```js
router.get('/profile', require('../middleware/auth'), authController.getProfile);
```

---

## Autenticación (`routes/auth.js` + `controllers/authController.js`)

### POST `/api/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{ "nombre": "Ana", "email": "ana@mail.com", "password": "123456", "rol": "estudiante" }
```

**Lógica:**
1. Valida que todos los campos estén presentes.
2. Verifica que el rol sea `estudiante` o `profesor`.
3. Comprueba que el email no esté registrado.
4. Hashea la contraseña con bcrypt (salt 10).
5. Inserta el usuario y devuelve un JWT de 7 días.

**Respuesta exitosa (201):**
```json
{ "success": true, "token": "...", "user": { "id": 1, "nombre": "Ana", "email": "...", "rol": "estudiante" } }
```

---

### POST `/api/auth/login`
Inicia sesión.

**Body:**
```json
{ "email": "ana@mail.com", "password": "123456" }
```

**Lógica:**
1. Busca el usuario por email.
2. Compara la contraseña con `bcrypt.compare`.
3. Si es válida, devuelve un JWT de 7 días.

**Respuesta exitosa (200):**
```json
{ "success": true, "token": "...", "user": { "id": 1, "nombre": "Ana", "email": "...", "rol": "estudiante" } }
```

---

### GET `/api/auth/profile` 🔒
Devuelve los datos del usuario autenticado. Requiere token.

---

## Usuarios (`routes/usuarios.js`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios` | Lista todos los usuarios (sin password) |
| GET | `/api/usuarios/:id` | Obtiene un usuario por ID |
| POST | `/api/usuarios` | Crea un usuario (hashea password automáticamente) |
| PUT | `/api/usuarios/:id` | Actualiza nombre, email y rol |
| DELETE | `/api/usuarios/:id` | Elimina un usuario |

**Campos devueltos:** `id, nombre, email, rol, activo, created_at`

---

## Cursos (`routes/cursos.js`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cursos` | Lista todos los cursos con nombre del profesor |
| POST | `/api/cursos` | Crea un curso |
| PUT | `/api/cursos/:id` | Actualiza un curso |
| DELETE | `/api/cursos/:id` | Elimina un curso |

**Campos:** `id, titulo, descripcion, profesor_id, categoria, duracion_horas, activo, created_at`

---

## Inscripciones (`routes/inscripciones.js`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/inscripciones` | Lista inscripciones con datos de usuario, curso y profesor |
| POST | `/api/inscripciones` | Inscribe un usuario en un curso |
| DELETE | `/api/inscripciones/:id` | Cancela una inscripción |

**Validación:** No permite inscribir al mismo usuario dos veces en el mismo curso (responde `409`).

---

## Calificaciones (`routes/calificaciones.js`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/calificaciones` | Lista calificaciones con nombre de usuario y curso |
| POST | `/api/calificaciones` | Registra una calificación (nota entre 0 y 100) |
| PUT | `/api/calificaciones/:id` | Actualiza nota y comentario |
| DELETE | `/api/calificaciones/:id` | Elimina una calificación |

---

## Anuncios (`routes/anuncios.js`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/anuncios` | Lista anuncios activos |
| POST | `/api/anuncios` | Crea un anuncio |
| PUT | `/api/anuncios/:id` | Actualiza un anuncio |
| DELETE | `/api/anuncios/:id` | Elimina un anuncio |

**Tipos de anuncio:** `general`, `curso`, `urgente`

---

## Categorías (`routes/categorias.js`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/categorias` | Lista todas las categorías |
| POST | `/api/categorias` | Crea una categoría |
| DELETE | `/api/categorias/:id` | Elimina una categoría |

---

## Formato de respuesta

Todas las respuestas siguen el mismo formato:

```json
{ "success": true, "data": [...] }
{ "success": false, "message": "Descripción del error" }
```

---

## Base de datos

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios del sistema (admin, profesor, estudiante) |
| `cursos` | Cursos disponibles, asociados a un profesor |
| `inscripciones` | Relación usuario ↔ curso |
| `calificaciones` | Notas de un usuario en un curso |
| `anuncios` | Comunicados del sistema |
| `categorias` | Categorías para clasificar cursos |

### Relaciones

```
usuarios ──< cursos (profesor_id)
usuarios ──< inscripciones >── cursos
usuarios ──< calificaciones >── cursos
usuarios ──< anuncios (autor_id)
```

---

## Comandos

```bash
# Instalar dependencias
npm install

# Iniciar en producción
npm start

# Iniciar con recarga automática (requiere nodemon)
npm run dev
```
