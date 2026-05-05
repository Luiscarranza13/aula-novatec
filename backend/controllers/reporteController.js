const db = require('../database/db');
const { createObjectCsvStringifier } = require('csv-writer');

const csvHeaders = {
  calificaciones: [
    { id: 'usuario_nombre', title: 'Estudiante' },
    { id: 'curso_titulo', title: 'Curso' },
    { id: 'nota', title: 'Nota' },
    { id: 'comentario', title: 'Comentario' },
    { id: 'fecha', title: 'Fecha' },
  ],
  inscripciones: [
    { id: 'usuario_nombre', title: 'Usuario' },
    { id: 'usuario_email', title: 'Email' },
    { id: 'curso_titulo', title: 'Curso' },
    { id: 'fecha_inscripcion', title: 'Fecha Inscripción' },
    { id: 'estado', title: 'Estado' },
  ],
  asistencias: [
    { id: 'usuario_nombre', title: 'Estudiante' },
    { id: 'curso_titulo', title: 'Curso' },
    { id: 'fecha', title: 'Fecha' },
    { id: 'presente', title: 'Presente' },
    { id: 'observacion', title: 'Observación' },
  ],
};

exports.exportar = async (req, res, next) => {
  try {
    const { tipo, curso_id } = req.query;
    if (!csvHeaders[tipo]) return res.status(400).json({ success: false, message: 'Tipo inválido' });

    let rows = [];
    const whereExtra = curso_id ? ' AND c.id = ?' : '';
    const params = curso_id ? [curso_id] : [];

    if (tipo === 'calificaciones') {
      [rows] = await db.execute(
        `SELECT u.nombre AS usuario_nombre, c.titulo AS curso_titulo, cal.nota, cal.comentario, cal.fecha
         FROM calificaciones cal JOIN usuarios u ON cal.usuario_id=u.id JOIN cursos c ON cal.curso_id=c.id
         WHERE 1=1${whereExtra} ORDER BY c.titulo, u.nombre`, params
      );
    } else if (tipo === 'inscripciones') {
      [rows] = await db.execute(
        `SELECT u.nombre AS usuario_nombre, u.email AS usuario_email, c.titulo AS curso_titulo,
           i.fecha_inscripcion, i.estado
         FROM inscripciones i JOIN usuarios u ON i.usuario_id=u.id JOIN cursos c ON i.curso_id=c.id
         WHERE 1=1${whereExtra} ORDER BY c.titulo, u.nombre`, params
      );
    } else if (tipo === 'asistencias') {
      [rows] = await db.execute(
        `SELECT u.nombre AS usuario_nombre, c.titulo AS curso_titulo, a.fecha,
           IF(a.presente, 'Sí', 'No') AS presente, a.observacion
         FROM asistencias a JOIN usuarios u ON a.usuario_id=u.id JOIN cursos c ON a.curso_id=c.id
         WHERE 1=1${whereExtra} ORDER BY a.fecha DESC, u.nombre`, params
      );
    }

    const csv = createObjectCsvStringifier({ header: csvHeaders[tipo] });
    const content = csv.getHeaderString() + csv.stringifyRecords(rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${tipo}-${Date.now()}.csv"`);
    res.send('\uFEFF' + content); // BOM para Excel
  } catch (err) { next(err); }
};

exports.estadisticas = async (req, res, next) => {
  try {
    const [[totales]] = await db.execute(
      `SELECT
         (SELECT COUNT(*) FROM usuarios WHERE rol='estudiante') AS estudiantes,
         (SELECT COUNT(*) FROM usuarios WHERE rol='profesor') AS profesores,
         (SELECT COUNT(*) FROM cursos) AS cursos,
         (SELECT COUNT(*) FROM inscripciones) AS inscripciones,
         (SELECT ROUND(AVG(nota),1) FROM calificaciones) AS promedio_general,
         (SELECT COUNT(*) FROM calificaciones WHERE nota >= 60) AS aprobados,
         (SELECT COUNT(*) FROM calificaciones WHERE nota < 60) AS reprobados`
    );
    const [porCategoria] = await db.execute(
      `SELECT categoria, COUNT(*) AS total FROM cursos WHERE categoria IS NOT NULL GROUP BY categoria`
    );
    const [notasPorCurso] = await db.execute(
      `SELECT c.titulo, ROUND(AVG(cal.nota),1) AS promedio, COUNT(cal.id) AS total
       FROM cursos c LEFT JOIN calificaciones cal ON cal.curso_id=c.id
       GROUP BY c.id, c.titulo ORDER BY promedio DESC LIMIT 10`
    );
    res.json({ success: true, data: { totales, porCategoria, notasPorCurso } });
  } catch (err) { next(err); }
};
