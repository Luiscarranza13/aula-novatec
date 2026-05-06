import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { tareaService, cursoService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

const ACCENT = '#d97706';

export const TeacherCalendarPage = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      cursoService.obtenerTodos({ limit: 100 }),
      tareaService.obtenerTodos(),
    ]).then(([c, t]) => {
      const misCursos = (c.data || []).filter(x => x.profesor_id === user?.id);
      const misTareas = (t.data || []).filter(tar => misCursos.some(c => c.id === tar.curso_id));
      const evs = misTareas
        .filter(t => t.fecha_limite)
        .map(t => ({
          id: String(t.id),
          title: `📋 ${t.titulo}`,
          date: t.fecha_limite.split('T')[0],
          backgroundColor: ACCENT,
          borderColor: '#b45309',
          textColor: '#fff',
        }));
      setEvents(evs);
    }).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Calendario</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Fechas límite de tus tareas</p>
      </div>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #fde68a', padding: 20 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          events={events}
          height={520}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
        />
      </div>
    </div>
  );
};
