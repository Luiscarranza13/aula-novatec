const db = require('../database/db');

class Curso {
  static async crear({ titulo, descripcion, profesor_id, categoria, duracion_horas }) {
    const [result] = await db.execute(
      'INSERT INTO cursos (titulo, descripcion, profesor_id, categoria, duracion_horas) VALUES (?,?,?,?,?)',
      [titulo, descripcion || null, profesor_id || null, categoria || null, duracion_horas || 0]
    );
    return result;
  }

  static async obtenerTodos() {
    const [rows] = await db.execute(
      `SELECT c.*, u.nombre AS profesor_nombre,
        (SELECT COUNT(*) FROM inscripciones i WHERE i.curso_id = c.id) AS total_inscripciones
       FROM cursos c LEFT JOIN usuarios u ON c.profesor_id = u.id
       ORDER BY c.created_at DESC`
    );
    return rows;
  }

  static async obtenerPorId(id) {
    const [rows] = await db.execute('SELECT * FROM cursos WHERE id = ?', [id]);
    return rows[0];
  }

  static async actualizar(id, { titulo, descripcion, profesor_id, categoria, duracion_horas }) {
    const [result] = await db.execute(
      'UPDATE cursos SET titulo=?, descripcion=?, profesor_id=?, categoria=?, duracion_horas=? WHERE id=?',
      [titulo, descripcion || null, profesor_id || null, categoria || null, duracion_horas || 0, id]
    );
    return result;
  }

  static async eliminar(id) {
    const [result] = await db.execute('DELETE FROM cursos WHERE id = ?', [id]);
    return result;
  }
}

module.exports = Curso;
