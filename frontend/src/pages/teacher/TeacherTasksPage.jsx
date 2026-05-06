import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ClipboardList, Plus, Trash2, Edit, Eye, Star } from 'lucide-react';
import { tareaService, cursoService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import Swal from 'sweetalert2';

const ACCENT = '#d97706';

export const TeacherTasksPage = () => {
  const { user } = useAuthStore();
  const [tareas, setTareas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cursoFiltro, setCursoFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEntregas, setShowEntregas] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: regCal, handleSubmit: handleCal, reset: resetCal } = useForm();

  useEffect(() => {
    cursoService.obtenerTodos({ limit: 100 }).then(r => {
      const misCursos = (r.data || []).filter(c => c.profesor_id === user?.id);
      setCursos(misCursos);
    });
    loadTareas();
  }, []);

  const loadTareas = async (curso_id) => {
    setLoading(true);
    const r = await tareaService.obtenerTodos(curso_id ? { curso_id } : {});
    setTareas(r.data || []);
    setLoading(false);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) { await tareaService.actualizar(editing.id, data); }
      else { await tareaService.crear(data); }
      Swal.fire({ icon: 'success', title: editing ? 'Tarea actualizada' : 'Tarea creada', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      reset(); setShowModal(false); setEditing(null); loadTareas(cursoFiltro);
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  const verEntregas = async (tarea) => {
    const r = await tareaService.getEntregas(tarea.id);
    setEntregas(r.data || []);
    setShowEntregas(tarea);
  };

  const calificar = async (data) => {
    try {
      await tareaService.calificarEntrega(data.entrega_id, { calificacion: data.calificacion, retroalimentacion: data.retroalimentacion });
      Swal.fire({ icon: 'success', title: 'Calificado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
      verEntregas(showEntregas); resetCal();
    } catch { }
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({ title: '¿Eliminar tarea?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' });
    if (r.isConfirmed) { await tareaService.eliminar(id); loadTareas(cursoFiltro); }
  };

  const vencida = (fecha) => fecha && new Date(fecha) < new Date();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Tareas</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{tareas.length} tarea{tareas.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { reset(); setEditing(null); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Nueva Tarea
        </button>
      </div>

      <select value={cursoFiltro} onChange={e => { setCursoFiltro(e.target.value); loadTareas(e.target.value); }}
        style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none', background: '#fffbeb', maxWidth: 280 }}>
        <option value="">Todos los cursos</option>
        {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
      </select>

      {loading ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {tareas.map(t => (
            <div key={t.id} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${vencida(t.fecha_limite) ? '#fecaca' : '#fde68a'}`, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, background: '#fef3c7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ClipboardList size={16} color={ACCENT} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{t.titulo}</p>
                    <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{t.curso_titulo}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setEditing(t); reset(t); setShowModal(true); }}
                    style={{ padding: 5, background: '#fef3c7', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    <Edit size={12} color={ACCENT} />
                  </button>
                  <button onClick={() => handleDelete(t.id)}
                    style={{ padding: 5, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    <Trash2 size={12} color="#dc2626" />
                  </button>
                </div>
              </div>
              {t.descripcion && <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>{t.descripcion}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {t.fecha_limite && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: vencida(t.fecha_limite) ? '#fee2e2' : '#fef3c7', color: vencida(t.fecha_limite) ? '#dc2626' : ACCENT, fontWeight: 600 }}>
                    {vencida(t.fecha_limite) ? 'Vencida' : new Date(t.fecha_limite).toLocaleDateString('es-ES')}
                  </span>
                )}
                <button onClick={() => verEntregas(t)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#fef3c7', color: ACCENT, border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Eye size={12} /> {t.total_entregas || 0} entregas
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>{editing ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Título *</label>
                <input {...register('titulo', { required: true })} placeholder="Título de la tarea"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Descripción</label>
                <textarea {...register('descripcion')} rows={3} placeholder="Instrucciones..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Curso *</label>
                <select {...register('curso_id', { required: true })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Seleccionar curso</option>
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Fecha límite</label>
                  <input {...register('fecha_limite')} type="datetime-local"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Puntos máx.</label>
                  <input {...register('puntos_maximos')} type="number" defaultValue={100}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #fde68a', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" style={{ flex: 1, padding: '10px 0', background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {editing ? 'Actualizar' : 'Crear Tarea'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); reset(); }}
                  style={{ padding: '10px 18px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 9, fontSize: 13, cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal entregas */}
      {showEntregas && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Entregas — {showEntregas.titulo}</h3>
              <button onClick={() => setShowEntregas(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            {entregas.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '30px 0', fontSize: 13 }}>Sin entregas aún</p>
            ) : entregas.map(e => (
              <div key={e.id} style={{ border: '1px solid #fde68a', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', margin: 0 }}>{e.usuario_nombre}</p>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: e.estado === 'calificado' ? '#d1fae5' : '#fef3c7', color: e.estado === 'calificado' ? '#059669' : ACCENT, fontWeight: 600 }}>{e.estado}</span>
                </div>
                {e.comentario && <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>{e.comentario}</p>}
                {e.calificacion && <p style={{ fontSize: 13, fontWeight: 700, color: '#059669', margin: '0 0 8px' }}>Nota: {e.calificacion}</p>}
                {e.estado !== 'calificado' && (
                  <form onSubmit={handleCal(d => calificar({ ...d, entrega_id: e.id }))} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input {...regCal('calificacion')} type="number" min={0} max={100} placeholder="Nota"
                      style={{ width: 70, padding: '6px 8px', borderRadius: 7, border: '1px solid #fde68a', fontSize: 13, outline: 'none', textAlign: 'center' }} />
                    <input {...regCal('retroalimentacion')} placeholder="Retroalimentación"
                      style={{ flex: 1, padding: '6px 8px', borderRadius: 7, border: '1px solid #fde68a', fontSize: 13, outline: 'none' }} />
                    <button type="submit" style={{ padding: '6px 12px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      <Star size={12} />
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
