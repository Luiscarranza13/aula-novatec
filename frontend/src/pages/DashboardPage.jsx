import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Calendar, Award, TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useCourseStore } from '../store/useCourseStore';
import { cursoService, inscripcionService, usuarioService } from '../services/api';

const Card = ({ children, style }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', ...style }}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, title, value, iconBg, iconColor }) => (
  <Card>
    <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{title}</p>
        <p style={{ fontSize: 32, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{value}</p>
      </div>
      <div style={{ padding: 12, background: iconBg, borderRadius: 12 }}>
        <Icon color={iconColor} size={22} />
      </div>
    </div>
  </Card>
);

export const DashboardPage = () => {
  const { courses, enrollments, setCourses, setEnrollments } = useCourseStore();
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [c, e, u] = await Promise.all([
        cursoService.obtenerTodos(),
        inscripcionService.obtenerTodos(),
        usuarioService.obtenerTodos(),
      ]);
      setCourses(Array.isArray(c.data) ? c.data : []);
      setEnrollments(Array.isArray(e.data) ? e.data : []);
      setUsuarios(Array.isArray(u.data) ? u.data : []);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    }
  };

  const safeUsuarios = Array.isArray(usuarios) ? usuarios : [];
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];

  const estudiantes = safeUsuarios.filter(u => u.rol === 'estudiante');
  const profesores = safeUsuarios.filter(u => u.rol === 'profesor');

  const cursosTop = safeCourses.map(c => ({
    ...c,
    total: safeEnrollments.filter(e => e.curso_id === c.id).length
  })).sort((a, b) => b.total - a.total).slice(0, 5);

  const maxVal = Math.max(...cursosTop.map(c => c.total), 1);
  const barColors = ['#4f46e5', '#7c3aed', '#059669', '#f59e0b', '#3b82f6'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Resumen del sistema educativo</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon={BookOpen} title="Total Cursos" value={safeCourses.length} iconBg="#eff6ff" iconColor="#2563eb" />
        <StatCard icon={Users} title="Estudiantes" value={estudiantes.length} iconBg="#f0fdf4" iconColor="#16a34a" />
        <StatCard icon={Calendar} title="Inscripciones" value={safeEnrollments.length} iconBg="#faf5ff" iconColor="#7c3aed" />
        <StatCard icon={Award} title="Profesores" value={profesores.length} iconBg="#fff7ed" iconColor="#ea580c" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <Card>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>Cursos más populares</p>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cursosTop.length > 0 ? cursosTop.map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#475569', width: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.titulo}</span>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 99, height: 8 }}>
                  <div style={{ height: 8, borderRadius: 99, background: barColors[i], width: `${Math.min((c.total / maxVal) * 100, 100)}%` }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', width: 20, textAlign: 'right' }}>{c.total}</span>
              </div>
            )) : <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0', margin: 0 }}>Sin datos aún</p>}
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>Actividad Reciente</p>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {safeEnrollments.length > 0 ? safeEnrollments.slice(0, 6).map((e, i) => (
              <div key={e.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 28, height: 28, background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={12} color="#4f46e5" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.usuario_nombre}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>→ {e.curso_titulo}</p>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Clock size={28} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Sin actividad</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4', label: 'Tasa de inscripción', value: `${estudiantes.length > 0 ? Math.round((safeEnrollments.length / estudiantes.length) * 100) : 0}%` },
          { icon: BookOpen, color: '#2563eb', bg: '#eff6ff', label: 'Promedio por curso', value: `${safeCourses.length > 0 ? (safeEnrollments.length / safeCourses.length).toFixed(1) : 0} alumnos` },
          { icon: AlertCircle, color: '#7c3aed', bg: '#faf5ff', label: 'Cursos sin inscritos', value: safeCourses.filter(c => !safeEnrollments.some(e => e.curso_id === c.id)).length },
        ].map(({ icon: Icon, color, bg, label, value }) => (
          <Card key={label}>
            <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 10, background: bg, borderRadius: 10 }}><Icon color={color} size={20} /></div>
              <div>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
