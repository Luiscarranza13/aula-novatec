const db = require('../database/db');

class Inscripcion {
  // Crear una nueva inscripción
  static async crear(inscripcion) {
    const { usuario_id, curso_id } = inscripcion;
    const [result] = await db.execute(
      'INSERT INTO inscripciones (usuario_id, curso_id) VALUES (?, ?)',
      [usuario_id, curso_id]
    );
    return result;
  }

  // Obtener todas las inscripciones con datos del usuario y curso
  static async obtenerTodos() {
    const [rows] = await db.execute(`
      SELECT i.id, i.usuario_id, i.curso_id, 
             u.nombre as usuario_nombre, u.email as usuario_email,
             c.titulo as curso_titulo
      FROM inscripciones i
      LEFT JOIN usuarios u ON i.usuario_id = u.id
      LEFT JOIN cursos c ON i.curso_id = c.id
    `);
    return rows;
  }

  // Verificar si usuario ya está inscrito en el curso
  static async verificarInscripcion(usuario_id, curso_id) {
    const [rows] = await db.execute(
      'SELECT * FROM inscripciones WHERE usuario_id = ? AND curso_id = ?',
      [usuario_id, curso_id]
    );
    return rows.length > 0;
  }
}

module.exports = Inscripcion;