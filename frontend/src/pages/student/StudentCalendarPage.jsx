import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { tareaService } from '../../services/api';

export const StudentCalendarPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    tareaService.obtenerTodos().then(r => {
      const tareas = Array.isArray(r.data) ? r.data : [];
      const evs = tareas
        .filter(t => t.fecha_limite)
        .map(t => ({
          id: String(t.id),
          title: t.titulo,
          date: t.fecha_limite.split('T')[0],
          backgroundColor: t.entregado ? '#059669' : '#d97706',
          borderColor: t.entregado ? '#047857' : '#b45309',
          textColor: '#fff',
          extendedProps: { curso: t.curso_titulo, entregado: t.entregado },
        }));
      setEvents(evs);
    }).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Calendario</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Fechas de entrega de tus tareas</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
          <div style={{ width: 12, height: 12, background: '#d97706', borderRadius: 3 }} /> Pendiente
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
          <div style={{ width: 12, height: 12, background: '#059669', borderRadius: 3 }} /> Entregada
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #d1fae5', padding: 20 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          events={events}
          height={520}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
          eventContent={(info) => (
            <div style={{ padding: '2px 6px', fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {info.event.title}
            </div>
          )}
        />
      </div>
    </div>
  );
};
