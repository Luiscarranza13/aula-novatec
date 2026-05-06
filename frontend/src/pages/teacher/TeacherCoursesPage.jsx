import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Clock, Tag } from 'lucide-react';
import { cursoService, inscripcionService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

const ACCENT = '#d97706';

export const TeacherCoursesPage = () => {
  const { user } = useAuthStore();
  const [cursos, setCursos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cursoService.obtenerTodos({ limit: 100 }),
      inscripcionService.obtenerTodos({ limit: 200 }),
    ]).then(([c, ins]) => {
      const todos = Array.isArray(c.data) ? c.data : [];
      setCursos(todos.filter(c => c.profesor_id === user?.id));
      setInscripciones(Array.isArray(ins.data) ? ins.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Mis Cursos</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{cursos.length} curso{cursos.length !== 1 ? 's' : ''} asignado{cursos.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>
      ) : cursos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <BookOpen size={48} color="#fde68a" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>No tienes cursos asignados</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {cursos.map(c => {
            const alumnos = inscripciones.filter(i => i.curso_id === c.id).length;
            return (
              <div key={c.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #fde68a', overflow: 'hidden', boxShadow: '0 1px 4px rgba(217,119,6,0.07)' }}>
                <div style={{ height: 6, background: `linear-gradient(90deg, ${ACCENT}, #fbbf24)` }} />
                <div style={{ padding: 20 }}>
                  <div style={{ width: 44, height: 44, background: '#fef3c7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <BookOpen size={20} color={ACCENT} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 8px', lineHeight: 1.3 }}>{c.titulo}</h3>
                  {c.descripcion && <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.descripcion}</p>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
                      <Users size={12} color={ACCENT} /> {alumnos} alumno{alumnos !== 1 ? 's' : ''}
                    </div>
                    {c.duracion_horas > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
                        <Clock size={12} color={ACCENT} /> {c.duracion_horas}h
                      </div>
                    )}
                    {c.categoria && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
                        <Tag size={12} color={ACCENT} /> {c.categoria}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
