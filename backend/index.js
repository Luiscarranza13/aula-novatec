require('dotenv').config();

const REQUIRED_ENV = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) { console.error(`❌ Faltan variables de entorno: ${missing.join(', ')}`); process.exit(1); }

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2');
const path = require('path');
const db = require('./database/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Demasiados intentos.' } }));

async function initDatabase() {
  const connection = mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD });
  await connection.promise().execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  connection.end();

  const pool = mysql.createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, waitForConnections: true, connectionLimit: 10 });
  const p = pool.promise();
  db.setPool(p);

  // ── Tablas base ────────────────────────────────────────────────────────
  await p.execute(`CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT, nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL,
    rol ENUM('estudiante','profesor','admin') NOT NULL DEFAULT 'estudiante',
    foto_url VARCHAR(255), activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  await p.execute(`CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT, nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT, color VARCHAR(20) DEFAULT '#4f46e5',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  await p.execute(`CREATE TABLE IF NOT EXISTS cursos (
    id INT PRIMARY KEY AUTO_INCREMENT, titulo VARCHAR(200) NOT NULL,
    descripcion TEXT, profesor_id INT, categoria VARCHAR(100),
    duracion_horas INT DEFAULT 0, activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profesor_id) REFERENCES usuarios(id) ON DELETE SET NULL
  )`);

  await p.execute(`CREATE TABLE IF NOT EXISTS inscripciones (
    id INT PRIMARY KEY AUTO_INCREMENT, usuario_id INT NOT NULL, curso_id INT NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activa','completada','cancelada') DEFAULT 'activa',
    UNIQUE KEY unique_inscripcion (usuario_id, curso_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
  )`);

  await p.execute(`CREATE TABLE IF NOT EXISTS calificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT, usuario_id INT NOT NULL, curso_id INT NOT NULL,
    nota DECIMAL(5,2) NOT NULL, comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_calificacion (usuario_id, curso_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
  )`);

  await p.execute(`CREATE TABLE IF NOT EXISTS anuncios (
    id INT PRIMARY KEY AUTO_INCREMENT, titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL, autor_id INT, curso_id INT,
    tipo ENUM('general','curso','urgente') DEFAULT 'general', activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
  )`);

  // ── Tablas nuevas ──────────────────────────────────────────────────────
  await p.execute(`CREATE TABLE IF NOT EXISTS asistencias (
    id INT PRIMARY KEY AUTO_INCREMENT, usuario_id INT NOT NULL, curso_id INT NOT NULL,
    fecha DATE NOT NULL, presente TINYINT(1) DEFAULT 1, observacion TEXT,
    UNIQUE KEY unique_asistencia (usuario_id, curso_id, fecha),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
  )`);

  await p.execute(`CREATE TABLE IF NOT EXISTS tareas (
    id INT PRIMARY KEY AUTO_INCREMENT, titulo VARCHAR(200) NOT NULL,
    descripcion TEXT, curso_id INT NOT NULL, fecha_limite DATETIME,
    puntos_maximos INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
  )`);

  await p.execute(`CREATE TABLE IF NOT EXISTS entregas (
    id INT PRIMARY KEY AUTO_INCREMENT, tarea_id INT NOT NULL, usuario_id INT NOT NULL,
    archivo_url VARCHAR(500), comentario TEXT,
    calificacion DECIMAL(5,2), retroalimentacion TEXT,
    estado ENUM('pendiente','entregado','calificado') DEFAULT 'entregado',
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_entrega (tarea_id, usuario_id),
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`);

  await p.execute(`CREATE TABLE IF NOT EXISTS notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT, usuario_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL, mensaje TEXT NOT NULL,
    link VARCHAR(255), leido TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`);

  await p.execute(`CREATE TABLE IF NOT EXISTS mensajes (
    id INT PRIMARY KEY AUTO_INCREMENT, de_usuario_id INT NOT NULL,
    para_usuario_id INT NOT NULL, asunto VARCHAR(200) DEFAULT 'Sin asunto',
    contenido TEXT NOT NULL, leido TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (de_usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (para_usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`);

  await p.execute(`CREATE TABLE IF NOT EXISTS materiales (
    id INT PRIMARY KEY AUTO_INCREMENT, titulo VARCHAR(200) NOT NULL,
    tipo ENUM('enlace','pdf','video','documento','imagen') DEFAULT 'enlace',
    url VARCHAR(500), curso_id INT NOT NULL, autor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE SET NULL
  )`);

  // Migraciones seguras
  const alters = [
    'ALTER TABLE usuarios ADD COLUMN foto_url VARCHAR(255)',
    'ALTER TABLE usuarios ADD COLUMN activo TINYINT(1) DEFAULT 1',
    'ALTER TABLE usuarios ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'ALTER TABLE usuarios ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'ALTER TABLE cursos ADD COLUMN categoria VARCHAR(100)',
    'ALTER TABLE cursos ADD COLUMN duracion_horas INT DEFAULT 0',
    'ALTER TABLE cursos ADD COLUMN activo TINYINT(1) DEFAULT 1',
    'ALTER TABLE cursos ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'ALTER TABLE cursos ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'ALTER TABLE inscripciones ADD COLUMN fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    "ALTER TABLE inscripciones ADD COLUMN estado ENUM('activa','completada','cancelada') DEFAULT 'activa'",
    'ALTER TABLE calificaciones ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'ALTER TABLE anuncios ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'ALTER TABLE categorias ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'ALTER TABLE cursos ADD INDEX idx_profesor (profesor_id)',
    'ALTER TABLE inscripciones ADD INDEX idx_usuario (usuario_id)',
    'ALTER TABLE inscripciones ADD INDEX idx_curso (curso_id)',
    'ALTER TABLE calificaciones ADD INDEX idx_cal_usuario (usuario_id)',
    'ALTER TABLE calificaciones ADD INDEX idx_cal_curso (curso_id)',
    'ALTER TABLE calificaciones ADD UNIQUE KEY unique_calificacion (usuario_id, curso_id)',
  ];
  for (const sql of alters) { try { await p.execute(sql); } catch (_) {} }

  console.log('✅ Base de datos lista');
}

initDatabase().then(() => {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/usuarios', require('./routes/usuarios'));
  app.use('/api/cursos', require('./routes/cursos'));
  app.use('/api/inscripciones', require('./routes/inscripciones'));
  app.use('/api/calificaciones', require('./routes/calificaciones'));
  app.use('/api/anuncios', require('./routes/anuncios'));
  app.use('/api/categorias', require('./routes/categorias'));
  // Módulos nuevos
  app.use('/api/asistencias', require('./routes/asistencias'));
  app.use('/api/tareas', require('./routes/tareas'));
  app.use('/api/notificaciones', require('./routes/notificaciones'));
  app.use('/api/mensajes', require('./routes/mensajes'));
  app.use('/api/materiales', require('./routes/materiales'));
  app.use('/api/reportes', require('./routes/reportes'));
  app.use('/api/certificados', require('./routes/certificados'));
  app.use('/api/perfil', require('./routes/perfil'));
  app.use('/api/buscar', require('./routes/buscar'));

  app.get('/', (req, res) => res.json({ message: '🎓 Aula Virtual API v4.0' }));
  app.use(errorHandler);

  const server = app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
  server.on('error', (err) => { if (err.code === 'EADDRINUSE') { console.error(`❌ Puerto ${PORT} ocupado.`); process.exit(1); } });
}).catch((err) => { console.error('❌ Error BD:', err.message); process.exit(1); });
