import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Send, Inbox, Trash2, Plus, Mail } from 'lucide-react';
import { mensajeService, usuarioService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatDateTime } from '../lib/utils';

export const MessagesPage = () => {
  const [bandeja, setBandeja] = useState({ recibidos: [], enviados: [], no_leidos: 0 });
  const [tab, setTab] = useState('recibidos');
  const [showModal, setShowModal] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  const [selected, setSelected] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadData();
    usuarioService.obtenerTodos({ limit: 100 }).then(r => setUsuarios(r.data || []));
  }, []);

  const loadData = async () => {
    try {
      const r = await mensajeService.getBandeja();
      setBandeja(r);
    } catch { toast.error('Error al cargar mensajes'); }
  };

  const onSubmit = async (data) => {
    try {
      await mensajeService.enviar(data);
      toast.success('Mensaje enviado');
      reset(); setShowModal(false); loadData();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const marcarLeido = async (id) => {
    await mensajeService.marcarLeido(id);
    loadData();
  };

  const handleDelete = async () => {
    const id = confirmId;
    setConfirmId(null);
    setSelected(null);
    try {
      await mensajeService.eliminar(id);
      toast.success('Mensaje eliminado');
      loadData();
    } catch { toast.error('Error al eliminar'); }
  };

  const lista = tab === 'recibidos' ? bandeja.recibidos : bandeja.enviados;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mensajes</h1>
          <p className="text-slate-500 text-sm mt-0.5">{bandeja.no_leidos} sin leer</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-2" /> Nuevo mensaje
        </Button>
      </div>

      <div className="flex gap-2">
        {[['recibidos', 'Recibidos', bandeja.no_leidos], ['enviados', 'Enviados', 0]].map(([key, label, badge]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {key === 'recibidos' ? <Inbox size={14} /> : <Send size={14} />}
            {label}
            {badge > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardContent className="p-0 divide-y divide-slate-100">
            {lista.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-slate-400 text-sm">Sin mensajes</p>
              </div>
            ) : lista.map(m => (
              <div key={m.id}
                onClick={() => { setSelected(m); if (tab === 'recibidos' && !m.leido) marcarLeido(m.id); }}
                className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors ${selected?.id === m.id ? 'bg-indigo-50' : ''} ${!m.leido && tab === 'recibidos' ? 'bg-blue-50/40' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm truncate ${!m.leido && tab === 'recibidos' ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>
                    {tab === 'recibidos' ? m.de_nombre : m.para_nombre}
                  </p>
                  {!m.leido && tab === 'recibidos' && <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 truncate">{m.asunto}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(m.created_at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            {!selected ? (
              <div className="text-center py-16 text-slate-400">
                <Mail size={40} className="mx-auto mb-3" />
                <p className="text-sm">Selecciona un mensaje para leerlo</p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">{selected.asunto}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tab === 'recibidos' ? `De: ${selected.de_nombre}` : `Para: ${selected.para_nombre}`} · {formatDateTime(selected.created_at)}
                    </p>
                  </div>
                  <button onClick={() => setConfirmId(selected.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">{selected.contenido}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="Nuevo Mensaje">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Para *</label>
            <select {...register('para_usuario_id', { required: true })} className="form-select">
              <option value="">Seleccionar destinatario</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Asunto</label>
            <input {...register('asunto')} className="form-input" placeholder="Asunto del mensaje" />
          </div>
          <div>
            <label className="form-label">Mensaje *</label>
            <textarea {...register('contenido', { required: 'Requerido' })} className="form-input resize-none" rows={5} placeholder="Escribe tu mensaje..." />
            {errors.contenido && <p className="mt-1 text-xs text-red-600">{errors.contenido.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1"><Send size={14} className="mr-2" /> Enviar</Button>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onConfirm={handleDelete} onCancel={() => setConfirmId(null)} message="Se eliminará el mensaje permanentemente." />
    </div>
  );
};
