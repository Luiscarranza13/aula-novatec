import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from './components/ui/Loader';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { EnrollmentsPage } from './pages/EnrollmentsPage';
import { UsersPage } from './pages/UsersPage';
import { GradesPage } from './pages/GradesPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AttendancePage } from './pages/AttendancePage';
import { TasksPage } from './pages/TasksPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MessagesPage } from './pages/MessagesPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { ReportsPage } from './pages/ReportsPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { CalendarPage } from './pages/CalendarPage';

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (splash) return <Loader fullScreen text="Iniciando plataforma..." />;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Toaster position="top-right" richColors closeButton duration={4000} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<LoginPage />} />
        <Route path="/admin/register" element={<RegisterPage />} />
        <Route path="/login" element={<Navigate to="/admin" replace />} />
        <Route path="/register" element={<Navigate to="/admin/register" replace />} />
        <Route path="/app" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<DashboardPage />} />
          <Route path="cursos" element={<CoursesPage />} />
          <Route path="inscripciones" element={<EnrollmentsPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="calificaciones" element={<GradesPage />} />
          <Route path="anuncios" element={<AnnouncementsPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="asistencia" element={<AttendancePage />} />
          <Route path="tareas" element={<TasksPage />} />
          <Route path="notificaciones" element={<NotificationsPage />} />
          <Route path="mensajes" element={<MessagesPage />} />
          <Route path="materiales" element={<MaterialsPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="certificados" element={<CertificatesPage />} />
          <Route path="calendario" element={<CalendarPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
