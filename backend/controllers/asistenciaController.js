const db = require('../database/db');

exports.getByCurso = async (req, res, next) => {
  try {
    const { curso_id } = req.params;
    const { fecha } = req.query;
    const whereExtra = fecha ? ' AND a.fecha = ?' : '';
    const params = fecha ? [curso_id, fecha] : [curso_id];
    const [rows] = await db.execute(
      `SELECT a.id, a.fecha, a.presente, a.observacion,
         u.id AS usuario_id, u.nombre AS usuario_nombre
       FROM asistencias a
       JOIN usuarios u ON a.usuario_id = u.id
       WHERE a.curso_id = ?${whereExtra}
       ORDER BY a.fecha DESC, u.nombre`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

exports.registrar = async (req, res, next) => {
  try {
    // Acepta tanto un objeto individual como un array de registros
    let registros = req.body.registros;
    if (!registros) {
      // Objeto individual: { usuario_id, curso_id, fecha, presente, observacion }
      const { usuario_id, curso_id, fecha, presente, observacion } = req.body;
      if (!usuario_id || !curso_id || !fecha)
        return res.status(400).json({ success: false, message: 'usuario_id, curso_id y fecha son requeridos' });
      registros = [{ usuario_id, curso_id, fecha, presente, observacion }];
    }

    if (!Array.isArray(registros) || !registros.length)
      return res.status(400).json({ success: false, message: 'Se requiere un array de registros o un objeto individual' });

    for (const r of registros) {
      await db.execute(
        `INSERT INTO asistencias (usuario_id, curso_id, fecha, presente, observacion)
         VALUES (?,?,?,?,?)
         ON DUPLICATE KEY UPDATE presente=VALUES(presente), observacion=VALUES(observacion)`,
        [r.usuario_id, r.curso_id, r.fecha, r.presente ? 1 : 0, r.observacion || null]
      );
    }
    res.json({ success: true, message: 'Asistencia registrada' });
  } catch (err) { next(err); }
};

exports.getResumen = async (req, res, next) => {
  try {
    const { curso_id } = req.params;
    const [rows] = await db.execute(
      `SELECT u.id AS usuario_id, u.nombre,
         COUNT(a.id) AS total_clases,
         SUM(a.presente) AS presentes,
         ROUND(SUM(a.presente) / COUNT(a.id) * 100, 1) AS porcentaje
       FROM inscripciones i
       JOIN usuarios u ON i.usuario_id = u.id
       LEFT JOIN asistencias a ON a.usuario_id = u.id AND a.curso_id = i.curso_id
       WHERE i.curso_id = ?
       GROUP BY u.id, u.nombre`,
      [curso_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};
