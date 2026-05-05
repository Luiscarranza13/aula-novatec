const db = require('../database/db');

exports.buscar = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2)
      return res.status(400).json({ success: false, message: 'Mínimo 2 caracteres' });

    const term = `%${q.trim()}%`;

    const [[cursos], [usuarios], [anuncios]] = await Promise.all([
      db.execute(
        `SELECT id, titulo AS nombre, descripcion, 'curso' AS tipo FROM cursos
         WHERE titulo LIKE ? OR descripcion LIKE ? LIMIT 5`, [term, term]
      ),
      db.execute(
        `SELECT id, nombre, email AS descripcion, rol AS tipo FROM usuarios
         WHERE nombre LIKE ? OR email LIKE ? LIMIT 5`, [term, term]
      ),
      db.execute(
        `SELECT id, titulo AS nombre, contenido AS descripcion, 'anuncio' AS tipo FROM anuncios
         WHERE activo=1 AND (titulo LIKE ? OR contenido LIKE ?) LIMIT 5`, [term, term]
      ),
    ]);

    res.json({
      success: true,
      data: { cursos, usuarios, anuncios },
      total: cursos.length + usuarios.length + anuncios.length,
    });
  } catch (err) { next(err); }
};
