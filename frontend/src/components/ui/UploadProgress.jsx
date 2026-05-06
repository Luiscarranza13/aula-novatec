/**
 * Indicador de progreso de subida de archivos
 * Mejora #44 — Indicador de progreso en subida de archivos
 */
import React from 'react';
import { Upload, CheckCircle } from 'lucide-react';

export const UploadProgress = ({ progress = 0, filename = '', done = false }) => {
  if (progress === 0 && !done) return null;

  return (
    <div style={{
      background: 'var(--card-bg, #fff)',
      border: '1px solid var(--border, #e2e8f0)',
      borderRadius: 10,
      padding: '12px 16px',
      marginTop: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {done
          ? <CheckCircle size={16} color="#059669" />
          : <Upload size={16} color="#4f46e5" style={{ animation: 'spin 1s linear infinite' }} />
        }
        <span style={{ fontSize: 12, color: 'var(--text-secondary, #6b7280)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {filename || 'Subiendo archivo...'}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: done ? '#059669' : '#4f46e5' }}>
          {done ? '✓' : `${progress}%`}
        </span>
      </div>
      <div style={{ height: 6, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${done ? 100 : progress}%`,
          background: done ? '#059669' : '#4f46e5',
          borderRadius: 99,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};

/**
 * Hook para subida con progreso usando axios
 */
export const useUploadProgress = () => {
  const [progress, setProgress] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [filename, setFilename] = React.useState('');

  const reset = () => { setProgress(0); setDone(false); setFilename(''); };

  const getConfig = (file) => {
    if (file) setFilename(file.name);
    return {
      onUploadProgress: (e) => {
        const pct = Math.round((e.loaded * 100) / e.total);
        setProgress(pct);
        if (pct === 100) setTimeout(() => setDone(true), 300);
      },
    };
  };

  return { progress, done, filename, reset, getConfig };
};
