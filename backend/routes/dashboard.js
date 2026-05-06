/**
 * Endpoint único de estadísticas del dashboard
 * Mejora #29 — GET /api/dashboard/stats
 */
const router = require('express').Router();
const db = require('../database/db');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/stats', async (req, res, next) => {
  try {
    const [[stats]] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM usuarios WHERE rol = 'estudiante' AND activo = 1) AS total_estudiantes,
        (SELECT COUNT(*) FROM usuarios WHERE rol = 'profesor' AND activo = 1) AS total_profesores,
        (SELECT COUNT(*) FROM usuarios WHERE activo = 1) AS total_usuarios,
        (SELECT COUNT(*) FROM cursos WHERE activo = 1) AS total_cursos,
        (SELECT COUNT(*) FROM inscripciones WHERE estado = 'activa') AS total_inscripciones,
        (SELECT COUNT(*) FROM inscripciones WHERE estado = 'completada') AS total_completadas,
        (SELECT ROUND(AVG(nota), 1) FROM calificaciones) AS promedio_general,
        (SELECT COUNT(*) FROM calificaciones WHERE nota >= 60) AS total_aprobados,
        (SELECT COUNT(*) FROM calificaciones WHERE nota < 60) AS total_reprobados,
        (SELECT COUNT(*) FROM tareas) AS total_tareas,
        (SELECT COUNT(*) FROM entregas) AS total_entregas,
        (SELECT COUNT(*) FROM mensajes WHERE leido = 0) AS mensajes_no_leidos,
        (SELECT COUNT(*) FROM notificaciones WHERE leido = 0) AS notificaciones_no_leidas,
        (SELECT COUNT(*) FROM anuncios WHERE activo = 1) AS total_anuncios,
        (SELECT COUNT(*) FROM categorias) AS total_categorias
    `);

    // Cursos más populares
    const [cursosTop] = await db.execute(`
      SELECT c.id, c.titulo, COUNT(i.id) AS inscripciones
      FROM cursos c
      LEFT JOIN inscripciones i ON i.curso_id = c.id
      WHERE c.activo = 1
      GROUP BY c.id, c.titulo
      ORDER BY inscripciones DESC
      LIMIT 5
    `);

    // Actividad reciente (últimas 10 inscripciones)
    const [actividadReciente] = await db.execute(`
      SELECT i.id, u.nombre AS usuario_nombre, c.titulo AS curso_titulo, i.fecha_inscripcion
      FROM inscripciones i
      JOIN usuarios u ON i.usuario_id = u.id
      JOIN cursos c ON i.curso_id = c.id
      ORDER BY i.fecha_inscripcion DESC
      LIMIT 10
    `);

    // Distribución por categoría
    const [porCategoria] = await db.execute(`
      SELECT categoria, COUNT(*) AS total
      FROM cursos
      WHERE activo = 1 AND categoria IS NOT NULL
      GROUP BY categoria
      ORDER BY total DESC
    `);

    res.json({
      success: true,
      data: {
        stats,
        cursosTop,
        actividadReciente,
        porCategoria,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
