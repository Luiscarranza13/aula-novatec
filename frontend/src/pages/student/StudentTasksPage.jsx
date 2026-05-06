import React, { useEffect, useState } from 'react';
import { ClipboardList, Clock, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { tareaService } from '../../services/api';
import Swal from 'sweetalert2';

const ACCENT = '#059669';

export const StudentTasksPage = () => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [comentario, setComentario] = useState('');
  const [archivo, setArchivo] = useState(null);

  useEffect(() => { loadTareas(); }, []);

  const loadTareas = async () => {
    try {
      const r = await tareaService.obtenerTodos();
      setTareas(Array.isArray(r.data) ? r.data : []);
    } catch { } finally { setLoading(false); }
  };

  const handleEntregar = async (tarea_id) => {
    if (!archivo && !comentario.trim()) {
      Swal.fire({ icon: 'warning', title: 'Agrega un archivo o comentario', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      return;
    }
    const fd = new FormData();
    fd.append('tarea_id', tarea_id);
    if (comentario) fd.append('comentario', comentario);
    if (archivo) fd.append('archivo', archivo);
    try {
      await tareaService.entregar(fd);
      Swal.fire({ icon: 'success', title: '¡Tarea entregada!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      setUploading(null); setComentario(''); setArchivo(null);
      loadTareas();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error al entregar', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  const isVencida = (fecha) => fecha && new Date(fecha) < new Date();
  const diasRestantes = (fecha) => {
    if (!fecha) return null;
    const diff = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const pendientes = tareas.filter(t => !t.entregado);
  const entregadas = tareas.filter(t => t.entregado);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Mis Tareas</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''} · {entregadas.length} entregada{entregadas.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>
      ) : tareas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <CheckCircle size={48} color="#d1fae5" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>¡Sin tareas por ahora!</p>
        </div>
      ) : (
        <>
          {pendientes.length > 0 && (
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={15} color="#d97706" /> Pendientes ({pendientes.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendientes.map(t => {
                  const dias = diasRestantes(t.fecha_limite);
                  const vencida = isVencida(t.fecha_limite);
                  return (
                    <div key={t.id} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${vencida ? '#fecaca' : '#d1fae5'}`, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ width: 38, height: 38, background: vencida ? '#fee2e2' : '#fef3c7', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {vencida ? <AlertCircle size={18} color="#dc2626" /> : <Clock size={18} color="#d97706" />}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{t.titulo}</p>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>{t.curso_titulo}</p>
                          </div>
                        </div>
                        {t.fecha_limite && (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: vencida ? '#fee2e2' : dias <= 2 ? '#fef3c7' : '#d1fae5', color: vencida ? '#dc2626' : dias <= 2 ? '#d97706' : ACCENT, flexShrink: 0 }}>
                            {vencida ? 'Vencida' : dias === 0 ? 'Hoy' : `${dias}d restantes`}
                          </span>
                        )}
                      </div>
                      {t.descripcion && <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>{t.descripcion}</p>}

                      {uploading === t.id ? (
                        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 14, border: '1px solid #a7f3d0' }}>
                          <textarea
                            value={comentario}
                            onChange={e => setComentario(e.target.value)}
                            placeholder="Comentario (opcional)..."
                            rows={2}
                            style={{ width: '100%', borderRadius: 8, border: '1px solid #d1fae5', padding: '8px 10px', fontSize: 13, resize: 'none', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
                          />
                          <input type="file" onChange={e => setArchivo(e.target.files[0])} style={{ fontSize: 12, marginBottom: 10, display: 'block' }} />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleEntregar(t.id)}
                              style={{ flex: 1, padding: '8px 0', background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                              Enviar entrega
                            </button>
                            <button onClick={() => { setUploading(null); setComentario(''); setArchivo(null); }}
                              style={{ padding: '8px 14px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setUploading(t.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#d1fae5', color: ACCENT, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          <Upload size={14} /> Entregar tarea
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {entregadas.length > 0 && (
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={15} color={ACCENT} /> Entregadas ({entregadas.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {entregadas.map(t => (
                  <div key={t.id} style={{ background: '#f0fdf4', borderRadius: 12, border: '1px solid #a7f3d0', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <CheckCircle size={20} color={ACCENT} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{t.titulo}</p>
                      <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{t.curso_titulo}</p>
                    </div>
                    {t.calificacion != null && (
                      <span style={{ fontSize: 20, fontWeight: 800, color: ACCENT }}>{t.calificacion}</span>
                    )}
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#d1fae5', color: ACCENT, fontWeight: 600 }}>
                      {t.estado_entrega || 'entregado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
