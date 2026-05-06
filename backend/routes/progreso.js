/**
 * Endpoints de progreso y estadísticas
 * Mejora #21 — GET /api/alumnos/:id/estadisticas
 * Mejora #22 — GET /api/cursos/:id/progreso
 */
const router = require('express').Router();
const db = require('../database/db');
const { auth } = require('../middleware/auth');

router.use(auth);

// Estadísticas de un alumno
router.get('/alumnos/:id/estadisticas', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Solo el propio alumno o admin/profesor pueden ver
    if (req.user.rol === 'estudiante' && req.user.userId !== parseInt(id)) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    const [[alumno]] = await db.execute(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?', [id]
    );
    if (!alumno) return res.status(404).json({ success: false, message: 'Alumno no encontrado' });

    const [[calStats]] = await db.execute(`
      SELECT
        COUNT(*) AS total_calificaciones,
        ROUND(AVG(nota), 1) AS promedio,
        MAX(nota) AS nota_maxima,
        MIN(nota) AS nota_minima,
        SUM(CASE WHEN nota >= 60 THEN 1 ELSE 0 END) AS aprobados,
        SUM(CASE WHEN nota < 60 THEN 1 ELSE 0 END) AS reprobados
      FROM calificaciones WHERE usuario_id = ?
    `, [id]);

    const [[asistStats]] = await db.execute(`
      SELECT
        COUNT(*) AS total_clases,
        SUM(presente) AS presentes,
        ROUND(SUM(presente) / NULLIF(COUNT(*), 0) * 100, 1) AS porcentaje_asistencia
      FROM asistencias WHERE usuario_id = ?
    `, [id]);

    const [[tareaStats]] = await db.execute(`
      SELECT
        COUNT(DISTINCT t.id) AS total_tareas,
        COUNT(DISTINCT e.id) AS tareas_entregadas,
        COUNT(DISTINCT CASE WHEN e.estado = 'calificado' THEN e.id END) AS tareas_calificadas,
        ROUND(AVG(e.calificacion), 1) AS promedio_tareas
      FROM inscripciones i
      JOIN tareas t ON t.curso_id = i.curso_id
      LEFT JOIN entregas e ON e.tarea_id = t.id AND e.usuario_id = ?
      WHERE i.usuario_id = ?
    `, [id, id]);

    const [cursos] = await db.execute(`
      SELECT c.titulo, c.categoria, i.estado, i.fecha_inscripcion,
             cal.nota, cal.comentario
      FROM inscripciones i
      JOIN cursos c ON i.curso_id = c.id
      LEFT JOIN calificaciones cal ON cal.usuario_id = i.usuario_id AND cal.curso_id = i.curso_id
      WHERE i.usuario_id = ?
      ORDER BY i.fecha_inscripcion DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        alumno,
        calificaciones: calStats,
        asistencia: asistStats,
        tareas: tareaStats,
        cursos,
      },
    });
  } catch (err) { next(err); }
});

// Progreso de un curso
router.get('/cursos/:id/progreso', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [[curso]] = await db.execute(
      'SELECT id, titulo, descripcion, categoria, duracion_horas FROM cursos WHERE id = ?', [id]
    );
    if (!curso) return res.status(404).json({ success: false, message: 'Curso no encontrado' });

    const [[stats]] = await db.execute(`
      SELECT
        COUNT(DISTINCT i.usuario_id) AS total_alumnos,
        COUNT(DISTINCT i.id) AS total_inscripciones,
        ROUND(AVG(cal.nota), 1) AS promedio_grupo,
        COUNT(DISTINCT cal.id) AS alumnos_calificados,
        COUNT(DISTINCT t.id) AS total_tareas,
        COUNT(DISTINCT e.id) AS total_entregas,
        ROUND(COUNT(DISTINCT e.id) / NULLIF(COUNT(DISTINCT t.id) * COUNT(DISTINCT i.usuario_id), 0) * 100, 1) AS tasa_entrega
      FROM inscripciones i
      LEFT JOIN calificaciones cal ON cal.curso_id = i.curso_id AND cal.usuario_id = i.usuario_id
      LEFT JOIN tareas t ON t.curso_id = i.curso_id
      LEFT JOIN entregas e ON e.tarea_id = t.id
      WHERE i.curso_id = ?
    `, [id]);

    // Distribución de notas
    const [distribucion] = await db.execute(`
      SELECT
        CASE
          WHEN nota >= 90 THEN 'Excelente (90-100)'
          WHEN nota >= 75 THEN 'Bueno (75-89)'
          WHEN nota >= 60 THEN 'Regular (60-74)'
          ELSE 'Insuficiente (<60)'
        END AS rango,
        COUNT(*) AS cantidad
      FROM calificaciones
      WHERE curso_id = ?
      GROUP BY rango
      ORDER BY MIN(nota) DESC
    `, [id]);

    // Asistencia promedio
    const [[asistencia]] = await db.execute(`
      SELECT
        ROUND(AVG(presente) * 100, 1) AS porcentaje_promedio,
        COUNT(DISTINCT fecha) AS clases_registradas
      FROM asistencias WHERE curso_id = ?
    `, [id]);

    res.json({
      success: true,
      data: { curso, stats, distribucion, asistencia },
    });
  } catch (err) { next(err); }
});

module.exports = router;
