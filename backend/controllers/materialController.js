const db = require('../database/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/materiales')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
});
exports.upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

exports.getByCurso = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT m.*, u.nombre AS autor_nombre FROM materiales m
       JOIN usuarios u ON m.autor_id = u.id
       WHERE m.curso_id=? ORDER BY m.created_at DESC`,
      [req.params.curso_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { titulo, tipo, url, curso_id } = req.body;
    const archivo_url = req.file ? `/uploads/materiales/${req.file.filename}` : url || null;
    if (!titulo || !curso_id) return res.status(400).json({ success: false, message: 'Título y curso son requeridos' });
    const [r] = await db.execute(
      'INSERT INTO materiales (titulo, tipo, url, curso_id, autor_id) VALUES (?,?,?,?,?)',
      [titulo, tipo || 'enlace', archivo_url, curso_id, req.user.userId]
    );
    res.status(201).json({ success: true, data: { id: r.insertId } });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM materiales WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};
