const db = require('../database/db');
const PDFDocument = require('pdfkit');

exports.generar = async (req, res, next) => {
  try {
    const { usuario_id, curso_id } = req.params;

    // Verificar que el estudiante aprobó
    const [[cal]] = await db.execute(
      `SELECT cal.nota, u.nombre AS usuario_nombre, c.titulo AS curso_titulo,
         p.nombre AS profesor_nombre, cal.fecha
       FROM calificaciones cal
       JOIN usuarios u ON cal.usuario_id = u.id
       JOIN cursos c ON cal.curso_id = c.id
       LEFT JOIN usuarios p ON c.profesor_id = p.id
       WHERE cal.usuario_id=? AND cal.curso_id=?`,
      [usuario_id, curso_id]
    );

    if (!cal) return res.status(404).json({ success: false, message: 'No se encontró calificación' });
    if (cal.nota < 60) return res.status(400).json({ success: false, message: 'El estudiante no aprobó el curso' });

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 60 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificado-${usuario_id}-${curso_id}.pdf"`);
    doc.pipe(res);

    const W = doc.page.width;
    const H = doc.page.height;

    // Fondo
    doc.rect(0, 0, W, H).fill('#f8f7ff');

    // Borde decorativo
    doc.rect(20, 20, W - 40, H - 40).lineWidth(3).stroke('#4f46e5');
    doc.rect(28, 28, W - 56, H - 56).lineWidth(1).stroke('#c7d2fe');

    // Título
    doc.fillColor('#4f46e5').fontSize(36).font('Helvetica-Bold')
      .text('CERTIFICADO DE APROBACIÓN', 0, 80, { align: 'center' });

    // Línea decorativa
    doc.moveTo(100, 135).lineTo(W - 100, 135).lineWidth(2).stroke('#4f46e5');

    // Texto principal
    doc.fillColor('#1e293b').fontSize(16).font('Helvetica')
      .text('Se certifica que', 0, 160, { align: 'center' });

    doc.fillColor('#4f46e5').fontSize(28).font('Helvetica-Bold')
      .text(cal.usuario_nombre, 0, 190, { align: 'center' });

    doc.fillColor('#1e293b').fontSize(16).font('Helvetica')
      .text('ha completado satisfactoriamente el curso', 0, 240, { align: 'center' });

    doc.fillColor('#4f46e5').fontSize(22).font('Helvetica-Bold')
      .text(`"${cal.curso_titulo}"`, 0, 270, { align: 'center' });

    doc.fillColor('#475569').fontSize(14).font('Helvetica')
      .text(`con una calificación de ${cal.nota} / 100`, 0, 315, { align: 'center' });

    // Fecha
    const fecha = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
      .format(new Date(cal.fecha));
    doc.fillColor('#64748b').fontSize(12)
      .text(`Fecha de emisión: ${fecha}`, 0, 360, { align: 'center' });

    // Firma
    doc.moveTo(W / 2 - 80, 420).lineTo(W / 2 + 80, 420).lineWidth(1).stroke('#94a3b8');
    doc.fillColor('#475569').fontSize(11)
      .text(cal.profesor_nombre ? `Prof. ${cal.profesor_nombre}` : 'Aula Virtual', 0, 428, { align: 'center' });

    // Sello
    doc.fillColor('#4f46e5').fontSize(10)
      .text('🎓 Aula Virtual — Sistema Educativo', 0, H - 60, { align: 'center' });

    doc.end();
  } catch (err) { next(err); }
};
