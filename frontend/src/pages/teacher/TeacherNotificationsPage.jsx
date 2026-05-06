import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import { notificacionService } from '../../services/api';
import Swal from 'sweetalert2';

const ACCENT = '#d97706';

export const TeacherNotificationsPage = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifs(); }, []);

  const loadNotifs = async () => {
    try {
      const r = await notificacionService.getMias();
      setNotificaciones(Array.isArray(r.notificaciones) ? r.notificaciones : []);
    } catch { } finally { setLoading(false); }
  };

  const marcarLeida = async (id) => {
    await notificacionService.marcarLeida(id).catch(() => {});
    loadNotifs();
  };

  const marcarTodas = async () => {
    await notificacionService.marcarTodasLeidas().catch(() => {});
    Swal.fire({ icon: 'success', title: 'Todas marcadas como leídas', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
    loadNotifs();
  };

  const noLeidas = notificaciones.filter(n => !n.leido).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Notificaciones</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{noLeidas} sin leer</p>
        </div>
        {noLeidas > 0 && (
          <button onClick={marcarTodas}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fef3c7', color: ACCENT, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <CheckCheck size={14} /> Marcar todas leídas
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>
      ) : notificaciones.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Bell size={48} color="#fde68a" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Sin notificaciones</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notificaciones.map(n => (
            <div key={n.id} onClick={() => !n.leido && marcarLeida(n.id)}
              style={{ background: n.leido ? '#fff' : '#fffbeb', borderRadius: 12, border: `1px solid ${n.leido ? '#e5e7eb' : '#fde68a'}`, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start', cursor: n.leido ? 'default' : 'pointer' }}>
              <div style={{ width: 36, height: 36, background: n.leido ? '#f1f5f9' : '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={16} color={n.leido ? '#9ca3af' : ACCENT} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: 13, fontWeight: n.leido ? 400 : 700, color: '#111827', margin: 0 }}>{n.mensaje}</p>
                  {!n.leido && <Circle size={8} color={ACCENT} fill={ACCENT} style={{ flexShrink: 0, marginTop: 4 }} />}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 99, background: '#fef3c7', color: ACCENT }}>{n.tipo}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(n.created_at).toLocaleString('es-ES')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
