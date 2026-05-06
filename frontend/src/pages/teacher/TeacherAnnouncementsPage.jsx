import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Edit } from 'lucide-react';
import { anuncioService, cursoService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import Swal from 'sweetalert2';

const ACCENT = '#d97706';

export const TeacherAnnouncementsPage = () => {
  const { user } = useAuthStore();
  const [anuncios, setAnuncios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ titulo: '', contenido: '', tipo: 'general', curso_id: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      anuncioService.obtenerTodos(),
      cursoService.obtenerTodos({ limit: 100 }),
    ]).then(([ann, c]) => {
      setAnuncios(Array.isArray(ann.data) ? ann.data : []);
      setCursos((c.data || []).filter(x => x.profesor_id === user?.id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) {
      Swal.fire({ icon: 'warning', title: 'Título y contenido son requeridos', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      return;
    }
    try {
      if (editing) { await anuncioService.actualizar(editing.id, form); }
      else { await anuncioService.crear(form); }
      Swal.fire({ icon: 'success', title: editing ? 'Anuncio actualizado' : 'Anuncio publicado', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      setShowForm(false); setEditing(null); setForm({ titulo: '', contenido: '', tipo: 'general', curso_id: '' });
      const r = await anuncioService.obtenerTodos();
      setAnuncios(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({ title: '¿Eliminar anuncio?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' });
    if (r.isConfirmed) {
      await anuncioService.eliminar(id);
      setAnuncios(prev => prev.filter(a => a.id !== id));
    }
  };

  const tipoBadge = (tipo) => {
    const map = { general: { bg: '#fef3c7', color: ACCENT }, curso: { bg: '#dbeafe', color: '#2563eb' }, urgente: { bg: '#fee2e2', color: '#dc2626' } };
    return map[tipo] || map.general;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Anuncios</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{anuncios.length} anuncio{anuncios.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ titulo: '', contenido: '', tipo: 'general', curso_id: '' }); setShowForm(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Nuevo Anuncio
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fde68a', padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>{editing ? 'Editar Anuncio' : 'Nuevo Anuncio'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Título *"
              style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none' }} />
            <textarea value={form.contenido} onChange={e => setForm({ ...form, contenido: e.target.value })} placeholder="Contenido *" rows={4}
              style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none', resize: 'none' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none' }}>
                <option value="general">General</option>
                <option value="curso">Curso</option>
                <option value="urgente">Urgente</option>
              </select>
              <select value={form.curso_id} onChange={e => setForm({ ...form, curso_id: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none' }}>
                <option value="">Sin curso específico</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave}
                style={{ flex: 1, padding: '9px 0', background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {editing ? 'Actualizar' : 'Publicar'}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ padding: '9px 16px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 9, fontSize: 13, cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p> :
        anuncios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Megaphone size={48} color="#fde68a" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Sin anuncios publicados</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {anuncios.map(a => {
              const { bg, color } = tipoBadge(a.tipo);
              return (
                <div key={a.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #fde68a', padding: 20, borderLeft: `4px solid ${color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{a.titulo}</p>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: bg, color }}>{a.tipo}</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{a.contenido}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 12, flexShrink: 0 }}>
                      <button onClick={() => { setEditing(a); setForm({ titulo: a.titulo, contenido: a.contenido, tipo: a.tipo, curso_id: a.curso_id || '' }); setShowForm(true); }}
                        style={{ padding: 6, background: '#fef3c7', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
                        <Edit size={13} color={ACCENT} />
                      </button>
                      <button onClick={() => handleDelete(a.id)}
                        style={{ padding: 6, background: '#fee2e2', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
                        <Trash2 size={13} color="#dc2626" />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '8px 0 0' }}>{new Date(a.created_at).toLocaleString('es-ES')}</p>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
};
