const db = require('../database/db');

exports.getBandeja = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [recibidos] = await db.execute(
      `SELECT m.*, u.nombre AS de_nombre FROM mensajes m
       JOIN usuarios u ON m.de_usuario_id = u.id
       WHERE m.para_usuario_id=? ORDER BY m.created_at DESC`,
      [userId]
    );
    const [enviados] = await db.execute(
      `SELECT m.*, u.nombre AS para_nombre FROM mensajes m
       JOIN usuarios u ON m.para_usuario_id = u.id
       WHERE m.de_usuario_id=? ORDER BY m.created_at DESC`,
      [userId]
    );
    const [[{ no_leidos }]] = await db.execute(
      'SELECT COUNT(*) AS no_leidos FROM mensajes WHERE para_usuario_id=? AND leido=0',
      [userId]
    );
    res.json({ success: true, recibidos, enviados, no_leidos });
  } catch (err) { next(err); }
};

exports.enviar = async (req, res, next) => {
  try {
    const { para_usuario_id, asunto, contenido } = req.body;
    if (!para_usuario_id || !contenido)
      return res.status(400).json({ success: false, message: 'Destinatario y contenido son requeridos' });
    const [r] = await db.execute(
      'INSERT INTO mensajes (de_usuario_id, para_usuario_id, asunto, contenido) VALUES (?,?,?,?)',
      [req.user.userId, para_usuario_id, asunto || 'Sin asunto', contenido]
    );
    res.status(201).json({ success: true, data: { id: r.insertId } });
  } catch (err) { next(err); }
};

exports.marcarLeido = async (req, res, next) => {
  try {
    await db.execute('UPDATE mensajes SET leido=1 WHERE id=? AND para_usuario_id=?', [req.params.id, req.user.userId]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.eliminar = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM mensajes WHERE id=? AND (de_usuario_id=? OR para_usuario_id=?)',
      [req.params.id, req.user.userId, req.user.userId]);
    res.json({ success: true });
  } catch (err) { next(err); }
};
