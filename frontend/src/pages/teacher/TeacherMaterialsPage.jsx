import React, { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, Link2, Video, Image, File, Download } from 'lucide-react';
import { materialService, cursoService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import Swal from 'sweetalert2';

const ACCENT = '#d97706';

const tipoIcon = (tipo) => ({ enlace: Link2, pdf: FileText, video: Video, imagen: Image, documento: File }[tipo] || File);
const tipoColor = (tipo) => ({ enlace: '#2563eb', pdf: '#dc2626', video: '#7c3aed', imagen: '#d97706', documento: '#059669' }[tipo] || '#6b7280');
const tipoBg = (tipo) => ({ enlace: '#dbeafe', pdf: '#fee2e2', video: '#ede9fe', imagen: '#fef3c7', documento: '#d1fae5' }[tipo] || '#f1f5f9');

export const TeacherMaterialsPage = () => {
  const { user } = useAuthStore();
  const [cursos, setCursos] = useState([]);
  const [cursoActivo, setCursoActivo] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', tipo: 'enlace', url: '' });
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cursoService.obtenerTodos({ limit: 100 }).then(r => {
      const misCursos = (r.data || []).filter(c => c.profesor_id === user?.id);
      setCursos(misCursos);
      if (misCursos.length > 0) { setCursoActivo(misCursos[0].id); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!cursoActivo) return;
    materialService.getByCurso(cursoActivo).then(r => setMateriales(r.data || [])).catch(() => {});
  }, [cursoActivo]);

  const handleAdd = async () => {
    if (!form.titulo.trim()) {
      Swal.fire({ icon: 'warning', title: 'El título es requerido', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      return;
    }
    const fd = new FormData();
    fd.append('titulo', form.titulo);
    fd.append('tipo', form.tipo);
    fd.append('curso_id', cursoActivo);
    if (archivo) fd.append('archivo', archivo);
    else if (form.url) fd.append('url', form.url);
    try {
      await materialService.crear(fd);
      Swal.fire({ icon: 'success', title: 'Material agregado', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      setShowForm(false); setForm({ titulo: '', tipo: 'enlace', url: '' }); setArchivo(null);
      materialService.getByCurso(cursoActivo).then(r => setMateriales(r.data || []));
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({ title: '¿Eliminar material?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' });
    if (r.isConfirmed) {
      await materialService.eliminar(id);
      setMateriales(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Materiales</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Recursos para tus cursos</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Agregar Material
        </button>
      </div>

      {/* Selector curso */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {cursos.map(c => (
          <button key={c.id} onClick={() => setCursoActivo(c.id)}
            style={{ padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: cursoActivo === c.id ? 700 : 400, background: cursoActivo === c.id ? ACCENT : '#fef3c7', color: cursoActivo === c.id ? '#fff' : '#78350f' }}>
            {c.titulo}
          </button>
        ))}
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fde68a', padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Nuevo Material</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Título del material *"
              style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none' }} />
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
              style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none' }}>
              {['enlace', 'pdf', 'video', 'documento', 'imagen'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {form.tipo === 'enlace' ? (
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="URL del enlace"
                style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none' }} />
            ) : (
              <input type="file" onChange={e => setArchivo(e.target.files[0])} style={{ fontSize: 13 }} />
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAdd}
                style={{ flex: 1, padding: '9px 0', background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Agregar
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
        materiales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 14, border: '1px solid #fde68a' }}>
            <FileText size={40} color="#fde68a" style={{ margin: '0 auto 10px', display: 'block' }} />
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Sin materiales en este curso</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {materiales.map(m => {
              const Icon = tipoIcon(m.tipo);
              const color = tipoColor(m.tipo);
              const bg = tipoBg(m.tipo);
              return (
                <div key={m.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #fde68a', padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, background: bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.titulo}</p>
                    <span style={{ fontSize: 10, fontWeight: 600, color, background: bg, padding: '1px 7px', borderRadius: 99, display: 'inline-block', marginTop: 4 }}>{m.tipo}</span>
                    {m.url && (
                      <a href={m.url.startsWith('http') ? m.url : `http://localhost:3001${m.url}`} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 12, color: ACCENT, textDecoration: 'none' }}>
                        <Download size={11} /> Ver archivo
                      </a>
                    )}
                  </div>
                  <button onClick={() => handleDelete(m.id)}
                    style={{ padding: 5, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={12} color="#dc2626" />
                  </button>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
};
