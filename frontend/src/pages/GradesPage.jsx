import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { gsap } from 'gsap';
import { Plus, Award, Search, Edit, Trash2, Star } from 'lucide-react';
import { calificacionService, usuarioService, cursoService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Pagination } from '../components/ui/Pagination';
import { formatDate } from '../lib/utils';

const getGradeBadge = (nota) => {
  if (nota >= 90) return <Badge variant="green">Excelente</Badge>;
  if (nota >= 75) return <Badge variant="blue">Bueno</Badge>;
  if (nota >= 60) return <Badge variant="orange">Regular</Badge>;
  return <Badge variant="red">Reprobado</Badge>;
};

const StarRating = ({ value }) => {
  const stars = Math.round((value / 100) * 5);
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} className={i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'} />
      ))}
    </div>
  );
};

export const GradesPage = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { loadData(); }, [page, search]);

  useEffect(() => {
    if (calificaciones.length > 0)
      gsap.from('.grade-row', { opacity: 0, y: 8, stagger: 0.04, duration: 0.3 });
  }, [calificaciones.length]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gradesRes, usuariosRes, cursosRes] = await Promise.all([
        calificacionService.obtenerTodos({ page, search: search || undefined }),
        usuarioService.obtenerTodos({ limit: 100 }),
        cursoService.obtenerTodos({ limit: 100 }),
      ]);
      setCalificaciones(gradesRes.data || []);
      setMeta(gradesRes.meta || {});
      setUsuarios(usuariosRes.data || []);
      setCursos(cursosRes.data || []);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar calificaciones', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    } finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, nota: parseFloat(data.nota) };
      if (editingGrade) {
        await calificacionService.actualizar(editingGrade.id, payload);
        Swal.fire({ icon: 'success', title: 'Calificación actualizada', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      } else {
        await calificacionService.crear(payload);
        Swal.fire({ icon: 'success', title: 'Calificación registrada', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      }
      reset(); setShowModal(false); setEditingGrade(null); loadData();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error al guardar', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    reset({ usuario_id: grade.usuario_id, curso_id: grade.curso_id, nota: grade.nota, comentario: grade.comentario });
    setShowModal(true);
  };

  const handleDelete = async () => {
    const id = confirmId;
    setConfirmId(null);
    try {
      await calificacionService.eliminar(id);
      Swal.fire({ icon: 'success', title: 'Calificación eliminada', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      loadData();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  const promedio = calificaciones.length > 0
    ? (calificaciones.reduce((s, c) => s + parseFloat(c.nota || 0), 0) / calificaciones.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Calificaciones</h1>
          <p className="text-slate-500 text-sm mt-0.5">{meta.total ?? calificaciones.length} calificaciones registradas</p>
        </div>
        <Button onClick={() => { reset(); setEditingGrade(null); setShowModal(true); }}>
          <Plus size={16} className="mr-2" /> Nueva Calificación
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Promedio general', value: promedio, color: 'text-yellow-600' },
          { label: 'Aprobados', value: calificaciones.filter(c => c.nota >= 60).length, color: 'text-emerald-600' },
          { label: 'Reprobados', value: calificaciones.filter(c => c.nota < 60).length, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}><CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por estudiante o curso..." className="form-input pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-header">Estudiante</th>
                  <th className="table-header">Curso</th>
                  <th className="table-header">Nota</th>
                  <th className="table-header">Nivel</th>
                  <th className="table-header">Estrellas</th>
                  <th className="table-header">Comentario</th>
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-400">Cargando...</td></tr>
                ) : calificaciones.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12">
                    <Award className="mx-auto text-slate-300 mb-2" size={36} />
                    <p className="text-slate-400 text-sm">No hay calificaciones</p>
                  </td></tr>
                ) : calificaciones.map(grade => (
                  <tr key={grade.id} className="grade-row hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-medium text-slate-800">{grade.usuario_nombre}</td>
                    <td className="table-cell text-slate-600">{grade.curso_titulo}</td>
                    <td className="table-cell">
                      <span className={`text-lg font-bold ${grade.nota >= 90 ? 'text-emerald-600' : grade.nota >= 75 ? 'text-blue-600' : grade.nota >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                        {grade.nota}
                      </span>
                    </td>
                    <td className="table-cell">{getGradeBadge(grade.nota)}</td>
                    <td className="table-cell"><StarRating value={grade.nota} /></td>
                    <td className="table-cell text-slate-500 text-xs max-w-xs truncate">{grade.comentario || '—'}</td>
                    <td className="table-cell text-slate-500 text-xs">{formatDate(grade.fecha)}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(grade)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit size={14} className="text-slate-500" />
                        </button>
                        <button onClick={() => setConfirmId(grade.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4"><Pagination meta={meta} onPageChange={setPage} /></div>
        </CardContent>
      </Card>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingGrade(null); reset(); }}
        title={editingGrade ? 'Editar Calificación' : 'Nueva Calificación'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Estudiante *</label>
            <select {...register('usuario_id', { required: true })} className="form-select">
              <option value="">Seleccionar estudiante</option>
              {usuarios.filter(u => u.rol === 'estudiante').map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Curso *</label>
            <select {...register('curso_id', { required: true })} className="form-select">
              <option value="">Seleccionar curso</option>
              {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Nota (0-100) *</label>
            <input {...register('nota', { required: true, min: 0, max: 100 })} type="number" min="0" max="100" step="0.1" placeholder="Ej: 85" className="form-input" />
            {errors.nota && <p className="mt-1 text-xs text-red-600">Nota entre 0 y 100</p>}
          </div>
          <div>
            <label className="form-label">Comentario</label>
            <textarea {...register('comentario')} placeholder="Observaciones..." className="form-input resize-none" rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{editingGrade ? 'Actualizar' : 'Registrar'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onConfirm={handleDelete} onCancel={() => setConfirmId(null)}
        message="Se eliminará la calificación permanentemente." />
    </div>
  );
};
