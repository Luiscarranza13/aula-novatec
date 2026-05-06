# Credenciales de Acceso — Aula Virtual

> **URL del sistema:** http://localhost:5173  
> **URL de la API:** http://localhost:3001

---

## Usuarios de prueba

| Rol | Nombre | Email | Contraseña |
|-----|--------|-------|------------|
| 🔴 Admin | Administrador | `admin@aula.com` | `Admin123!` |
| 🟡 Profesor | Prof. García | `profesor@aula.com` | `Profesor123!` |
| 🟢 Alumno | Juan Alumno | `alumno@aula.com` | `Alumno123!` |

---

## Detalle por rol

### 🔴 Administrador
- **Email:** admin@aula.com
- **Contraseña:** Admin123!
- **Acceso:** Panel completo — usuarios, cursos, reportes, categorías, anuncios

### 🟡 Profesor
- **Email:** profesor@aula.com
- **Contraseña:** Profesor123!
- **Acceso:** Gestión de cursos propios, calificaciones, asistencia, materiales, tareas, anuncios de curso

### 🟢 Alumno
- **Email:** alumno@aula.com
- **Contraseña:** Alumno123!
- **Acceso:** Ver cursos inscritos, calificaciones, materiales, tareas, mensajes
- **Inscripto en:** Introducción a JavaScript, React desde Cero

---

## Base de datos

| Parámetro | Valor |
|-----------|-------|
| Host | localhost |
| Puerto | 3307 |
| Usuario | root |
| Contraseña | 1234 |
| Base de datos | aula_virtual |

---

## Datos de ejemplo cargados

- **3 categorías:** Programación, Diseño, Matemáticas
- **3 cursos:** Introducción a JavaScript, React desde Cero, Diseño UI/UX
- **2 inscripciones** del alumno (JS y React)
- **1 calificación** del alumno en JS (88.5)
- **2 anuncios** generales
