import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { gsap } from 'gsap';
import { Plus, BookOpen, Search, Edit, Trash2, Users, Filter } from 'lucide-react';
import { useCourseStore } from '../store/useCourseStore';
import { cursoService, usuarioService, categoriaService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Pagination } from '../components/ui/Pagination';

export const CoursesPage = () => {
  const { courses, setCourses } = useCourseStore();
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [profesores, setProfesores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { loadData(); }, [page, search, filterCategoria]);

  useEffect(() => {
    if (courses.length > 0)
      gsap.from('.course-card', { opacity: 0, y: 16, stagger: 0.07, duration: 0.4 });
  }, [courses.length]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, profesoresRes, catsRes] = await Promise.all([
        cursoService.obtenerTodos({ page, search: search || undefined, categoria: filterCategoria || undefined }),
        usuarioService.obtenerTodos({ limit: 100 }),
        categoriaService.obtenerTodos(),
      ]);
      setCourses(coursesRes.data || []);
      setMeta(coursesRes.meta || {});
      setProfesores(profesoresRes.data?.filter(u => u.rol === 'profesor') || []);
      setCategorias(catsRes.data || []);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar cursos', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    } finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    try {
      if (editingCourse) {
        await cursoService.actualizar(editingCourse.id, data);
        Swal.fire({ icon: 'success', title: 'Curso actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      } else {
        await cursoService.crear(data);
        Swal.fire({ icon: 'success', title: 'Curso creado', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      }
      reset(); setShowModal(false); setEditingCourse(null); loadData();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error al guardar', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  const handleEdit = (course) => { setEditingCourse(course); reset(course); setShowModal(true); };

  const handleDelete = async () => {
    const id = confirmId;
    setConfirmId(null);
    try {
      await cursoService.eliminar(id);
      Swal.fire({ icon: 'success', title: 'Curso eliminado', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      loadData();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  const badgeVariants = ['blue', 'green', 'purple', 'orange', 'indigo'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cursos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {meta.total ?? courses.length} cursos registrados
          </p>
        </div>
        <Button onClick={() => { reset(); setEditingCourse(null); setShowModal(true); }}>
          <Plus size={16} className="mr-2" /> Nuevo Curso
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar cursos..." className="form-input pl-9" />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={filterCategoria} onChange={e => { setFilterCategoria(e.target.value); setPage(1); }}
            className="form-select pl-9 pr-8 w-full sm:w-48">
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-medium">No se encontraron cursos</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course, i) => (
              <div key={course.id} className="course-card">
                <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                          <BookOpen className="text-indigo-600" size={18} />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base leading-tight">{course.titulo}</CardTitle>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {course.profesor_nombre ? `Prof. ${course.profesor_nombre}` : 'Sin profesor'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(course)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit size={14} className="text-slate-500" />
                        </button>
                        <button onClick={() => setConfirmId(course.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">{course.descripcion || 'Sin descripción'}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={badgeVariants[i % badgeVariants.length]}>{course.categoria || 'General'}</Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Users size={12} />
                        <span>{course.total_inscripciones || 0} alumnos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingCourse(null); reset(); }}
        title={editingCourse ? 'Editar Curso' : 'Nuevo Curso'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Título *</label>
            <input {...register('titulo', { required: 'El título es requerido' })} placeholder="Ej: Introducción a JavaScript" className="form-input" />
            {errors.titulo && <p className="mt-1 text-xs text-red-600">{errors.titulo.message}</p>}
          </div>
          <div>
            <label className="form-label">Descripción</label>
            <textarea {...register('descripcion')} placeholder="Describe el contenido..." className="form-input resize-none" rows={3} />
          </div>
          <div>
            <label className="form-label">Categoría</label>
            <select {...register('categoria')} className="form-select">
              <option value="">Sin categoría</option>
              {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Profesor</label>
            <select {...register('profesor_id')} className="form-select">
              <option value="">Sin asignar</option>
              {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Duración (horas)</label>
            <input {...register('duracion_horas')} type="number" min="1" placeholder="Ej: 40" className="form-input" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{editingCourse ? 'Actualizar' : 'Crear Curso'}</Button>
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); reset(); }}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onConfirm={handleDelete} onCancel={() => setConfirmId(null)}
        message="Se eliminará el curso y todas sus inscripciones." />
    </div>
  );
};
