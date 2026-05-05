import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { gsap } from 'gsap';
import { Plus, Bell, Search, Edit, Trash2, Megaphone } from 'lucide-react';
import { anuncioService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatDateTime } from '../lib/utils';

const tipoBadge = { general: 'blue', curso: 'purple', urgente: 'red' };

export const AnnouncementsPage = () => {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [search, setSearch] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (anuncios.length > 0)
      gsap.from('.anuncio-row', { opacity: 0, y: 8, stagger: 0.04, duration: 0.3 });
  }, [anuncios.length]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await anuncioService.obtenerTodos();
      setAnuncios(res.data || []);
    } catch { toast.error('Error al cargar anuncios'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await anuncioService.actualizar(editing.id, data);
        toast.success('Anuncio actualizado');
      } else {
        await anuncioService.crear(data);
        toast.success('Anuncio creado');
      }
      reset(); setShowModal(false); setEditing(null); loadData();
    } catch (e) { toast.error(e.response?.data?.message || 'Error al guardar'); }
  };

  const handleEdit = (a) => { setEditing(a); reset(a); setShowModal(true); };

  const handleDelete = async () => {
    try {
      await anuncioService.eliminar(confirmId);
      toast.success('Anuncio eliminado');
      setConfirmId(null); loadData();
    } catch { toast.error('Error al eliminar'); }
  };

  const filtered = anuncios.filter(a =>
    a.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    a.contenido?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Anuncios</h1>
          <p className="text-slate-500 text-sm mt-0.5">{anuncios.length} anuncios activos</p>
        </div>
        <Button onClick={() => { reset(); setEditing(null); setShowModal(true); }}>
          <Plus size={16} className="mr-2" /> Nuevo Anuncio
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar anuncios..." className="form-input pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-header">Título</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Autor</th>
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400">Cargando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12">
                    <Bell className="mx-auto text-slate-300 mb-2" size={36} />
                    <p className="text-slate-400 text-sm">No hay anuncios</p>
                  </td></tr>
                ) : filtered.map(a => (
                  <tr key={a.id} className="anuncio-row hover:bg-slate-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Megaphone size={14} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800">{a.titulo}</p>
                          <p className="text-xs text-slate-400 truncate max-w-xs">{a.contenido}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <Badge variant={tipoBadge[a.tipo] || 'blue'}>{a.tipo}</Badge>
                    </td>
                    <td className="table-cell text-slate-600 text-sm">{a.autor_nombre || '—'}</td>
                    <td className="table-cell text-slate-500 text-xs">{formatDateTime(a.created_at)}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(a)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit size={14} className="text-slate-500" />
                        </button>
                        <button onClick={() => setConfirmId(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); reset(); }}
        title={editing ? 'Editar Anuncio' : 'Nuevo Anuncio'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Título *</label>
            <input {...register('titulo', { required: 'Requerido' })} className="form-input" placeholder="Título del anuncio" />
            {errors.titulo && <p className="mt-1 text-xs text-red-600">{errors.titulo.message}</p>}
          </div>
          <div>
            <label className="form-label">Contenido *</label>
            <textarea {...register('contenido', { required: 'Requerido' })} className="form-input resize-none" rows={4} placeholder="Contenido del anuncio..." />
            {errors.contenido && <p className="mt-1 text-xs text-red-600">{errors.contenido.message}</p>}
          </div>
          <div>
            <label className="form-label">Tipo</label>
            <select {...register('tipo')} className="form-select">
              <option value="general">General</option>
              <option value="curso">Curso</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{editing ? 'Actualizar' : 'Crear'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onConfirm={handleDelete} onCancel={() => setConfirmId(null)}
        message="El anuncio será desactivado del sistema." />
    </div>
  );
};
