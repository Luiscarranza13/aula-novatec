const db = require('../database/db');

exports.getMias = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM notificaciones WHERE usuario_id=? ORDER BY created_at DESC LIMIT 50',
      [req.user.userId]
    );
    const [[{ total }]] = await db.execute(
      'SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id=? AND leido=0',
      [req.user.userId]
    );
    res.json({ success: true, data: rows, no_leidas: total });
  } catch (err) { next(err); }
};

exports.marcarLeida = async (req, res, next) => {
  try {
    await db.execute('UPDATE notificaciones SET leido=1 WHERE id=? AND usuario_id=?', [req.params.id, req.user.userId]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.marcarTodasLeidas = async (req, res, next) => {
  try {
    await db.execute('UPDATE notificaciones SET leido=1 WHERE usuario_id=?', [req.user.userId]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

// Función interna para crear notificaciones desde otros controllers
exports.crear = async (usuario_id, tipo, mensaje, link = null) => {
  try {
    await db.execute(
      'INSERT INTO notificaciones (usuario_id, tipo, mensaje, link) VALUES (?,?,?,?)',
      [usuario_id, tipo, mensaje, link]
    );
  } catch (_) {}
};
