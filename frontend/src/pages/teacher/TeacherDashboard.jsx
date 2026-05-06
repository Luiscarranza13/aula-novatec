import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ClipboardList, Award, TrendingUp, UserCheck, Megaphone, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { cursoService, inscripcionService, tareaService, anuncioService } from '../../services/api';

const ACCENT = '#d97706';
const ACCENT_LIGHT = '#fef3c7';

const Card = ({ children, style }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fde68a', boxShadow: '0 1px 4px rgba(217,119,6,0.07)', ...style }}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, title, value, sub, color, bg }) => (
  <Card>
    <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '2px 0 0' }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{sub}</p>}
      </div>
    </div>
  </Card>
);

export const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const [cursos, setCursos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [c, ins, tar, ann] = await Promise.all([
        cursoService.obtenerTodos({ limit: 100 }),
        inscripcionService.obtenerTodos({ limit: 100 }),
        tareaService.obtenerTodos(),
        anuncioService.obtenerTodos(),
      ]);
      setCursos(Array.isArray(c.data) ? c.data : []);
      setInscripciones(Array.isArray(ins.data) ? ins.data : []);
      setTareas(Array.isArray(tar.data) ? tar.data : []);
      setAnuncios(Array.isArray(ann.data) ? ann.data : []);
    } catch { } finally { setLoading(false); }
  };

  const misCursos = cursos.filter(c => c.profesor_id === user?.id);
  const misAlumnos = inscripciones.filter(i => misCursos.some(c => c.id === i.curso_id));
  const alumnosUnicos = [...new Set(misAlumnos.map(i => i.usuario_id))].length;
  const misTareas = tareas.filter(t => misCursos.some(c => c.id === t.curso_id));
  const pendientesCalificar = misTareas.reduce((s, t) => s + (t.total_entregas || 0), 0);

  if (loading) return <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', borderRadius: 16, padding: '28px 32px', color: '#fff' }}>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Panel del Profesor</p>
        <h1 style={{ margin: '4px 0 8px', fontSize: 26, fontWeight: 700 }}>{user?.nombre} 👨‍🏫</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
          Tienes <strong>{misCursos.length}</strong> curso{misCursos.length !== 1 ? 's' : ''} activo{misCursos.length !== 1 ? 's' : ''} con <strong>{alumnosUnicos}</strong> alumno{alumnosUnicos !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard icon={BookOpen} title="Mis Cursos" value={misCursos.length} sub="activos" color="#d97706" bg="#fef3c7" />
        <StatCard icon={Users} title="Mis Alumnos" value={alumnosUnicos} sub="únicos" color="#2563eb" bg="#dbeafe" />
        <StatCard icon={ClipboardList} title="Tareas Creadas" value={misTareas.length} sub="en total" color="#7c3aed" bg="#ede9fe" />
        <StatCard icon={Award} title="Entregas" value={pendientesCalificar} sub="recibidas" color="#059669" bg="#d1fae5" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Mis cursos */}
        <Card>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 14 }}>📚 Mis Cursos</p>
            <Link to="/portal/profesor/cursos" style={{ fontSize: 12, color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>Ver todos →</Link>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {misCursos.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0', margin: 0 }}>Sin cursos asignados</p>
            ) : misCursos.slice(0, 4).map(c => {
              const alumnos = inscripciones.filter(i => i.curso_id === c.id).length;
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: ACCENT_LIGHT, borderRadius: 10 }}>
                  <div style={{ width: 36, height: 36, background: '#fde68a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={16} color={ACCENT} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.titulo}</p>
                    <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{alumnos} alumno{alumnos !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Anuncios recientes */}
        <Card>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 14 }}>📢 Anuncios Recientes</p>
            <Link to="/portal/profesor/anuncios" style={{ fontSize: 12, color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>Ver todos →</Link>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {anuncios.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0', margin: 0 }}>Sin anuncios</p>
            ) : anuncios.slice(0, 4).map(a => (
              <div key={a.id} style={{ padding: '10px 12px', background: a.tipo === 'urgente' ? '#fef2f2' : '#fffbeb', borderRadius: 10, borderLeft: `3px solid ${a.tipo === 'urgente' ? '#dc2626' : ACCENT}` }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{a.titulo}</p>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.contenido}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <Card>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #fef3c7' }}>
          <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 14 }}>⚡ Accesos Rápidos</p>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          {[
            { to: '/portal/profesor/cursos', icon: BookOpen, label: 'Mis Cursos', color: '#d97706', bg: '#fef3c7' },
            { to: '/portal/profesor/alumnos', icon: Users, label: 'Mis Alumnos', color: '#2563eb', bg: '#dbeafe' },
            { to: '/portal/profesor/calificaciones', icon: Award, label: 'Calificaciones', color: '#7c3aed', bg: '#ede9fe' },
            { to: '/portal/profesor/asistencia', icon: UserCheck, label: 'Asistencia', color: '#059669', bg: '#d1fae5' },
            { to: '/portal/profesor/tareas', icon: ClipboardList, label: 'Tareas', color: '#dc2626', bg: '#fee2e2' },
            { to: '/portal/profesor/materiales', icon: FileText, label: 'Materiales', color: '#0891b2', bg: '#e0f2fe' },
          ].map(({ to, icon: Icon, label, color, bg }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px', borderRadius: 12, background: bg, cursor: 'pointer', transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <Icon size={22} color={color} />
                <span style={{ fontSize: 12, fontWeight: 600, color, textAlign: 'center' }}>{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
};
