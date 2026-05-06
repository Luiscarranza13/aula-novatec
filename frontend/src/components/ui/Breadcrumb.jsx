/**
 * Breadcrumbs de navegación
 * Mejora #40 — Breadcrumbs
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  // Admin
  app: 'Dashboard',
  cursos: 'Cursos',
  inscripciones: 'Inscripciones',
  usuarios: 'Usuarios',
  calificaciones: 'Calificaciones',
  anuncios: 'Anuncios',
  categorias: 'Categorías',
  perfil: 'Mi Perfil',
  asistencia: 'Asistencia',
  tareas: 'Tareas',
  notificaciones: 'Notificaciones',
  mensajes: 'Mensajes',
  materiales: 'Materiales',
  reportes: 'Reportes',
  certificados: 'Certificados',
  calendario: 'Calendario',
  configuracion: 'Configuración',
  // Student
  portal: 'Portal',
  alumno: 'Alumno',
  // Teacher
  profesor: 'Profesor',
  alumnos: 'Mis Alumnos',
};

export const Breadcrumb = () => {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  if (parts.length <= 1) return null;

  const crumbs = parts.map((part, i) => ({
    label: ROUTE_LABELS[part] || part.charAt(0).toUpperCase() + part.slice(1),
    path: '/' + parts.slice(0, i + 1).join('/'),
    isLast: i === parts.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted, #6b7280)', marginBottom: 16, flexWrap: 'wrap' }}>
      <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <Home size={13} />
      </Link>
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.path}>
          <ChevronRight size={12} style={{ opacity: 0.5 }} />
          {crumb.isLast ? (
            <span style={{ color: 'var(--text-primary, #111827)', fontWeight: 600 }}>{crumb.label}</span>
          ) : (
            <Link to={crumb.path} style={{ color: 'inherit', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = 'var(--color-primary, #4f46e5)'}
              onMouseLeave={e => e.target.style.color = 'inherit'}>
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
