/**
 * Hook para ordenamiento de tablas por columna
 * Mejora #38 — Tabla con ordenamiento por columna
 */
import { useState, useMemo } from 'react';

export const useTableSort = (data = [], defaultKey = null, defaultDir = 'asc') => {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      const cmp = typeof va === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'es', { sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <span style={{ opacity: 0.3, fontSize: 10 }}>↕</span>;
    return <span style={{ fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return { sorted, sortKey, sortDir, handleSort, SortIcon };
};
