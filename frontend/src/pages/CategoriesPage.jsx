import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { gsap } from 'gsap';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { categoriaService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export const CategoriesPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (categorias.length > 0)
      gsap.from('.cat-card', { opacity: 0, scale: 0.95, stagger: 0.05, duration: 0.3 });
  }, [categorias.length]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await categoriaService.obtenerTodos();
      setCategorias(res.data || []);
    } catch { toast.error('Error al cargar categorías'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    try {
      await categoriaService.crear(data);
      toast.success('Categoría creada');
      reset(); setShowModal(false); loadData();
    } catch (e) { toast.error(e.response?.data?.message || 'Error al crear'); }
  };

  const handleDelete = async () => {
    try {
      await categoriaService.eliminar(confirmId);
      toast.success('Categoría eliminada');
      setConfirmId(null); loadData();
    } catch { toast.error('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categorías</h1>
          <p className="text-slate-500 text-sm mt-0.5">{categorias.length} categorías registradas</p>
        </div>
        <Button onClick={() => { reset(); setShowModal(true); }}>
          <Plus size={16} className="mr-2" /> Nueva Categoría
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando...</div>
      ) : categorias.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500">No hay categorías aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {categorias.map(cat => (
            <div key={cat.id} className="cat-card">
              <Card className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: cat.color + '22' }}>
                        <Tag size={18} style={{ color: cat.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{cat.nombre}</p>
                        {cat.descripcion && <p className="text-xs text-slate-400 truncate max-w-[120px]">{cat.descripcion}</p>}
                      </div>
                    </div>
                    <button onClick={() => setConfirmId(cat.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="Nueva Categoría">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Nombre *</label>
            <input {...register('nombre', { required: 'Requerido' })} className="form-input" placeholder="Ej: Programación" />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="form-label">Descripción</label>
            <input {...register('descripcion')} className="form-input" placeholder="Descripción opcional" />
          </div>
          <div>
            <label className="form-label">Color</label>
            <input {...register('color')} type="color" defaultValue="#4f46e5" className="h-10 w-full rounded-lg border border-slate-200 cursor-pointer" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Crear Categoría</Button>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onConfirm={handleDelete} onCancel={() => setConfirmId(null)}
        message="Se eliminará la categoría permanentemente." />
    </div>
  );
};
