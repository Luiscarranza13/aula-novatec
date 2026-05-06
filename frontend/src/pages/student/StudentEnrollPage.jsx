/**
 * Inscripción propia del alumno a cursos
 * Mejora #52 — Inscripción propia a cursos
 */
import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, Tag, UserPlus, CheckCircle, Search } from 'lucide-react';
import { cursoService, inscripcionService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { SkeletonCard } from '../../components/ui/Skeleton';
import Swal from 'sweetalert2';

const ACCENT = '#059669';

export const StudentEnrollPage = () => {
  const { user } = useAuthStore();
  const [cursos, setCursos] = useState([]);
  const [inscritos, setInscritos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    Promise.all([
      cursoService.obtenerTodos({ limit: 100, activo: 1 }),
      inscripcionService.obtenerTodos({ limit: 100 }),
    ]).then(([c, ins]) => {
      setCursos(Array.isArray(c.data) ? c.data : []);
      setInscritos((ins.data || []).map(i => i.curso_id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (curso_id, titulo) => {
    const result = await Swal.fire({
      title: '¿Inscribirse?',
      text: `Te inscribirás en "${titulo}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: ACCENT,
      confirmButtonText: 'Sí, inscribirme',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    setEnrolling(curso_id);
    try {
      await inscripcionService.crear({ usuario_id: user.id, curso_id });
      setInscritos(prev => [...prev, curso_id]);
      Swal.fire({ icon: 'success', title: '¡Inscripción exitosa!', text: `Ya estás inscrito en "${titulo}"`, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error al inscribirse', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    } finally { setEnrolling(null); }
  };

  const filtered = cursos.filter(c =>
    c.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    c.categoria?.toLowerCase().includes(search.toLowerCase())
  );

  const disponibles = filtered.filter(c => !inscritos.includes(c.id));
  const yaInscritos = filtered.filter(c => inscritos.includes(c.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #111827)', margin: 0 }}>Explorar Cursos</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #6b7280)', marginTop: 4 }}>
          {disponibles.length} curso{disponibles.length !== 1 ? 's' : ''} disponible{disponibles.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ position: 'relative', maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cursos..."
          style={{ width: '100%', paddingLeft: 34, paddingRight: 12, height: 38, borderRadius: 9, border: '1px solid #d1fae5', fontSize: 13, outline: 'none', background: '#f0fdf4', boxSizing: 'border-box' }} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {disponibles.length > 0 && (
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary, #374151)', marginBottom: 14 }}>📚 Disponibles para inscribirse</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {disponibles.map(c => (
                  <div key={c.id} style={{ background: 'var(--card-bg, #fff)', borderRadius: 14, border: '1px solid #d1fae5', overflow: 'hidden' }}>
                    <div style={{ height: 5, background: `linear-gradient(90deg, ${ACCENT}, #34d399)` }} />
                    <div style={{ padding: 18 }}>
                      <div style={{ width: 40, height: 40, background: '#d1fae5', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <BookOpen size={18} color={ACCENT} />
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #111827)', margin: '0 0 6px', lineHeight: 1.3 }}>{c.titulo}</h3>
                      {c.descripcion && <p style={{ fontSize: 12, color: 'var(--text-muted, #6b7280)', margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.descripcion}</p>}
                      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                        {c.categoria && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: ACCENT, background: '#d1fae5', padding: '2px 8px', borderRadius: 99 }}>
                            <Tag size={10} /> {c.categoria}
                          </span>
                        )}
                        {c.duracion_horas > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                            <Clock size={10} /> {c.duracion_horas}h
                          </span>
                        )}
                      </div>
                      <button onClick={() => handleEnroll(c.id, c.titulo)} disabled={enrolling === c.id}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: enrolling === c.id ? 0.7 : 1 }}>
                        <UserPlus size={14} /> {enrolling === c.id ? 'Inscribiendo...' : 'Inscribirme'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {yaInscritos.length > 0 && (
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary, #374151)', marginBottom: 14 }}>✅ Ya inscrito</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                {yaInscritos.map(c => (
                  <div key={c.id} style={{ background: '#f0fdf4', borderRadius: 12, border: '1px solid #a7f3d0', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle size={20} color={ACCENT} style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #111827)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.titulo}</p>
                      {c.categoria && <p style={{ fontSize: 11, color: ACCENT, margin: '2px 0 0' }}>{c.categoria}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {disponibles.length === 0 && yaInscritos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <BookOpen size={48} color="#d1fae5" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#9ca3af', fontSize: 14 }}>No hay cursos disponibles</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
