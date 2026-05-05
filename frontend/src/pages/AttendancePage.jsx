import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Save, Users } from 'lucide-react';
import { asistenciaService, cursoService, inscripcionService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../lib/utils';

export const AttendancePage = () => {
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencia, setAsistencia] = useState({});
  const [resumen, setResumen] = useState([]);
  const [tab, setTab] = useState('registrar');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cursoService.obtenerTodos({ limit: 100 })
      .then(r => setCursos(r.data || []))
      .catch(() => toast.error('Error cargando cursos'));
  }, []);

  useEffect(() => {
    if (!cursoId) return;
    inscripcionService.obtenerTodos({ limit: 100, search: '' })
      .then(r => {
        const inscritos = (r.data || []).filter(i => String(i.curso_id) === String(cursoId));
        setEstudiantes(inscritos);
        const init = {};
        inscritos.forEach(i => { init[i.usuario_id] = true; });
        setAsistencia(init);
      })
      .catch(() => toast.error('Error cargando estudiantes'));
    asistenciaService.getResumen(cursoId)
      .then(r => setResumen(r.data || []))
      .catch(() => {});
  }, [cursoId]);

  const toggle = (uid) => setAsistencia(prev => ({ ...prev, [uid]: !prev[uid] }));

  const guardar = async () => {
    if (!cursoId || !fecha) return toast.error('Selecciona curso y fecha');
    setLoading(true);
    try {
      const registros = estudiantes.map(e => ({
        usuario_id: e.usuario_id, curso_id: cursoId,
        fecha, presente: asistencia[e.usuario_id] ?? true,
      }));
      await asistenciaService.registrar({ registros });
      toast.success('Asistencia guardada');
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Asistencia</h1>
        <p className="text-slate-500 text-sm mt-0.5">Registro y seguimiento de asistencia por curso</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select value={cursoId} onChange={e => setCursoId(e.target.value)} className="form-select flex-1">
          <option value="">Seleccionar curso</option>
          {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="form-input w-full sm:w-44" />
      </div>

      <div className="flex gap-2">
        {['registrar', 'resumen'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {t === 'registrar' ? 'Registrar asistencia' : 'Resumen por estudiante'}
          </button>
        ))}
      </div>

      {tab === 'registrar' && (
        <Card>
          <CardContent className="p-0">
            {!cursoId ? (
              <div className="text-center py-12 text-slate-400">
                <Users size={36} className="mx-auto mb-2" />
                <p className="text-sm">Selecciona un curso para registrar asistencia</p>
              </div>
            ) : estudiantes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No hay estudiantes inscritos</div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="table-header">Estudiante</th>
                      <th className="table-header text-center">Presente</th>
                      <th className="table-header text-center">Ausente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {estudiantes.map(e => (
                      <tr key={e.usuario_id} className="hover:bg-slate-50">
                        <td className="table-cell font-medium text-slate-800">{e.usuario_nombre}</td>
                        <td className="table-cell text-center">
                          <button onClick={() => setAsistencia(p => ({ ...p, [e.usuario_id]: true }))}
                            className={`p-1.5 rounded-lg transition-colors ${asistencia[e.usuario_id] ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'}`}>
                            <CheckCircle size={20} />
                          </button>
                        </td>
                        <td className="table-cell text-center">
                          <button onClick={() => setAsistencia(p => ({ ...p, [e.usuario_id]: false }))}
                            className={`p-1.5 rounded-lg transition-colors ${!asistencia[e.usuario_id] ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:bg-slate-100'}`}>
                            <XCircle size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 border-t border-slate-100">
                  <Button onClick={guardar} loading={loading}>
                    <Save size={15} className="mr-2" /> Guardar asistencia del {formatDate(fecha)}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'resumen' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-header">Estudiante</th>
                  <th className="table-header">Clases</th>
                  <th className="table-header">Presentes</th>
                  <th className="table-header">% Asistencia</th>
                  <th className="table-header">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resumen.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">Sin datos de asistencia</td></tr>
                ) : resumen.map(r => (
                  <tr key={r.usuario_id} className="hover:bg-slate-50">
                    <td className="table-cell font-medium text-slate-800">{r.nombre}</td>
                    <td className="table-cell text-slate-600">{r.total_clases || 0}</td>
                    <td className="table-cell text-slate-600">{r.presentes || 0}</td>
                    <td className="table-cell font-semibold">{r.porcentaje || 0}%</td>
                    <td className="table-cell">
                      {(r.porcentaje || 0) >= 80
                        ? <Badge variant="green">Regular</Badge>
                        : <Badge variant="red">En riesgo</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
