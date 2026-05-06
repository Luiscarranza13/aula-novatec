/**
 * Store de historial de navegación reciente
 * Mejora #49 — Historial de navegación reciente
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRecentStore = create(
  persist(
    (set, get) => ({
      recent: [], // [{ path, label, icon }]

      addRecent: (item) => {
        const current = get().recent.filter(r => r.path !== item.path);
        set({ recent: [item, ...current].slice(0, 5) });
      },

      clearRecent: () => set({ recent: [] }),
    }),
    { name: 'recent-nav-storage' }
  )
);
