import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * Protege rutas por rol.
 * allowedRoles: array de roles permitidos, ej. ['admin'], ['profesor'], ['estudiante','profesor']
 * redirectTo: a dónde redirigir si no tiene permiso
 */
export const RoleGuard = ({ allowedRoles, redirectTo = '/login', children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user?.rol)) return <Navigate to={redirectTo} replace />;

  return children;
};
