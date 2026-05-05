const db = require('../database/db');

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categorias ORDER BY nombre');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { nombre, descripcion, color } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    const [result] = await db.execute(
      'INSERT INTO categorias (nombre, descripcion, color) VALUES (?,?,?)',
      [nombre, descripcion || null, color || '#4f46e5']
    );
    res.status(201).json({ success: true, data: { id: result.insertId, nombre } });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM categorias WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (err) { next(err); }
};
