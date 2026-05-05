import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LogOut, BookOpen, LayoutDashboard, Calendar, Users, Bell, Menu, X,
  ChevronRight, GraduationCap, Award, Tag, Megaphone, ClipboardList,
  UserCheck, MessageSquare, FileText, BarChart2, Search, User, CalendarDays
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { notificacionService, buscadorService } from '../../services/api';
import Swal from 'sweetalert2';

const navItems = [
  { path: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/app/cursos', icon: BookOpen, label: 'Cursos' },
  { path: '/app/inscripciones', icon: Calendar, label: 'Inscripciones' },
  { path: '/app/usuarios', icon: Users, label: 'Usuarios' },
  { path: '/app/calificaciones', icon: Award, label: 'Calificaciones' },
  { path: '/app/anuncios', icon: Megaphone, label: 'Anuncios' },
  { path: '/app/categorias', icon: Tag, label: 'Categorías' },
  { path: '/app/asistencia', icon: UserCheck, label: 'Asistencia' },
  { path: '/app/tareas', icon: ClipboardList, label: 'Tareas' },
  { path: '/app/materiales', icon: FileText, label: 'Materiales' },
  { path: '/app/mensajes', icon: MessageSquare, label: 'Mensajes' },
  { path: '/app/notificaciones', icon: Bell, label: 'Notificaciones' },
  { path: '/app/reportes', icon: BarChart2, label: 'Reportes' },
  { path: '/app/certificados', icon: Award, label: 'Certificados' },
  { path: '/app/calendario', icon: CalendarDays, label: 'Calendario' },
  { path: '/app/perfil', icon: User, label: 'Mi Perfil' },
];

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [noLeidas, setNoLeidas] = useState(0);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    notificacionService.getMias().then(r => setNoLeidas(r.no_leidas || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!searchQ.trim() || searchQ.length < 2) { setSearchResults(null); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await buscadorService.buscar(searchQ);
        setSearchResults(r.data);
      } catch { setSearchResults(null); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQ]);

  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchResults(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Se cerrará tu sesión actual.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) { logout(); navigate('/login'); }
  };
  const initials = user?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const fotoSrc = user?.foto_url ? `http://localhost:3001${user.foto_url}` : null;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 240 : 60, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.25s' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: '1px solid #e2e8f0', gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: '#fff', boxShadow: '0 2px 8px rgba(79,70,229,0.25)', border: '2px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
            <img src="/logo.png" alt="Aula Virtual" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          {sidebarOpen && <div><p style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Aula Virtual</p><p style={{ fontSize: 10, color: '#94a3b8' }}>Sistema Educativo</p></div>}
        </div>

        <nav style={{ flex: 1, padding: 8, overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 7, marginBottom: 2, textDecoration: 'none', fontSize: 13,
                background: isActive ? '#eef2ff' : 'transparent',
                color: isActive ? '#4f46e5' : '#475569',
                fontWeight: isActive ? 600 : 400,
                border: isActive ? '1px solid #c7d2fe' : '1px solid transparent',
                position: 'relative',
              })}>
              {({ isActive }) => (
                <>
                  <item.icon size={16} />
                  {sidebarOpen && <span style={{ flex: 1 }}>{item.label}</span>}
                  {sidebarOpen && item.path === '/app/notificaciones' && noLeidas > 0 && (
                    <span style={{ background: '#ef4444', color: 'white', fontSize: 10, borderRadius: 99, padding: '1px 5px', fontWeight: 700 }}>{noLeidas}</span>
                  )}
                  {sidebarOpen && isActive && <ChevronRight size={12} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 10, borderTop: '1px solid #e2e8f0' }}>
          {sidebarOpen && (
            <Link to="/app/perfil" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', marginBottom: 6, borderRadius: 8, textDecoration: 'none' }}>
              <div style={{ width: 30, height: 30, background: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {fotoSrc ? <img src={fotoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{initials}</span>}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nombre}</p>
                <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'capitalize' }}>{user?.rol}</p>
              </div>
            </Link>
          )}
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', fontSize: 12 }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <LogOut size={15} />{sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 64, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, gap: 12 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 7, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}>
            {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          {/* Buscador global */}
          <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Buscar cursos, usuarios, anuncios..."
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, height: 36, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#f8fafc' }}
            />
            {searchResults && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, marginTop: 4, maxHeight: 320, overflowY: 'auto' }}>
                {searchResults.total === 0 ? (
                  <p style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>Sin resultados para "{searchQ}"</p>
                ) : (
                  <>
                    {searchResults.cursos.length > 0 && (
                      <div>
                        <p style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Cursos</p>
                        {searchResults.cursos.map(c => (
                          <button key={c.id} onClick={() => { navigate('/app/cursos'); setSearchQ(''); setSearchResults(null); }}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 14px', fontSize: 13, color: '#1e293b', background: 'none', border: 'none', cursor: 'pointer', display: 'block' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            📚 {c.nombre}
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.usuarios.length > 0 && (
                      <div>
                        <p style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Usuarios</p>
                        {searchResults.usuarios.map(u => (
                          <button key={u.id} onClick={() => { navigate('/app/usuarios'); setSearchQ(''); setSearchResults(null); }}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 14px', fontSize: 13, color: '#1e293b', background: 'none', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            👤 {u.nombre} <span style={{ color: '#94a3b8', fontSize: 11 }}>({u.tipo})</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.anuncios.length > 0 && (
                      <div>
                        <p style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Anuncios</p>
                        {searchResults.anuncios.map(a => (
                          <button key={a.id} onClick={() => { navigate('/app/anuncios'); setSearchQ(''); setSearchResults(null); }}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 14px', fontSize: 13, color: '#1e293b', background: 'none', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            📢 {a.nombre}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <Link to="/app/notificaciones" style={{ position: 'relative', padding: 7, borderRadius: 7, color: '#64748b', textDecoration: 'none', display: 'flex' }}>
              <Bell size={17} />
              {noLeidas > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '1.5px solid white' }} />
              )}
            </Link>
            <Link to="/app/perfil" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 30, height: 30, background: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {fotoSrc ? <img src={fotoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{initials}</span>}
              </div>
              <div style={{ display: 'none' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{user?.nombre}</p>
              </div>
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
