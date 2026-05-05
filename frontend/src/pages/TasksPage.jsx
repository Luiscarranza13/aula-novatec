import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { Plus, ClipboardList, Upload, Star, Trash2, Edit, Eye } from 'lucide-react';
import { tareaService, cursoService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatDate } from '../lib/utils';

export const TasksPage = () => {
  const [tareas, setTareas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cursoFiltro, setCursoFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEntregas, setShowEntregas] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: regCal, handleSubmit: handleCal, reset: resetCal } = useForm();

  useEffect(() => {
    cursoService.obtenerTodos({ limit: 100 }).then(r => setCursos(r.data || []));
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
      if (editing) { await tareaService.actualizar(editing.id, data); Swal.fire({ icon: 'success', title: 'Tarea actualizada', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }); }
      else { await tareaService.crear(data); Swal.fire({ icon: 'success', title: 'Tarea creada', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }); }
      reset(); setShowModal(false); setEditing(null); loadTareas(cursoFiltro);
    } catch (e) { Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 }); }
  };

  const verEntregas = async (tarea) => {
    const r = await tareaService.getEntregas(tarea.id);
    setEntregas(r.data || []);
    setShowEntregas(tarea);
  };

  const calificar = async (data) => {
    try {
      await tareaService.calificarEntrega(data.entrega_id, { calificacion: data.calificacion, retroalimentacion: data.retroalimentacion });
      Swal.fire({ icon: 'success', title: 'Calificado', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      verEntregas(showEntregas);
      resetCal();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Error', text: 'Error al calificar', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 }); }
  };

  const handleDelete = async () => {
    await tareaService.eliminar(confirmId);
    setConfirmId(null); loadTareas(cursoFiltro);
  };

  const vencida = (fecha) => fecha && new Date(fecha) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tareas</h1>
          <p className="text-slate-500 text-sm mt-0.5">{tareas.length} tareas registradas</p>
        </div>
        <Button onClick={() => { reset(); setEditing(null); setShowModal(true); }}>
          <Plus size={16} className="mr-2" /> Nueva Tarea
        </Button>
      </div>

      <select value={cursoFiltro} onChange={e => { setCursoFiltro(e.target.value); loadTareas(e.target.value); }} className="form-select w-full sm:w-64">
        <option value="">Todos los cursos</option>
        {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
      </select>

      {loading ? <div className="text-center py-12 text-slate-400">Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tareas.map(t => (
            <Card key={t.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={16} className="text-indigo-500 flex-shrink-0" />
                    <p className="font-semibold text-slate-800 text-sm">{t.titulo}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setEditing(t); reset(t); setShowModal(true); }} className="p-1 hover:bg-slate-100 rounded transition-colors"><Edit size={13} className="text-slate-500" /></button>
                    <button onClick={() => setConfirmId(t.id)} className="p-1 hover:bg-red-50 rounded transition-colors"><Trash2 size={13} className="text-red-500" /></button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{t.descripcion || 'Sin descripción'}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t.curso_titulo}</span>
                  {t.fecha_limite && (
                    <Badge variant={vencida(t.fecha_limite) ? 'red' : 'blue'}>
                      {vencida(t.fecha_limite) ? 'Vencida' : formatDate(t.fecha_limite)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{t.total_entregas || 0} entregas</span>
                  <Button size="sm" variant="outline" onClick={() => verEntregas(t)}>
                    <Eye size={12} className="mr-1" /> Ver entregas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal crear/editar tarea */}
      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title={editing ? 'Editar Tarea' : 'Nueva Tarea'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Título *</label>
            <input {...register('titulo', { required: 'Requerido' })} className="form-input" placeholder="Título de la tarea" />
            {errors.titulo && <p className="mt-1 text-xs text-red-600">{errors.titulo.message}</p>}
          </div>
          <div>
            <label className="form-label">Descripción</label>
            <textarea {...register('descripcion')} className="form-input resize-none" rows={3} placeholder="Instrucciones..." />
          </div>
          <div>
            <label className="form-label">Curso *</label>
            <select {...register('curso_id', { required: true })} className="form-select">
              <option value="">Seleccionar curso</option>
              {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Fecha límite</label>
              <input {...register('fecha_limite')} type="datetime-local" className="form-input" />
            </div>
            <div>
              <label className="form-label">Puntos máximos</label>
              <input {...register('puntos_maximos')} type="number" defaultValue={100} className="form-input" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{editing ? 'Actualizar' : 'Crear Tarea'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal entregas */}
      <Modal open={!!showEntregas} onClose={() => setShowEntregas(null)} title={`Entregas — ${showEntregas?.titulo}`}>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {entregas.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">Sin entregas aún</p>
          ) : entregas.map(e => (
            <div key={e.id} className="border border-slate-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-slate-800 text-sm">{e.usuario_nombre}</p>
                <Badge variant={e.estado === 'calificado' ? 'green' : 'blue'}>{e.estado}</Badge>
              </div>
              {e.comentario && <p className="text-xs text-slate-500 mb-2">{e.comentario}</p>}
              {e.archivo_url && (
                <a href={`http://localhost:3001${e.archivo_url}`} target="_blank" rel="noreferrer"
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                  <Upload size={11} /> Ver archivo
                </a>
              )}
              {e.estado !== 'calificado' && (
                <form onSubmit={handleCal(d => calificar({ ...d, entrega_id: e.id }))} className="mt-3 flex gap-2">
                  <input {...regCal('calificacion')} type="number" min={0} max={100} placeholder="Nota" className="form-input w-20 text-sm" />
                  <input {...regCal('retroalimentacion')} placeholder="Retroalimentación" className="form-input flex-1 text-sm" />
                  <Button type="submit" size="sm"><Star size={12} /></Button>
                </form>
              )}
              {e.calificacion && <p className="text-xs text-emerald-600 mt-1 font-semibold">Nota: {e.calificacion}</p>}
            </div>
          ))}
        </div>
      </Modal>

      <ConfirmModal open={!!confirmId} onConfirm={handleDelete} onCancel={() => setConfirmId(null)} message="Se eliminarán también todas las entregas." />
    </div>
  );
};
