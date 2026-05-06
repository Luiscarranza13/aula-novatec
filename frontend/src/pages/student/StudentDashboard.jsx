import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, ClipboardList, Bell, CheckCircle, Clock, TrendingUp, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { inscripcionService, calificacionService, tareaService, notificacionService, anuncioService } from '../../services/api';

const ACCENT = '#059669';

const Card = ({ children, style }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #d1fae5', boxShadow: '0 1px 4px rgba(5,150,105,0.07)', ...style }}>
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

export const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [inscripciones, setInscripciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ins, cal, tar, ann, notif] = await Promise.all([
        inscripcionService.obtenerTodos(),
        calificacionService.obtenerTodos(),
        tareaService.obtenerTodos(),
        anuncioService.obtenerTodos(),
        notificacionService.getMias(),
      ]);
      setInscripciones(Array.isArray(ins.data) ? ins.data : []);
      setCalificaciones(Array.isArray(cal.data) ? cal.data : []);
      setTareas(Array.isArray(tar.data) ? tar.data : []);
      setAnuncios(Array.isArray(ann.data) ? ann.data : []);
      setNoLeidas(notif.no_leidas || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const promedio = calificaciones.length > 0
    ? (calificaciones.reduce((s, c) => s + parseFloat(c.nota || 0), 0) / calificaciones.length).toFixed(1)
    : '—';

  const tareasPendientes = tareas.filter(t => !t.entregado);

  const getNotaColor = (nota) => {
    if (nota >= 90) return '#059669';
    if (nota >= 70) return '#d97706';
    return '#dc2626';
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <p style={{ color: '#6b7280' }}>Cargando...</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Saludo */}
      <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderRadius: 16, padding: '28px 32px', color: '#fff' }}>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>¡Hola de nuevo!</p>
        <h1 style={{ margin: '4px 0 8px', fontSize: 26, fontWeight: 700 }}>{user?.nombre} 👋</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
          Tienes <strong>{inscripciones.length}</strong> curso{inscripciones.length !== 1 ? 's' : ''} activo{inscripciones.length !== 1 ? 's' : ''}
          {tareasPendientes.length > 0 && <> y <strong>{tareasPendientes.length}</strong> tarea{tareasPendientes.length !== 1 ? 's' : ''} pendiente{tareasPendientes.length !== 1 ? 's' : ''}</>}.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard icon={BookOpen} title="Cursos Inscritos" value={inscripciones.length} sub="activos" color="#059669" bg="#d1fae5" />
        <StatCard icon={Award} title="Promedio General" value={promedio} sub="sobre 100" color="#7c3aed" bg="#ede9fe" />
        <StatCard icon={ClipboardList} title="Tareas Pendientes" value={tareasPendientes.length} sub="por entregar" color="#d97706" bg="#fef3c7" />
        <StatCard icon={Bell} title="Notificaciones" value={noLeidas} sub="sin leer" color="#dc2626" bg="#fee2e2" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Mis cursos */}
        <Card>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 14 }}>📚 Mis Cursos</p>
            <Link to="/portal/alumno/cursos" style={{ fontSize: 12, color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>Ver todos →</Link>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {inscripciones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <BookOpen size={32} color="#d1fae5" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>No estás inscrito en ningún curso</p>
              </div>
            ) : inscripciones.slice(0, 4).map((ins) => (
              <div key={ins.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f0fdf4', borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, background: '#d1fae5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={16} color={ACCENT} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ins.curso_titulo}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{ins.profesor_nombre || 'Profesor'}</p>
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#d1fae5', color: ACCENT, fontWeight: 600, flexShrink: 0 }}>
                  {ins.estado || 'activa'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Calificaciones recientes */}
        <Card>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 14 }}>🏆 Calificaciones</p>
            <Link to="/portal/alumno/calificaciones" style={{ fontSize: 12, color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>Ver todas →</Link>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {calificaciones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Award size={32} color="#d1fae5" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Sin calificaciones aún</p>
              </div>
            ) : calificaciones.slice(0, 4).map((cal) => (
              <div key={cal.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#fafafa', borderRadius: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cal.curso_titulo}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{cal.comentario || 'Sin comentario'}</p>
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: getNotaColor(cal.nota), flexShrink: 0 }}>{cal.nota}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Tareas pendientes */}
        <Card>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 14 }}>📋 Tareas Próximas</p>
            <Link to="/portal/alumno/tareas" style={{ fontSize: 12, color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>Ver todas →</Link>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tareas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={32} color="#d1fae5" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>¡Sin tareas pendientes!</p>
              </div>
            ) : tareas.slice(0, 4).map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
                <Clock size={16} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{t.titulo}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
                    {t.fecha_limite ? `Entrega: ${new Date(t.fecha_limite).toLocaleDateString('es-ES')}` : 'Sin fecha límite'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Anuncios */}
        <Card>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 14 }}>📢 Anuncios</p>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {anuncios.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0', margin: 0 }}>Sin anuncios</p>
            ) : anuncios.slice(0, 3).map((a) => (
              <div key={a.id} style={{ padding: '10px 12px', background: a.tipo === 'urgente' ? '#fef2f2' : '#f0fdf4', borderRadius: 10, borderLeft: `3px solid ${a.tipo === 'urgente' ? '#dc2626' : ACCENT}` }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{a.titulo}</p>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.contenido}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <Card>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0fdf4' }}>
          <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 14 }}>⚡ Accesos Rápidos</p>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          {[
            { to: '/portal/alumno/cursos', icon: BookOpen, label: 'Mis Cursos', color: '#059669', bg: '#d1fae5' },
            { to: '/portal/alumno/tareas', icon: ClipboardList, label: 'Tareas', color: '#d97706', bg: '#fef3c7' },
            { to: '/portal/alumno/materiales', icon: FileText, label: 'Materiales', color: '#7c3aed', bg: '#ede9fe' },
            { to: '/portal/alumno/mensajes', icon: Bell, label: 'Mensajes', color: '#2563eb', bg: '#dbeafe' },
            { to: '/portal/alumno/certificados', icon: Award, label: 'Certificados', color: '#dc2626', bg: '#fee2e2' },
            { to: '/portal/alumno/calendario', icon: TrendingUp, label: 'Calendario', color: '#0891b2', bg: '#e0f2fe' },
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
