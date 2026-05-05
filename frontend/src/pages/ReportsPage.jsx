import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Download, TrendingUp } from 'lucide-react';
import { reporteService, cursoService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

export const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState('');
  const [tipoExport, setTipoExport] = useState('calificaciones');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    reporteService.estadisticas().then(r => setStats(r.data));
    cursoService.obtenerTodos({ limit: 100 }).then(r => setCursos(r.data || []));
  }, []);

  const exportar = async () => {
    setLoading(true);
    try {
      const r = await reporteService.exportarCSV({ tipo: tipoExport, curso_id: cursoId || undefined });
      const url = URL.createObjectURL(new Blob([r.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url; a.download = `${tipoExport}-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV descargado');
    } catch { toast.error('Error al exportar'); }
    finally { setLoading(false); }
  };

  const barData = stats ? {
    labels: stats.notasPorCurso.map(c => c.titulo.slice(0, 20)),
    datasets: [{ label: 'Promedio', data: stats.notasPorCurso.map(c => c.promedio), backgroundColor: '#4f46e5', borderRadius: 6 }],
  } : null;

  const pieData = stats ? {
    labels: stats.porCategoria.map(c => c.categoria),
    datasets: [{ data: stats.porCategoria.map(c => c.total), backgroundColor: ['#4f46e5','#7c3aed','#059669','#f59e0b','#3b82f6','#ef4444'] }],
  } : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
        <p className="text-slate-500 text-sm mt-0.5">Estadísticas y exportación de datos</p>
      </div>

      {/* Estadísticas generales */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Estudiantes', value: stats.totales.estudiantes, color: 'text-blue-600' },
            { label: 'Profesores', value: stats.totales.profesores, color: 'text-purple-600' },
            { label: 'Cursos', value: stats.totales.cursos, color: 'text-indigo-600' },
            { label: 'Promedio general', value: stats.totales.promedio_general || '—', color: 'text-yellow-600' },
            { label: 'Inscripciones', value: stats.totales.inscripciones, color: 'text-green-600' },
            { label: 'Aprobados', value: stats.totales.aprobados, color: 'text-emerald-600' },
            { label: 'Reprobados', value: stats.totales.reprobados, color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <Card key={label}><CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </CardContent></Card>
          ))}
        </div>
      )}

      {/* Gráficas */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {barData && barData.labels.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <p className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={16} /> Promedio por curso
                </p>
                <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }} />
              </CardContent>
            </Card>
          )}
          {pieData && pieData.labels.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <p className="font-semibold text-slate-800 mb-4">Cursos por categoría</p>
                <div className="max-w-xs mx-auto">
                  <Pie data={pieData} options={{ responsive: true }} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Exportar CSV */}
      <Card>
        <CardContent className="p-5">
          <p className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Download size={16} /> Exportar a CSV
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={tipoExport} onChange={e => setTipoExport(e.target.value)} className="form-select w-full sm:w-48">
              <option value="calificaciones">Calificaciones</option>
              <option value="inscripciones">Inscripciones</option>
              <option value="asistencias">Asistencias</option>
            </select>
            <select value={cursoId} onChange={e => setCursoId(e.target.value)} className="form-select flex-1">
              <option value="">Todos los cursos</option>
              {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </select>
            <Button onClick={exportar} loading={loading} className="flex-shrink-0">
              <Download size={14} className="mr-2" /> Descargar CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
