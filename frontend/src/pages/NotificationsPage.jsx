import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, CheckCheck, Info, AlertTriangle, Award, BookOpen } from 'lucide-react';
import { notificacionService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { formatDateTime } from '../lib/utils';

const tipoIcon = {
  inscripcion: <BookOpen size={16} className="text-blue-500" />,
  calificacion: <Award size={16} className="text-yellow-500" />,
  anuncio: <AlertTriangle size={16} className="text-orange-500" />,
  default: <Info size={16} className="text-slate-400" />,
};

export const NotificationsPage = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const r = await notificacionService.getMias();
      setNotificaciones(r.data || []);
      setNoLeidas(r.no_leidas || 0);
    } catch { toast.error('Error al cargar notificaciones'); }
  };

  const marcarLeida = async (id) => {
    await notificacionService.marcarLeida(id);
    loadData();
  };

  const marcarTodas = async () => {
    await notificacionService.marcarTodasLeidas();
    toast.success('Todas marcadas como leídas');
    loadData();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notificaciones</h1>
          <p className="text-slate-500 text-sm mt-0.5">{noLeidas} sin leer</p>
        </div>
        {noLeidas > 0 && (
          <Button variant="outline" size="sm" onClick={marcarTodas}>
            <CheckCheck size={14} className="mr-1" /> Marcar todas como leídas
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-slate-100">
          {notificaciones.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-400 text-sm">No tienes notificaciones</p>
            </div>
          ) : notificaciones.map(n => (
            <div key={n.id}
              className={`flex items-start gap-3 p-4 transition-colors cursor-pointer hover:bg-slate-50 ${!n.leido ? 'bg-indigo-50/50' : ''}`}
              onClick={() => !n.leido && marcarLeida(n.id)}>
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                {tipoIcon[n.tipo] || tipoIcon.default}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.leido ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{n.mensaje}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(n.created_at)}</p>
              </div>
              {!n.leido && <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
