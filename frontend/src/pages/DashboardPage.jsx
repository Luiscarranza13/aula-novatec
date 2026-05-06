import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Calendar, Award, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { dashboardService } from '../services/api';
import { SkeletonDashboard } from '../components/ui/Skeleton';

const DashCard = ({ children, style }) => (
  <div style={{
    background: 'var(--card-bg, #fff)',
    borderRadius: 12,
    border: '1px solid var(--border, #e2e8f0)',
    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))',
    ...style,
  }}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, title, value, iconBg, iconColor }) => (
  <DashCard>
    <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #64748b)', fontWeight: 500, margin: 0 }}>{title}</p>
        <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary, #1e293b)', marginTop: 4, marginBottom: 0 }}>{value}</p>
      </div>
      <div style={{ padding: 12, background: iconBg, borderRadius: 12 }}>
        <Icon color={iconColor} size={22} />
      </div>
    </div>
  </DashCard>
);

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.stats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonDashboard />;

  const s = stats?.stats || {};
  const cursosTop = stats?.cursosTop || [];
  const actividadReciente = stats?.actividadReciente || [];
  const maxVal = Math.max(...cursosTop.map(c => c.inscripciones), 1);
  const barColors = ['#4f46e5', '#7c3aed', '#059669', '#f59e0b', '#3b82f6'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary, #1e293b)', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #64748b)', marginTop: 4 }}>Resumen del sistema educativo</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon={BookOpen}  title="Total Cursos"    value={s.total_cursos      ?? 0} iconBg="#eff6ff" iconColor="#2563eb" />
        <StatCard icon={Users}     title="Estudiantes"     value={s.total_estudiantes ?? 0} iconBg="#f0fdf4" iconColor="#16a34a" />
        <StatCard icon={Calendar}  title="Inscripciones"   value={s.total_inscripciones ?? 0} iconBg="#faf5ff" iconColor="#7c3aed" />
        <StatCard icon={Award}     title="Profesores"      value={s.total_profesores  ?? 0} iconBg="#fff7ed" iconColor="#ea580c" />
      </div>

      {/* Cursos populares + Actividad */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <DashCard>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle, #f1f5f9)' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary, #1e293b)', margin: 0 }}>Cursos más populares</p>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cursosTop.length > 0 ? cursosTop.map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted, #475569)', width: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.titulo}
                </span>
                <div style={{ flex: 1, background: 'var(--bg-subtle, #f1f5f9)', borderRadius: 99, height: 8 }}>
                  <div style={{
                    height: 8, borderRadius: 99,
                    background: barColors[i % barColors.length],
                    width: `${Math.min((c.inscripciones / maxVal) * 100, 100)}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #334155)', width: 20, textAlign: 'right' }}>
                  {c.inscripciones}
                </span>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: 13, textAlign: 'center', padding: '24px 0', margin: 0 }}>
                Sin datos aún
              </p>
            )}
          </div>
        </DashCard>

        <DashCard>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle, #f1f5f9)' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary, #1e293b)', margin: 0 }}>Actividad Reciente</p>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {actividadReciente.length > 0 ? actividadReciente.slice(0, 6).map((e, i) => (
              <div key={e.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 28, height: 28, background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={12} color="#4f46e5" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #1e293b)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.usuario_nombre}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted, #94a3b8)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    → {e.curso_titulo}
                  </p>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Clock size={28} color="#cbd5e1" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: 13, margin: 0 }}>Sin actividad</p>
              </div>
            )}
          </div>
        </DashCard>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4', label: 'Promedio general',  value: s.promedio_general  ? `${s.promedio_general}` : '—' },
          { icon: BookOpen,    color: '#2563eb', bg: '#eff6ff', label: 'Aprobados',          value: s.total_aprobados  ?? 0 },
          { icon: AlertCircle, color: '#dc2626', bg: '#fef2f2', label: 'Reprobados',         value: s.total_reprobados ?? 0 },
        ].map(({ icon: Icon, color, bg, label, value }) => (
          <DashCard key={label}>
            <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 10, background: bg, borderRadius: 10 }}>
                <Icon color={color} size={20} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary, #1e293b)', margin: 0 }}>{value}</p>
              </div>
            </div>
          </DashCard>
        ))}
      </div>
    </div>
  );
};
