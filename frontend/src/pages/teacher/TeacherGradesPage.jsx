import React, { useEffect, useState } from 'react';
import { Award, Save, BookOpen } from 'lucide-react';
import { calificacionService, cursoService, inscripcionService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import Swal from 'sweetalert2';

const ACCENT = '#d97706';

export const TeacherGradesPage = () => {
  const { user } = useAuthStore();
  const [cursos, setCursos] = useState([]);
  const [cursoActivo, setCursoActivo] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [editando, setEditando] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cursoService.obtenerTodos({ limit: 100 }),
      calificacionService.obtenerTodos({ limit: 200 }),
    ]).then(([c, cal]) => {
      const misCursos = (c.data || []).filter(x => x.profesor_id === user?.id);
      setCursos(misCursos);
      setCalificaciones(Array.isArray(cal.data) ? cal.data : []);
      if (misCursos.length > 0) setCursoActivo(misCursos[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!cursoActivo) return;
    inscripcionService.obtenerTodos({ limit: 100 }).then(r => {
      const ins = (r.data || []).filter(i => i.curso_id === cursoActivo);
      setAlumnos(ins);
    }).catch(() => {});
  }, [cursoActivo]);

  const getCalif = (usuario_id) => calificaciones.find(c => c.usuario_id === usuario_id && c.curso_id === cursoActivo);

  const handleGuardar = async (usuario_id) => {
    const val = editando[usuario_id];
    if (val === undefined || val === '') return;
    const nota = parseFloat(val);
    if (isNaN(nota) || nota < 0 || nota > 100) {
      Swal.fire({ icon: 'warning', title: 'Nota inválida (0-100)', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      return;
    }
    try {
      const existing = getCalif(usuario_id);
      if (existing) {
        await calificacionService.actualizar(existing.id, { nota, comentario: editando[`com_${usuario_id}`] || existing.comentario });
      } else {
        await calificacionService.crear({ usuario_id, curso_id: cursoActivo, nota, comentario: editando[`com_${usuario_id}`] || '' });
      }
      Swal.fire({ icon: 'success', title: 'Calificación guardada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
      const cal = await calificacionService.obtenerTodos({ limit: 200 });
      setCalificaciones(Array.isArray(cal.data) ? cal.data : []);
      setEditando(prev => { const n = { ...prev }; delete n[usuario_id]; delete n[`com_${usuario_id}`]; return n; });
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  const getNotaColor = (nota) => {
    if (nota >= 90) return '#059669';
    if (nota >= 75) return '#2563eb';
    if (nota >= 60) return '#d97706';
    return '#dc2626';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Calificaciones</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Gestiona las notas de tus alumnos</p>
      </div>

      {/* Selector de curso */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {cursos.map(c => (
          <button key={c.id} onClick={() => setCursoActivo(c.id)}
            style={{ padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: cursoActivo === c.id ? 700 : 400, background: cursoActivo === c.id ? ACCENT : '#fef3c7', color: cursoActivo === c.id ? '#fff' : '#78350f' }}>
            {c.titulo}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>
      ) : alumnos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 14, border: '1px solid #fde68a' }}>
          <Award size={40} color="#fde68a" style={{ margin: '0 auto 10px', display: 'block' }} />
          <p style={{ color: '#9ca3af', fontSize: 13 }}>Sin alumnos en este curso</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fde68a', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fffbeb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#78350f' }}>Alumno</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#78350f' }}>Nota actual</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#78350f' }}>Nueva nota</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#78350f' }}>Comentario</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#78350f' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((a, i) => {
                const cal = getCalif(a.usuario_id);
                return (
                  <tr key={a.usuario_id} style={{ borderTop: '1px solid #fef3c7', background: i % 2 === 0 ? '#fff' : '#fffdf7' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>{a.usuario_nombre?.charAt(0)}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{a.usuario_nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {cal ? (
                        <span style={{ fontSize: 18, fontWeight: 800, color: getNotaColor(cal.nota) }}>{cal.nota}</span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>Sin nota</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="number" min={0} max={100} placeholder={cal?.nota || '0-100'}
                        value={editando[a.usuario_id] ?? ''}
                        onChange={e => setEditando(prev => ({ ...prev, [a.usuario_id]: e.target.value }))}
                        style={{ width: 70, padding: '6px 8px', borderRadius: 7, border: '1px solid #fde68a', fontSize: 13, outline: 'none', textAlign: 'center' }} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <input placeholder="Comentario..."
                        value={editando[`com_${a.usuario_id}`] ?? cal?.comentario ?? ''}
                        onChange={e => setEditando(prev => ({ ...prev, [`com_${a.usuario_id}`]: e.target.value }))}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 7, border: '1px solid #fde68a', fontSize: 13, outline: 'none' }} />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button onClick={() => handleGuardar(a.usuario_id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', margin: '0 auto' }}>
                        <Save size={12} /> Guardar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
