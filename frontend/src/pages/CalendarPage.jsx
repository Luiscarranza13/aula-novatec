import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { tareaService, anuncioService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      tareaService.obtenerTodos({}),
      anuncioService.obtenerTodos(),
    ]).then(([tareasRes, anunciosRes]) => {
      const tareaEvents = (tareasRes.data || [])
        .filter(t => t.fecha_limite)
        .map(t => ({
          id: `tarea-${t.id}`,
          title: `📝 ${t.titulo}`,
          date: t.fecha_limite.split('T')[0],
          backgroundColor: '#4f46e5',
          borderColor: '#4f46e5',
          extendedProps: { tipo: 'tarea', data: t },
        }));

      const anuncioEvents = (anunciosRes.data || []).map(a => ({
        id: `anuncio-${a.id}`,
        title: `📢 ${a.titulo}`,
        date: a.created_at.split('T')[0],
        backgroundColor: a.tipo === 'urgente' ? '#ef4444' : '#059669',
        borderColor: a.tipo === 'urgente' ? '#ef4444' : '#059669',
        extendedProps: { tipo: 'anuncio', data: a },
      }));

      setEvents([...tareaEvents, ...anuncioEvents]);
    });
  }, []);

  const handleEventClick = (info) => {
    setSelected(info.event.extendedProps);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Calendario</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tareas y anuncios del sistema</p>
      </div>

      <div className="flex gap-3 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> Tareas</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Anuncios</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Urgente</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                locale="es"
                height="auto"
                headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <p className="font-semibold text-slate-800 mb-3">Detalle</p>
              {!selected ? (
                <p className="text-slate-400 text-sm">Haz clic en un evento para ver detalles</p>
              ) : (
                <div className="space-y-3">
                  <Badge variant={selected.tipo === 'tarea' ? 'indigo' : 'green'}>{selected.tipo}</Badge>
                  <p className="font-semibold text-slate-800">{selected.data.titulo}</p>
                  {selected.data.descripcion && <p className="text-sm text-slate-600">{selected.data.descripcion}</p>}
                  {selected.data.contenido && <p className="text-sm text-slate-600">{selected.data.contenido}</p>}
                  {selected.data.fecha_limite && (
                    <p className="text-xs text-slate-500">Límite: {new Date(selected.data.fecha_limite).toLocaleString('es-MX')}</p>
                  )}
                  {selected.data.curso_titulo && (
                    <p className="text-xs text-slate-500">Curso: {selected.data.curso_titulo}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
