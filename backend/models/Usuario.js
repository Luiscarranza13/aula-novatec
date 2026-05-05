const db = require('../database/db');

class Usuario {
  static async crear({ nombre, email, password, rol }) {
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?,?,?,?)',
      [nombre, email, password, rol]
    );
    return result;
  }

  static async obtenerTodos() {
    const [rows] = await db.execute(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY created_at DESC'
    );
    return rows;
  }

  static async obtenerPorId(id) {
    const [rows] = await db.execute(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE id = ?', [id]
    );
    return rows[0];
  }

  static async obtenerPorEmail(email) {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
  }
}

module.exports = Usuario;
