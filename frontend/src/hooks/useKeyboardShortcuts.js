/**
 * Atajos de teclado globales
 * Mejora #42 — Atajos de teclado (Ctrl+K buscador, Esc cerrar modales)
 */
import { useEffect } from 'react';

export const useKeyboardShortcuts = ({ onSearch, onEscape } = {}) => {
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+K o Cmd+K — abrir buscador
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearch?.();
      }
      // Escape — cerrar modal/panel
      if (e.key === 'Escape') {
        onEscape?.();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onSearch, onEscape]);
};

/**
 * Hook para detectar inactividad y cerrar sesión
 * Mejora #9 — Expiración de sesión por inactividad
 */
export const useSessionTimeout = (onTimeout, minutes = 60) => {
  useEffect(() => {
    let timer;

    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(onTimeout, minutes * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(e => document.addEventListener(e, reset, { passive: true }));
    reset(); // iniciar

    return () => {
      clearTimeout(timer);
      events.forEach(e => document.removeEventListener(e, reset));
    };
  }, [onTimeout, minutes]);
};
