import React, { useEffect, useState } from 'react';
import { Award, TrendingUp, BookOpen } from 'lucide-react';
import { calificacionService } from '../../services/api';

const ACCENT = '#059669';

const getNotaInfo = (nota) => {
  if (nota >= 90) return { color: '#059669', bg: '#d1fae5', label: 'Excelente' };
  if (nota >= 75) return { color: '#2563eb', bg: '#dbeafe', label: 'Bueno' };
  if (nota >= 60) return { color: '#d97706', bg: '#fef3c7', label: 'Regular' };
  return { color: '#dc2626', bg: '#fee2e2', label: 'Insuficiente' };
};

export const StudentGradesPage = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calificacionService.obtenerTodos().then(r => {
      setCalificaciones(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const promedio = calificaciones.length > 0
    ? (calificaciones.reduce((s, c) => s + parseFloat(c.nota || 0), 0) / calificaciones.length).toFixed(1)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Mis Calificaciones</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Historial de notas por curso</p>
      </div>

      {/* Promedio general */}
      {promedio && (
        <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: 16, padding: '24px 28px', color: '#fff', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={28} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Promedio General</p>
            <p style={{ margin: '4px 0 0', fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{promedio}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.75 }}>sobre 100 puntos · {calificaciones.length} curso{calificaciones.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>
      ) : calificaciones.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Award size={48} color="#d1fae5" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Aún no tienes calificaciones</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {calificaciones.map(cal => {
            const { color, bg, label } = getNotaInfo(cal.nota);
            return (
              <div key={cal.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #d1fae5', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, background: '#d1fae5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={20} color={ACCENT} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cal.curso_titulo}</p>
                  {cal.comentario && <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>{cal.comentario}</p>}
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '3px 0 0' }}>{new Date(cal.fecha).toLocaleDateString('es-ES')}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 32, fontWeight: 800, color, margin: 0, lineHeight: 1 }}>{cal.nota}</p>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: bg, color }}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
