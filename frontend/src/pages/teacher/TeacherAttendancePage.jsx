import React, { useEffect, useState } from 'react';
import { UserCheck, Save, Calendar } from 'lucide-react';
import { asistenciaService, cursoService, inscripcionService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import Swal from 'sweetalert2';

const ACCENT = '#d97706';

export const TeacherAttendancePage = () => {
  const { user } = useAuthStore();
  const [cursos, setCursos] = useState([]);
  const [cursoActivo, setCursoActivo] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [asistencias, setAsistencias] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cursoService.obtenerTodos({ limit: 100 }).then(r => {
      const misCursos = (r.data || []).filter(c => c.profesor_id === user?.id);
      setCursos(misCursos);
      if (misCursos.length > 0) setCursoActivo(misCursos[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!cursoActivo) return;
    inscripcionService.obtenerTodos({ limit: 100 }).then(r => {
      const ins = (r.data || []).filter(i => i.curso_id === cursoActivo);
      setAlumnos(ins);
      // Inicializar todos como presentes
      const init = {};
      ins.forEach(a => { init[a.usuario_id] = true; });
      setAsistencias(init);
    }).catch(() => {});
  }, [cursoActivo]);

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await Promise.all(
        alumnos.map(a =>
          asistenciaService.registrar({
            usuario_id: a.usuario_id,
            curso_id: cursoActivo,
            fecha,
            presente: asistencias[a.usuario_id] ? 1 : 0,
          }).catch(() => {})
        )
      );
      Swal.fire({ icon: 'success', title: 'Asistencia registrada', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al guardar', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    } finally { setSaving(false); }
  };

  const presentes = Object.values(asistencias).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Asistencia</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Registra la asistencia de tus alumnos</p>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={cursoActivo || ''} onChange={e => setCursoActivo(parseInt(e.target.value))}
          style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none', background: '#fffbeb', minWidth: 200 }}>
          {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={15} color={ACCENT} />
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none', background: '#fffbeb' }} />
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>
      ) : alumnos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 14, border: '1px solid #fde68a' }}>
          <UserCheck size={40} color="#fde68a" style={{ margin: '0 auto 10px', display: 'block' }} />
          <p style={{ color: '#9ca3af', fontSize: 13 }}>Sin alumnos en este curso</p>
        </div>
      ) : (
        <>
          {/* Resumen */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ padding: '10px 18px', background: '#d1fae5', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#059669' }}>
              ✅ Presentes: {presentes}
            </div>
            <div style={{ padding: '10px 18px', background: '#fee2e2', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#dc2626' }}>
              ❌ Ausentes: {alumnos.length - presentes}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fde68a', overflow: 'hidden' }}>
            {alumnos.map((a, i) => (
              <div key={a.usuario_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < alumnos.length - 1 ? '1px solid #fef3c7' : 'none', background: i % 2 === 0 ? '#fff' : '#fffdf7' }}>
                <div style={{ width: 38, height: 38, background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{a.usuario_nombre?.charAt(0)}</span>
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#111827' }}>{a.usuario_nombre}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setAsistencias(prev => ({ ...prev, [a.usuario_id]: true }))}
                    style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: asistencias[a.usuario_id] ? '#d1fae5' : '#f1f5f9', color: asistencias[a.usuario_id] ? '#059669' : '#9ca3af' }}>
                    ✅ Presente
                  </button>
                  <button onClick={() => setAsistencias(prev => ({ ...prev, [a.usuario_id]: false }))}
                    style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: !asistencias[a.usuario_id] ? '#fee2e2' : '#f1f5f9', color: !asistencias[a.usuario_id] ? '#dc2626' : '#9ca3af' }}>
                    ❌ Ausente
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleGuardar} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', opacity: saving ? 0.7 : 1 }}>
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Asistencia'}
          </button>
        </>
      )}
    </div>
  );
};
