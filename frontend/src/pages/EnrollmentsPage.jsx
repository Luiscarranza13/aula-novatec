import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { gsap } from 'gsap';
import { Plus, Calendar, BookOpen, Search, Trash2 } from 'lucide-react';
import { useInscripciones } from '../hooks/useInscripciones';
import { inscripcionService, usuarioService, cursoService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Pagination } from '../components/ui/Pagination';
import { formatDate } from '../lib/utils';

export const EnrollmentsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: enrollments, meta, loading, reload } = useInscripciones({ page, search: search || undefined });
  const [showModal, setShowModal] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    Promise.all([usuarioService.obtenerTodos({ limit: 100 }), cursoService.obtenerTodos({ limit: 100 })])
      .then(([u, c]) => { setUsuarios(u.data || []); setCursos(c.data || []); });
  }, []);

  useEffect(() => {
    if (enrollments.length > 0)
      gsap.from('.enrollment-row', { opacity: 0, x: -10, stagger: 0.04, duration: 0.3 });
  }, [enrollments.length]);

  const onSubmit = async (data) => {
    try {
      await inscripcionService.crear(data);
      Swal.fire({ icon: 'success', title: 'Inscripción creada', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      reset(); setShowModal(false); reload({ page, search: search || undefined });
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error al inscribir', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  const handleDelete = async () => {
    const id = confirmId;
    setConfirmId(null);
    try {
      await inscripcionService.eliminar(id);
      Swal.fire({ icon: 'success', title: 'Inscripción eliminada', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      reload({ page, search: search || undefined });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inscripciones</h1>
          <p className="text-slate-500 text-sm mt-0.5">{meta.total ?? enrollments.length} inscripciones registradas</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-2" /> Nueva Inscripción
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por usuario o curso..." className="form-input pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-header">#</th>
                  <th className="table-header">Usuario</th>
                  <th className="table-header">Rol</th>
                  <th className="table-header">Curso</th>
                  <th className="table-header">Profesor</th>
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">Cargando...</td></tr>
                ) : enrollments.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12">
                    <Calendar className="mx-auto text-slate-300 mb-2" size={36} />
                    <p className="text-slate-400 text-sm">No hay inscripciones</p>
                  </td></tr>
                ) : enrollments.map((e, i) => (
                  <tr key={e.id} className="enrollment-row hover:bg-slate-50 transition-colors">
                    <td className="table-cell text-slate-400 font-mono text-xs">{i + 1}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-700 text-xs font-bold">{e.usuario_nombre?.[0]?.toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-slate-800">{e.usuario_nombre}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {e.usuario_rol === 'profesor'
                        ? <Badge variant="purple">Profesor</Badge>
                        : <Badge variant="blue">Estudiante</Badge>}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-slate-700">{e.curso_titulo}</span>
                      </div>
                    </td>
                    <td className="table-cell text-slate-500 text-xs">{e.profesor_nombre || '—'}</td>
                    <td className="table-cell text-slate-500 text-xs">{formatDate(e.fecha_inscripcion)}</td>
                    <td className="table-cell">
                      <button onClick={() => setConfirmId(e.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4"><Pagination meta={meta} onPageChange={setPage} /></div>
        </CardContent>
      </Card>

      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="Nueva Inscripción">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Usuario *</label>
            <select {...register('usuario_id', { required: true })} className="form-select">
              <option value="">Seleccionar usuario</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Curso *</label>
            <select {...register('curso_id', { required: true })} className="form-select">
              <option value="">Seleccionar curso</option>
              {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Inscribir</Button>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onConfirm={handleDelete} onCancel={() => setConfirmId(null)}
        message="Se eliminará la inscripción del estudiante." />
    </div>
  );
};
