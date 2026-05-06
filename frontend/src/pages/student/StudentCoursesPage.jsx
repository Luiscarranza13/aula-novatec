import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, User, CheckCircle, Search } from 'lucide-react';
import { inscripcionService } from '../../services/api';

const ACCENT = '#059669';

export const StudentCoursesPage = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inscripcionService.obtenerTodos().then(r => {
      setInscripciones(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = inscripciones.filter(i =>
    i.curso_titulo?.toLowerCase().includes(search.toLowerCase())
  );

  const estadoColor = (estado) => {
    if (estado === 'completada') return { bg: '#d1fae5', color: '#059669' };
    if (estado === 'cancelada') return { bg: '#fee2e2', color: '#dc2626' };
    return { bg: '#dbeafe', color: '#2563eb' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Mis Cursos</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          {inscripciones.length} curso{inscripciones.length !== 1 ? 's' : ''} inscrito{inscripciones.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative', maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar curso..."
          style={{ width: '100%', paddingLeft: 34, paddingRight: 12, height: 38, borderRadius: 9, border: '1px solid #d1fae5', fontSize: 13, outline: 'none', background: '#f0fdf4' }}
        />
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <BookOpen size={48} color="#d1fae5" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>No tienes cursos inscritos aún</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(ins => {
            const { bg, color } = estadoColor(ins.estado);
            return (
              <div key={ins.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #d1fae5', boxShadow: '0 1px 4px rgba(5,150,105,0.07)', overflow: 'hidden' }}>
                {/* Header color */}
                <div style={{ height: 6, background: `linear-gradient(90deg, ${ACCENT}, #34d399)` }} />
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 42, height: 42, background: '#d1fae5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} color={ACCENT} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: bg, color }}>
                      {ins.estado || 'activa'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>{ins.curso_titulo}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 12 }}>
                    {ins.profesor_nombre && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                        <User size={12} color={ACCENT} />
                        <span>Prof. {ins.profesor_nombre}</span>
                      </div>
                    )}
                    {ins.duracion_horas > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                        <Clock size={12} color={ACCENT} />
                        <span>{ins.duracion_horas} horas</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                      <CheckCircle size={12} color={ACCENT} />
                      <span>Inscrito el {new Date(ins.fecha_inscripcion).toLocaleDateString('es-ES')}</span>
                    </div>
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
