import React, { useEffect, useState } from 'react';
import { Award, Download, BookOpen } from 'lucide-react';
import { inscripcionService, certificadoService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import Swal from 'sweetalert2';

const ACCENT = '#059669';

export const StudentCertificatesPage = () => {
  const { user } = useAuthStore();
  const [completados, setCompletados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    inscripcionService.obtenerTodos().then(r => {
      const ins = Array.isArray(r.data) ? r.data : [];
      setCompletados(ins.filter(i => i.estado === 'completada'));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const descargar = async (curso_id, titulo) => {
    setDownloading(curso_id);
    try {
      const r = await certificadoService.descargar(user.id, curso_id);
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `certificado-${titulo}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el certificado', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    } finally { setDownloading(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Certificados</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Cursos completados con certificado disponible</p>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>
      ) : completados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 16, border: '1px solid #d1fae5' }}>
          <Award size={56} color="#d1fae5" style={{ margin: '0 auto 14px', display: 'block' }} />
          <p style={{ color: '#374151', fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>Aún no tienes certificados</p>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Completa un curso para obtener tu certificado</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {completados.map(ins => (
            <div key={ins.id} style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: 16, border: '1px solid #a7f3d0', padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'rgba(5,150,105,0.08)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', top: 10, right: 10, width: 40, height: 40, background: 'rgba(5,150,105,0.08)', borderRadius: '50%' }} />
              <div style={{ width: 48, height: 48, background: '#d1fae5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Award size={24} color={ACCENT} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#064e3b', margin: '0 0 6px', lineHeight: 1.3 }}>{ins.curso_titulo}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <BookOpen size={12} color={ACCENT} />
                <span style={{ fontSize: 12, color: '#059669' }}>Completado</span>
              </div>
              <button onClick={() => descargar(ins.curso_id, ins.curso_titulo)}
                disabled={downloading === ins.curso_id}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: downloading === ins.curso_id ? 0.7 : 1 }}>
                <Download size={14} />
                {downloading === ins.curso_id ? 'Generando...' : 'Descargar PDF'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
