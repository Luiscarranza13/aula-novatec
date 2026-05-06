/**
 * Banner de error de red global
 * Mejora #34 — Manejo global de errores de red
 */
import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const NetworkError = () => {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleOffline = () => { setOffline(true); setShow(true); };
    const handleOnline  = () => { setOffline(false); setTimeout(() => setShow(false), 3000); };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: offline ? '#dc2626' : '#059669',
      color: '#fff', padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontSize: 13, fontWeight: 600,
      transition: 'background 0.3s',
    }}>
      {offline ? (
        <>
          <WifiOff size={16} />
          Sin conexión a internet. Verifica tu red.
          <button onClick={() => window.location.reload()}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12 }}>
            <RefreshCw size={12} /> Reintentar
          </button>
        </>
      ) : (
        <>✅ Conexión restaurada</>
      )}
    </div>
  );
};
