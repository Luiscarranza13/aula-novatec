const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Primero conectamos sin base de datos para crearla
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Crear base de datos y tablas
const createDatabase = async () => {
  try {
    console.log('Creando base de datos aula_virtual...');
    
    await connection.promise().execute(`CREATE DATABASE IF NOT EXISTS aula_virtual`);
    await connection.promise().execute(`USE aula_virtual`);
    
    // Tabla de usuarios
    await connection.promise().execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        rol ENUM('estudiante', 'profesor') NOT NULL
      )
    `);
    
    // Tabla de cursos
    await connection.promise().execute(`
      CREATE TABLE IF NOT EXISTS cursos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        titulo VARCHAR(100) NOT NULL,
        descripcion TEXT,
        profesor_id INT,
        FOREIGN KEY (profesor_id) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);
    
    // Tabla de inscripciones
    await connection.promise().execute(`
      CREATE TABLE IF NOT EXISTS inscripciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT,
        curso_id INT,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
      )
    `);
    
    // Datos de ejemplo
    await connection.promise().execute(`
      INSERT IGNORE INTO usuarios (id, nombre, email, password, rol) VALUES
      (1, 'Ana García', 'ana@email.com', 'password123', 'estudiante'),
      (2, 'Carlos López', 'carlos@email.com', 'password123', 'profesor')
    `);
    
    await connection.promise().execute(`
      INSERT IGNORE INTO cursos (id, titulo, descripcion, profesor_id) VALUES
      (1, 'Introducción a JavaScript', 'Curso básico de JavaScript para principiantes', 2),
      (2, 'React desde Cero', 'Aprende React paso a paso', 2)
    `);
    
    await connection.promise().execute(`
      INSERT IGNORE INTO inscripciones (usuario_id, curso_id) VALUES
      (1, 1),
      (1, 2)
    `);
    
    console.log('✅ Base de datos creada exitosamente!');
    console.log('📊 Tablas creadas: usuarios, cursos, inscripciones');
    console.log('📝 Datos de ejemplo insertados');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error);
    process.exit(1);
  }
};

createDatabase();