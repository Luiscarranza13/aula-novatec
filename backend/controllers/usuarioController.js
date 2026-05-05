const bcrypt = require('bcryptjs');
const db = require('../database/db');

const PAGE_SIZE = 20;

exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || PAGE_SIZE);
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    const whereClause = search ? 'WHERE (nombre LIKE ? OR email LIKE ?)' : '';
    const searchParams = search ? [search, search] : [];

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM usuarios ${whereClause}`,
      searchParams
    );
    const [rows] = await db.execute(
      `SELECT id, nombre, email, rol, activo, created_at FROM usuarios
       ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      searchParams
    );
    res.json({ success: true, data: rows, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?', [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { nombre, email, password, rol = 'estudiante' } = req.body;
    if (!nombre || !email || !password)
      return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son requeridos' });
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hashed, rol]
    );
    res.status(201).json({ success: true, message: 'Usuario creado', data: { id: result.insertId, nombre, email, rol } });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { nombre, email, rol } = req.body;
    await db.execute('UPDATE usuarios SET nombre=?, email=?, rol=? WHERE id=?', [nombre, email, rol, req.params.id]);
    res.json({ success: true, message: 'Usuario actualizado' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM usuarios WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (err) { next(err); }
};
