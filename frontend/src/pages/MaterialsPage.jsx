import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, FileText, Link, Video, Image, Trash2, ExternalLink } from 'lucide-react';
import { materialService, cursoService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatDate } from '../lib/utils';

const tipoIcon = { pdf: <FileText size={16} className="text-red-500" />, video: <Video size={16} className="text-blue-500" />, imagen: <Image size={16} className="text-green-500" />, enlace: <Link size={16} className="text-indigo-500" />, documento: <FileText size={16} className="text-orange-500" /> };
const tipoBadge = { pdf: 'red', video: 'blue', imagen: 'green', enlace: 'indigo', documento: 'orange' };

export const MaterialsPage = () => {
  const [materiales, setMateriales] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [archivoFile, setArchivoFile] = useState(null);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: { tipo: 'enlace' } });
  const tipo = watch('tipo');

  useEffect(() => {
    cursoService.obtenerTodos({ limit: 100 })
      .then(r => setCursos(r.data || []))
      .catch(e => toast.error('Error cargando cursos: ' + (e.response?.data?.message || e.message)));
  }, []);

  useEffect(() => {
    if (cursoId) materialService.getByCurso(cursoId)
      .then(r => setMateriales(r.data || []))
      .catch(() => setMateriales([]));
    else setMateriales([]);
  }, [cursoId]);

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v && fd.append(k, v));
      if (archivoFile) fd.append('archivo', archivoFile);
      await materialService.crear(fd);
      toast.success('Material agregado');
      reset(); setShowModal(false); setArchivoFile(null);
      if (cursoId) materialService.getByCurso(cursoId).then(r => setMateriales(r.data || []));
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => {
    const id = confirmId;
    setConfirmId(null);
    try {
      await materialService.eliminar(id);
      toast.success('Material eliminado');
      if (cursoId) materialService.getByCurso(cursoId).then(r => setMateriales(r.data || []));
    } catch { toast.error('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Materiales</h1>
          <p className="text-slate-500 text-sm mt-0.5">Recursos por curso</p>
        </div>
        <Button onClick={() => { reset(); setShowModal(true); }}>
          <Plus size={16} className="mr-2" /> Agregar Material
        </Button>
      </div>

      <select value={cursoId} onChange={e => setCursoId(e.target.value)} className="form-select w-full sm:w-72">
        <option value="">Seleccionar curso para ver materiales</option>
        {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
      </select>

      {!cursoId ? (
        <div className="text-center py-16 text-slate-400">
          <FileText size={40} className="mx-auto mb-3" />
          <p className="text-sm">Selecciona un curso para ver sus materiales</p>
        </div>
      ) : materiales.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText size={40} className="mx-auto mb-3" />
          <p className="text-sm">No hay materiales en este curso</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {materiales.map(m => (
            <Card key={m.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {tipoIcon[m.tipo] || tipoIcon.enlace}
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{m.titulo}</p>
                      <p className="text-xs text-slate-400">{m.autor_nombre} · {formatDate(m.created_at)}</p>
                    </div>
                  </div>
                  <button onClick={() => setConfirmId(m.id)} className="p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0">
                    <Trash2 size={13} className="text-red-500" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant={tipoBadge[m.tipo] || 'blue'}>{m.tipo}</Badge>
                  {m.url && (
                    <a href={m.url.startsWith('/') ? `http://localhost:3001${m.url}` : m.url}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                      <ExternalLink size={11} /> Abrir
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="Agregar Material">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Título *</label>
            <input {...register('titulo', { required: 'Requerido' })} className="form-input" placeholder="Nombre del material" />
            {errors.titulo && <p className="mt-1 text-xs text-red-600">{errors.titulo.message}</p>}
          </div>
          <div>
            <label className="form-label">Curso *</label>
            <select {...register('curso_id', { required: true })} className="form-select">
              <option value="">Seleccionar curso</option>
              {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Tipo</label>
            <select {...register('tipo')} className="form-select">
              {['enlace', 'pdf', 'video', 'documento', 'imagen'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {tipo === 'enlace' ? (
            <div>
              <label className="form-label">URL</label>
              <input {...register('url')} className="form-input" placeholder="https://..." />
            </div>
          ) : (
            <div>
              <label className="form-label">Archivo</label>
              <input type="file" onChange={e => setArchivoFile(e.target.files[0])} className="form-input" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Agregar</Button>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onConfirm={handleDelete} onCancel={() => setConfirmId(null)} message="Se eliminará el material permanentemente." />
    </div>
  );
};
