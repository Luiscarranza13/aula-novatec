-- ============================================
-- Aula Virtual - Script SQL Completo v3.0
-- ============================================

CREATE DATABASE IF NOT EXISTS aula_virtual;
USE aula_virtual;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('estudiante', 'profesor', 'admin') NOT NULL DEFAULT 'estudiante',
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  color VARCHAR(20) DEFAULT '#4f46e5',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS cursos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  profesor_id INT,
  categoria VARCHAR(100),
  duracion_horas INT DEFAULT 0,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profesor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  curso_id INT NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('activa', 'completada', 'cancelada') DEFAULT 'activa',
  UNIQUE KEY unique_inscripcion (usuario_id, curso_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

-- Tabla de calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  curso_id INT NOT NULL,
  nota DECIMAL(5,2) NOT NULL,
  comentario TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

-- Tabla de anuncios
CREATE TABLE IF NOT EXISTS anuncios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(200) NOT NULL,
  contenido TEXT NOT NULL,
  autor_id INT,
  curso_id INT,
  tipo ENUM('general', 'curso', 'urgente') DEFAULT 'general',
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

-- ============================================
-- Datos de ejemplo
-- ============================================

-- Categorías
INSERT IGNORE INTO categorias (nombre, descripcion, color) VALUES
('Programación', 'Cursos de desarrollo de software', '#4f46e5'),
('Diseño', 'Cursos de diseño gráfico y UX', '#7c3aed'),
('Matemáticas', 'Cursos de matemáticas y estadística', '#0891b2'),
('Idiomas', 'Cursos de idiomas extranjeros', '#059669');

-- Usuarios (contraseña: 123456)
INSERT IGNORE INTO usuarios (nombre, email, password, rol) VALUES
('Admin Sistema', 'admin@aula.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('María González', 'maria@aula.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'profesor'),
('Carlos López', 'carlos@aula.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'profesor'),
('Ana Martínez', 'ana@aula.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'estudiante'),
('Luis Rodríguez', 'luis@aula.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'estudiante'),
('Sofia Pérez', 'sofia@aula.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'estudiante');

-- Cursos
INSERT IGNORE INTO cursos (titulo, descripcion, profesor_id, categoria, duracion_horas) VALUES
('Introducción a JavaScript', 'Aprende los fundamentos de JavaScript desde cero', 2, 'Programación', 40),
('React desde Cero', 'Construye aplicaciones web modernas con React', 2, 'Programación', 60),
('Diseño UI/UX', 'Principios de diseño de interfaces de usuario', 3, 'Diseño', 30),
('Álgebra Lineal', 'Vectores, matrices y transformaciones lineales', 3, 'Matemáticas', 45),
('Inglés Básico', 'Fundamentos del idioma inglés', 2, 'Idiomas', 50);

-- Inscripciones
INSERT IGNORE INTO inscripciones (usuario_id, curso_id) VALUES
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 4),
(6, 2), (6, 3), (6, 5);

-- Calificaciones
INSERT IGNORE INTO calificaciones (usuario_id, curso_id, nota, comentario) VALUES
(4, 1, 92.5, 'Excelente desempeño'),
(4, 2, 78.0, 'Buen trabajo'),
(5, 1, 65.0, 'Necesita mejorar'),
(6, 2, 88.5, 'Muy buen trabajo');

-- Anuncios
INSERT IGNORE INTO anuncios (titulo, contenido, autor_id, tipo) VALUES
('Bienvenidos al nuevo semestre', 'Les damos la bienvenida al sistema de aula virtual.', 1, 'general'),
('Mantenimiento programado', 'El sistema estará en mantenimiento el domingo de 2am a 4am.', 1, 'urgente');
