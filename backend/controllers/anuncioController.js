const db = require('../database/db');

exports.getAll = async (req, res, next) => {
  try {
    const curso_id = req.query.curso_id || null;
    const whereExtra = curso_id ? ' AND a.curso_id = ?' : '';
    const params = curso_id ? [curso_id] : [];
    const [rows] = await db.execute(
      `SELECT a.id, a.titulo, a.contenido, a.tipo, a.activo, a.created_at,
         u.nombre AS autor_nombre, c.titulo AS curso_titulo
       FROM anuncios a
       LEFT JOIN usuarios u ON a.autor_id = u.id
       LEFT JOIN cursos c ON a.curso_id = c.id
       WHERE a.activo = 1${whereExtra} ORDER BY a.created_at DESC`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { titulo, contenido, autor_id, curso_id, tipo = 'general' } = req.body;
    if (!titulo || !contenido)
      return res.status(400).json({ success: false, message: 'Título y contenido son requeridos' });
    const [result] = await db.execute(
      'INSERT INTO anuncios (titulo, contenido, autor_id, curso_id, tipo) VALUES (?,?,?,?,?)',
      [titulo, contenido, autor_id || null, curso_id || null, tipo]
    );
    res.status(201).json({ success: true, message: 'Anuncio creado', data: { id: result.insertId } });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { titulo, contenido, tipo = 'general' } = req.body;
    await db.execute('UPDATE anuncios SET titulo=?, contenido=?, tipo=? WHERE id=?', [titulo, contenido, tipo, req.params.id]);
    res.json({ success: true, message: 'Anuncio actualizado' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await db.execute('UPDATE anuncios SET activo=0 WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Anuncio eliminado' });
  } catch (err) { next(err); }
};
