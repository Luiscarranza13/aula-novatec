import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Search } from 'lucide-react';
import { cursoService, inscripcionService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

const ACCENT = '#d97706';

export const TeacherStudentsPage = () => {
  const { user } = useAuthStore();
  const [alumnos, setAlumnos] = useState([]);
  const [cursoFiltro, setCursoFiltro] = useState('');
  const [cursos, setCursos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cursoService.obtenerTodos({ limit: 100 }),
      inscripcionService.obtenerTodos({ limit: 200 }),
    ]).then(([c, ins]) => {
      const misCursos = (c.data || []).filter(x => x.profesor_id === user?.id);
      setCursos(misCursos);
      const misIns = (ins.data || []).filter(i => misCursos.some(c => c.id === i.curso_id));
      setAlumnos(misIns);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = alumnos.filter(a => {
    const matchCurso = !cursoFiltro || a.curso_id === parseInt(cursoFiltro);
    const matchSearch = !search || a.usuario_nombre?.toLowerCase().includes(search.toLowerCase());
    return matchCurso && matchSearch;
  });

  const alumnosUnicos = [...new Map(filtered.map(a => [a.usuario_id, a])).values()];

  const getInitials = (nombre) => nombre?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Mis Alumnos</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{alumnosUnicos.length} alumno{alumnosUnicos.length !== 1 ? 's' : ''} único{alumnosUnicos.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar alumno..."
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, height: 38, borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none', background: '#fffbeb', boxSizing: 'border-box' }} />
        </div>
        <select value={cursoFiltro} onChange={e => setCursoFiltro(e.target.value)}
          style={{ padding: '0 12px', height: 38, borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none', background: '#fffbeb', minWidth: 180 }}>
          <option value="">Todos los cursos</option>
          {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>
      ) : alumnosUnicos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Users size={48} color="#fde68a" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Sin alumnos inscritos</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {alumnosUnicos.map(a => {
            const cursosDel = alumnos.filter(x => x.usuario_id === a.usuario_id);
            return (
              <div key={a.usuario_id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #fde68a', padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, background: ACCENT, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{getInitials(a.usuario_nombre)}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.usuario_nombre}</p>
                    <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{a.usuario_email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {cursosDel.map(ins => (
                    <div key={ins.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', background: '#fffbeb', padding: '5px 8px', borderRadius: 7 }}>
                      <BookOpen size={11} color={ACCENT} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ins.curso_titulo}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
