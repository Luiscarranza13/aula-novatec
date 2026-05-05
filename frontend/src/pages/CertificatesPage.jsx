import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Award, Download } from 'lucide-react';
import { certificadoService, calificacionService } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const CertificatesPage = () => {
  const { user } = useAuthStore();
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    calificacionService.obtenerTodos({ limit: 100 }).then(r => {
      const todas = r.data || [];
      // Admin ve todas; otros usuarios solo las suyas
      const mias = user?.rol === 'admin' ? todas
        : todas.filter(c => String(c.usuario_id) === String(user?.id));
      setCalificaciones(mias);
    });
  }, [user]);

  const descargar = async (cal) => {
    setLoading(prev => ({ ...prev, [cal.id]: true }));
    try {
      const r = await certificadoService.descargar(cal.usuario_id, cal.curso_id);
      const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `certificado-${cal.curso_titulo}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Certificado descargado');
    } catch (e) {
      toast.error(e.response?.data?.message || 'No disponible');
    } finally {
      setLoading(prev => ({ ...prev, [cal.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Certificados</h1>
        <p className="text-slate-500 text-sm mt-0.5">Descarga tus certificados de cursos aprobados</p>
      </div>

      {calificaciones.length === 0 ? (
        <div className="text-center py-16">
          <Award className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500">No tienes calificaciones registradas aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {calificaciones.map(cal => {
            const aprobado = cal.nota >= 60;
            return (
              <Card key={cal.id} className={`transition-all ${aprobado ? 'hover:shadow-md' : 'opacity-70'}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${aprobado ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                      <Award size={20} className={aprobado ? 'text-yellow-600' : 'text-slate-400'} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{cal.curso_titulo}</p>
                      <p className={`text-lg font-bold ${aprobado ? 'text-emerald-600' : 'text-red-500'}`}>{cal.nota} / 100</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={aprobado ? 'green' : 'red'}>{aprobado ? 'Aprobado' : 'Reprobado'}</Badge>
                    {aprobado && (
                      <Button size="sm" onClick={() => descargar(cal)} loading={loading[cal.id]}>
                        <Download size={12} className="mr-1" /> PDF
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
