# 🎓 Aula Virtual

Sistema web completo para gestión de usuarios, cursos, inscripciones, calificaciones y anuncios.

## Requisitos

- Node.js v14+
- MySQL v5.7+

## Instalación

### 1. Base de datos

```bash
mysql -u root -p < database/database.sql
```

O ejecuta el script manualmente en tu cliente MySQL.

### 2. Backend

```bash
cd backend
npm install
```

Crea el archivo `.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=aula_virtual
PORT=3001
JWT_SECRET=tu_secreto_jwt
```

```bash
npm start
```

API disponible en `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App disponible en `http://localhost:5173`

## Estructura

```
aula-virtual/
├── backend/
│   ├── controllers/        # Lógica de negocio
│   │   ├── authController.js
│   │   ├── cursoController.js
│   │   ├── inscripcionController.js
│   │   └── usuarioController.js
│   ├── database/
│   │   └── db.js           # Pool de conexión compartido
│   ├── middleware/
│   │   └── auth.js         # Middleware JWT
│   ├── models/             # Modelos de datos
│   ├── routes/             # Endpoints de la API
│   │   ├── auth.js
│   │   ├── usuarios.js
│   │   ├── cursos.js
│   │   ├── inscripciones.js
│   │   ├── calificaciones.js
│   │   ├── anuncios.js
│   │   └── categorias.js
│   ├── scripts/
│   │   └── initDB.js       # Script de inicialización manual
│   ├── index.js            # Entrada principal
│   └── package.json
├── database/
│   └── database.sql        # Script SQL completo con datos de ejemplo
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # DashboardLayout
│   │   │   └── ui/         # Button, Card, Input, Modal, Badge, Loader
│   │   ├── pages/          # LandingPage, LoginPage, RegisterPage, Dashboard...
│   │   ├── services/
│   │   │   └── api.js      # Cliente Axios + servicios por entidad
│   │   ├── store/
│   │   │   ├── useAuthStore.js   # Estado de autenticación (Zustand)
│   │   │   ├── useCourseStore.js # Estado de cursos
│   │   │   └── index.js          # Re-exportaciones
│   │   ├── lib/
│   │   │   └── utils.js    # Utilidades (cn, etc.)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .gitignore
└── README.md
```

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/register | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/usuarios | Listar usuarios |
| POST | /api/usuarios | Crear usuario |
| PUT | /api/usuarios/:id | Actualizar usuario |
| DELETE | /api/usuarios/:id | Eliminar usuario |
| GET | /api/cursos | Listar cursos |
| POST | /api/cursos | Crear curso |
| PUT | /api/cursos/:id | Actualizar curso |
| DELETE | /api/cursos/:id | Eliminar curso |
| GET | /api/inscripciones | Listar inscripciones |
| POST | /api/inscripciones | Inscribir usuario |
| DELETE | /api/inscripciones/:id | Cancelar inscripción |
| GET | /api/calificaciones | Listar calificaciones |
| POST | /api/calificaciones | Crear calificación |
| GET | /api/anuncios | Listar anuncios |
| POST | /api/anuncios | Crear anuncio |
| GET | /api/categorias | Listar categorías |

## Tecnologías

**Backend:** Node.js, Express, MySQL2, JWT, bcryptjs, dotenv

**Frontend:** React 18, Vite, Tailwind CSS, Zustand, Axios, React Router, Lucide React

## Usuarios de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@aula.com | 123456 | admin |
| maria@aula.com | 123456 | profesor |
| ana@aula.com | 123456 | estudiante |
