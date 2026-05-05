import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { gsap } from 'gsap';
import { Plus, Users, Search, Edit, Trash2, Mail, GraduationCap } from 'lucide-react';
import { useUsuarios } from '../hooks/useUsuarios';
import { usuarioService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Pagination } from '../components/ui/Pagination';
import { formatDate } from '../lib/utils';

export const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const { data: usuarios, meta, loading, reload } = useUsuarios({ page, search: search || undefined });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const filtered = filterRol ? usuarios.filter(u => u.rol === filterRol) : usuarios;

  const onSubmit = async (data) => {
    try {
      if (editingUser) {
        await usuarioService.actualizar(editingUser.id, data);
        Swal.fire({ icon: 'success', title: 'Usuario actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      } else {
        await usuarioService.crear(data);
        Swal.fire({ icon: 'success', title: 'Usuario creado', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      }
      reset(); setShowModal(false); setEditingUser(null); reload({ page, search: search || undefined });
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error al guardar', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    reset({ nombre: user.nombre, email: user.email, rol: user.rol });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await usuarioService.eliminar(confirmId);
      Swal.fire({ icon: 'success', title: 'Usuario eliminado', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      setConfirmId(null);
      reload({ page, search: search || undefined });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-slate-500 text-sm mt-0.5">{meta.total ?? usuarios.length} usuarios registrados</p>
        </div>
        <Button onClick={() => { reset(); setEditingUser(null); setShowModal(true); }}>
          <Plus size={16} className="mr-2" /> Nuevo Usuario
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: meta.total ?? usuarios.length, color: 'text-slate-800' },
          { label: 'Estudiantes', value: usuarios.filter(u => u.rol === 'estudiante').length, color: 'text-blue-700' },
          { label: 'Profesores', value: usuarios.filter(u => u.rol === 'profesor').length, color: 'text-purple-700' },
        ].map(({ label, value, color }) => (
          <Card key={label}><CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o email..." className="form-input pl-9" />
        </div>
        <select value={filterRol} onChange={e => setFilterRol(e.target.value)} className="form-select w-full sm:w-44">
          <option value="">Todos los roles</option>
          <option value="estudiante">Estudiantes</option>
          <option value="profesor">Profesores</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-header">#</th>
                  <th className="table-header">Usuario</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Rol</th>
                  <th className="table-header">Registrado</th>
                  <th className="table-header">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">Cargando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12">
                    <Users className="mx-auto text-slate-300 mb-2" size={36} />
                    <p className="text-slate-400 text-sm">No se encontraron usuarios</p>
                  </td></tr>
                ) : filtered.map((user, i) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell text-slate-400 font-mono text-xs">{i + 1}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${user.rol === 'profesor' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                          {user.rol === 'profesor'
                            ? <GraduationCap size={14} className="text-purple-600" />
                            : <span className="text-blue-700 text-xs font-bold">{user.nombre?.[0]?.toUpperCase()}</span>}
                        </div>
                        <span className="font-medium text-slate-800">{user.nombre}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Mail size={13} /><span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {user.rol === 'profesor'
                        ? <Badge variant="purple" dot>Profesor</Badge>
                        : <Badge variant="blue" dot>Estudiante</Badge>}
                    </td>
                    <td className="table-cell text-slate-500 text-xs">{formatDate(user.created_at)}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(user)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit size={14} className="text-slate-500" />
                        </button>
                        <button onClick={() => setConfirmId(user.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
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

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingUser(null); reset(); }}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Nombre completo *</label>
            <input {...register('nombre', { required: 'Requerido' })} placeholder="Juan Pérez" className="form-input" />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input {...register('email', { required: 'Requerido' })} type="email" placeholder="juan@email.com" className="form-input" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          {!editingUser && (
            <div>
              <label className="form-label">Contraseña *</label>
              <input {...register('password', { required: 'Requerido', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                type="password" placeholder="••••••••" className="form-input" />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
          )}
          <div>
            <label className="form-label">Rol</label>
            <select {...register('rol')} className="form-select">
              <option value="estudiante">Estudiante</option>
              <option value="profesor">Profesor</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{editingUser ? 'Actualizar' : 'Crear Usuario'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmId} onConfirm={handleDelete} onCancel={() => setConfirmId(null)}
        message="Se eliminarán también sus inscripciones y calificaciones." />
    </div>
  );
};
