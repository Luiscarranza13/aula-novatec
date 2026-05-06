/**
 * Zona de drag & drop para subir archivos
 * Mejora #36 — Drag & drop para subir archivos
 */
import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DropZone = ({
  onFile,
  accept = '*',
  maxSizeMB = 10,
  label = 'Arrastra un archivo aquí o haz clic para seleccionar',
  currentFile = null,
  onClear = null,
}) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const validate = (file) => {
    if (!file) return 'No se seleccionó archivo';
    if (file.size > maxSizeMB * 1024 * 1024) return `El archivo supera el límite de ${maxSizeMB}MB`;
    return null;
  };

  const handleFile = (file) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError('');
    // Preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    onFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInputChange = (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); };

  const displayFile = currentFile;

  return (
    <div>
      {displayFile ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
          background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 10,
        }}>
          {preview
            ? <img src={preview} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
            : <div style={{ width: 40, height: 40, background: '#d1fae5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <File size={18} color="#059669" />
              </div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayFile.name}
            </p>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{formatSize(displayFile.size)}</p>
          </div>
          <CheckCircle size={18} color="#059669" />
          {onClear && (
            <button onClick={onClear} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          role="button"
          tabIndex={0}
          aria-label="Zona de carga de archivos"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#4f46e5' : '#d1d5db'}`,
            borderRadius: 12,
            padding: '28px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? '#eef2ff' : 'var(--bg-subtle, #f8fafc)',
            transition: 'all 0.2s',
          }}
        >
          <Upload size={28} color={dragging ? '#4f46e5' : '#9ca3af'} style={{ margin: '0 auto 10px', display: 'block' }} />
          <p style={{ fontSize: 13, color: dragging ? '#4f46e5' : '#6b7280', margin: 0, fontWeight: dragging ? 600 : 400 }}>
            {dragging ? 'Suelta el archivo aquí' : label}
          </p>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>Máximo {maxSizeMB}MB</p>
          <input ref={inputRef} type="file" accept={accept} onChange={onInputChange} style={{ display: 'none' }} />
        </div>
      )}
      {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{error}</p>}
    </div>
  );
};
