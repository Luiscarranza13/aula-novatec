require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function seed() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('🌱 Insertando datos de ejemplo...');

  // Categorías
  await db.execute(`INSERT IGNORE INTO categorias (nombre, descripcion, color) VALUES
    ('Programación','Cursos de desarrollo de software','#4f46e5'),
    ('Diseño','Cursos de diseño gráfico y UX','#7c3aed'),
    ('Matemáticas','Cursos de matemáticas y estadística','#0891b2'),
    ('Idiomas','Cursos de idiomas extranjeros','#059669')`);

  // Usuarios (contraseña: 123456 — hash bcrypt)
  await db.execute(`INSERT IGNORE INTO usuarios (nombre, email, password, rol) VALUES
    ('Admin Sistema','admin@aula.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin'),
    ('María González','maria@aula.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','profesor'),
    ('Carlos López','carlos@aula.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','profesor'),
    ('Ana Martínez','ana@aula.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','estudiante'),
    ('Luis Rodríguez','luis@aula.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','estudiante')`);

  // Cursos
  await db.execute(`INSERT IGNORE INTO cursos (titulo, descripcion, profesor_id, categoria, duracion_horas) VALUES
    ('Introducción a JavaScript','Aprende los fundamentos de JavaScript desde cero',2,'Programación',40),
    ('React desde Cero','Construye aplicaciones web modernas con React',2,'Programación',60),
    ('Diseño UI/UX','Principios de diseño de interfaces de usuario',3,'Diseño',30),
    ('Álgebra Lineal','Vectores, matrices y transformaciones lineales',3,'Matemáticas',45)`);

  // Inscripciones
  await db.execute(`INSERT IGNORE INTO inscripciones (usuario_id, curso_id) VALUES (4,1),(4,2),(5,1),(5,3)`);

  // Calificaciones
  await db.execute(`INSERT IGNORE INTO calificaciones (usuario_id, curso_id, nota, comentario) VALUES
    (4,1,92.5,'Excelente desempeño'),(4,2,78.0,'Buen trabajo'),(5,1,65.0,'Necesita mejorar')`);

  // Anuncios
  await db.execute(`INSERT IGNORE INTO anuncios (titulo, contenido, autor_id, tipo) VALUES
    ('Bienvenidos al nuevo semestre','Les damos la bienvenida al sistema de aula virtual.',1,'general'),
    ('Mantenimiento programado','El sistema estará en mantenimiento el domingo de 2am a 4am.',1,'urgente')`);

  console.log('✅ Datos de ejemplo insertados correctamente');
  await db.end();
}

seed().catch((err) => { console.error('❌ Error en seed:', err.message); process.exit(1); });
