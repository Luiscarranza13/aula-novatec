import { useState, useEffect, useCallback } from 'react';
import { inscripcionService } from '../services/api';

export function useInscripciones(params = {}) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (p = params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await inscripcionService.obtenerTodos(p);
      setData(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.response?.data?.message || 'Error al cargar inscripciones');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, meta, loading, error, reload: load };
}
