/**
 * Estadísticas del curso para el profesor
 * Mejora #63 — Estadísticas del curso
 * Mejora #58 — Gráfica de rendimiento
 */
import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { cursoService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const ACCENT = '#d97706';

export const TeacherStatsPage = () => {
  const { user } = useAuthStore();
  const [cursos, setCursos] = useState([]);
  const [cursoActivo, setCursoActivo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cursoService.obtenerTodos({ limit: 100 }).then(r => {
      const misCursos = (r.data || []).filter(c => c.profesor_id === user?.id);
      setCursos(misCursos);
      if (misCursos.length > 0) setCursoActivo(misCursos[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!cursoActivo) return;
    api.get(`/progreso/cursos/${cursoActivo}/progreso`).then(r => {
      setStats(r.data?.data || null);
    }).catch(() => setStats(null));
  }, [cursoActivo]);

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #111827)', margin: 0 }}>Estadísticas del Curso</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #6b7280)', marginTop: 4 }}>Análisis de rendimiento de tus alumnos</p>
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
      ) : !stats ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Sin datos para este curso</p>
      ) : (
        <>
          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            {[
              { label: 'Total Alumnos', value: stats.stats?.total_alumnos || 0, color: '#2563eb', bg: '#dbeafe' },
              { label: 'Promedio Grupo', value: stats.stats?.promedio_grupo ? `${stats.stats.promedio_grupo}` : '—', color: ACCENT, bg: '#fef3c7' },
              { label: 'Calificados', value: stats.stats?.alumnos_calificados || 0, color: '#059669', bg: '#d1fae5' },
              { label: 'Tasa Entrega', value: stats.stats?.tasa_entrega ? `${stats.stats.tasa_entrega}%` : '—', color: '#7c3aed', bg: '#ede9fe' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--card-bg, #fff)', borderRadius: 12, border: '1px solid #fde68a', padding: '16px 18px' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted, #6b7280)', margin: '0 0 4px' }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Distribución de notas */}
          {stats.distribucion?.length > 0 && (
            <div style={{ background: 'var(--card-bg, #fff)', borderRadius: 14, border: '1px solid #fde68a', padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #111827)', margin: '0 0 16px' }}>Distribución de Notas</h3>
              <div style={{ maxWidth: 400 }}>
                <Doughnut
                  data={{
                    labels: stats.distribucion.map(d => d.rango),
                    datasets: [{
                      data: stats.distribucion.map(d => d.cantidad),
                      backgroundColor: ['#059669', '#2563eb', '#d97706', '#dc2626'],
                      borderWidth: 0,
                    }],
                  }}
                  options={{ responsive: true, plugins: { legend: { position: 'right' } } }}
                />
              </div>
            </div>
          )}

          {/* Asistencia */}
          {stats.asistencia && (
            <div style={{ background: 'var(--card-bg, #fff)', borderRadius: 14, border: '1px solid #fde68a', padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #111827)', margin: '0 0 16px' }}>Asistencia</h3>
              <div style={{ display: 'flex', gap: 20 }}>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted, #6b7280)', margin: '0 0 4px' }}>Promedio de asistencia</p>
                  <p style={{ fontSize: 32, fontWeight: 800, color: ACCENT, margin: 0 }}>{stats.asistencia.porcentaje_promedio || 0}%</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted, #6b7280)', margin: '0 0 4px' }}>Clases registradas</p>
                  <p style={{ fontSize: 32, fontWeight: 800, color: '#2563eb', margin: 0 }}>{stats.asistencia.clases_registradas || 0}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
