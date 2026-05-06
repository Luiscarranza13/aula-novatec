import React, { useEffect, useState } from 'react';
import { FileText, Link2, Video, Image, File, Download, BookOpen } from 'lucide-react';
import { materialService, inscripcionService } from '../../services/api';

const ACCENT = '#059669';

const tipoIcon = (tipo) => {
  const map = { enlace: Link2, pdf: FileText, video: Video, imagen: Image, documento: File };
  return map[tipo] || File;
};
const tipoColor = (tipo) => {
  const map = { enlace: '#2563eb', pdf: '#dc2626', video: '#7c3aed', imagen: '#d97706', documento: '#059669' };
  return map[tipo] || '#6b7280';
};
const tipoBg = (tipo) => {
  const map = { enlace: '#dbeafe', pdf: '#fee2e2', video: '#ede9fe', imagen: '#fef3c7', documento: '#d1fae5' };
  return map[tipo] || '#f1f5f9';
};

export const StudentMaterialsPage = () => {
  const [cursos, setCursos] = useState([]);
  const [cursosConMateriales, setCursosConMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursoActivo, setCursoActivo] = useState(null);

  useEffect(() => {
    inscripcionService.obtenerTodos().then(async r => {
      const ins = Array.isArray(r.data) ? r.data : [];
      setCursos(ins);
      if (ins.length > 0) {
        const results = await Promise.all(
          ins.map(async i => {
            const mats = await materialService.getByCurso(i.curso_id).catch(() => ({ data: [] }));
            return { ...i, materiales: mats.data || [] };
          })
        );
        setCursosConMateriales(results);
        setCursoActivo(results[0]?.curso_id || null);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cursoSeleccionado = cursosConMateriales.find(c => c.curso_id === cursoActivo);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Materiales</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Recursos de tus cursos</p>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>
      ) : cursos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <FileText size={48} color="#d1fae5" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>No tienes cursos inscritos</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
          {/* Sidebar cursos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cursosConMateriales.map(c => (
              <button key={c.curso_id} onClick={() => setCursoActivo(c.curso_id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', background: cursoActivo === c.curso_id ? '#d1fae5' : '#fff', color: cursoActivo === c.curso_id ? ACCENT : '#374151', fontWeight: cursoActivo === c.curso_id ? 600 : 400, fontSize: 13, borderLeft: cursoActivo === c.curso_id ? `3px solid ${ACCENT}` : '3px solid transparent' }}>
                <BookOpen size={14} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.curso_titulo}</span>
                <span style={{ fontSize: 10, background: cursoActivo === c.curso_id ? ACCENT : '#e5e7eb', color: cursoActivo === c.curso_id ? '#fff' : '#6b7280', borderRadius: 99, padding: '1px 6px', fontWeight: 700 }}>
                  {c.materiales.length}
                </span>
              </button>
            ))}
          </div>

          {/* Materiales del curso */}
          <div>
            {!cursoSeleccionado || cursoSeleccionado.materiales.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 14, border: '1px solid #d1fae5' }}>
                <FileText size={40} color="#d1fae5" style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ color: '#9ca3af', fontSize: 13 }}>Sin materiales en este curso</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {cursoSeleccionado.materiales.map(m => {
                  const Icon = tipoIcon(m.tipo);
                  const color = tipoColor(m.tipo);
                  const bg = tipoBg(m.tipo);
                  return (
                    <div key={m.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 40, height: 40, background: bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={18} color={color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.titulo}</p>
                        <span style={{ fontSize: 10, fontWeight: 600, color, background: bg, padding: '1px 7px', borderRadius: 99, display: 'inline-block', marginTop: 4 }}>{m.tipo}</span>
                        {m.url && (
                          <a href={m.url.startsWith('http') ? m.url : `http://localhost:3001${m.url}`}
                            target="_blank" rel="noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>
                            <Download size={12} /> Abrir / Descargar
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
