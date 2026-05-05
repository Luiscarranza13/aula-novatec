const db = require('../database/db');

const PAGE_SIZE = 20;

exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || PAGE_SIZE);
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const categoria = req.query.categoria || null;

    const conditions = [];
    const countParams = [];
    if (search) { conditions.push('(c.titulo LIKE ? OR c.descripcion LIKE ?)'); countParams.push(search, search); }
    if (categoria) { conditions.push('c.categoria = ?'); countParams.push(categoria); }
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM cursos c ${whereClause}`, countParams
    );
    const [rows] = await db.execute(
      `SELECT c.*, u.nombre AS profesor_nombre,
        (SELECT COUNT(*) FROM inscripciones i WHERE i.curso_id = c.id) AS total_inscripciones
       FROM cursos c LEFT JOIN usuarios u ON c.profesor_id = u.id
       ${whereClause} ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      countParams
    );
    res.json({ success: true, data: rows, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { titulo, descripcion, profesor_id, categoria, duracion_horas } = req.body;
    if (!titulo) return res.status(400).json({ success: false, message: 'El título es requerido' });
    const [result] = await db.execute(
      'INSERT INTO cursos (titulo, descripcion, profesor_id, categoria, duracion_horas) VALUES (?,?,?,?,?)',
      [titulo, descripcion || null, profesor_id || null, categoria || null, duracion_horas || 0]
    );
    res.status(201).json({ success: true, message: 'Curso creado', data: { id: result.insertId } });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { titulo, descripcion, profesor_id, categoria, duracion_horas } = req.body;
    await db.execute(
      'UPDATE cursos SET titulo=?, descripcion=?, profesor_id=?, categoria=?, duracion_horas=? WHERE id=?',
      [titulo, descripcion || null, profesor_id || null, categoria || null, duracion_horas || 0, req.params.id]
    );
    res.json({ success: true, message: 'Curso actualizado' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM cursos WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Curso eliminado' });
  } catch (err) { next(err); }
};
