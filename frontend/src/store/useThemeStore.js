/**
 * Store de tema (dark mode)
 * Mejora #31 — Modo oscuro
 * Mejora #47 — Tema de color personalizable
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      darkMode: false,
      primaryColor: '#4f46e5',
      sidebarCompact: false,  // Mejora #48

      toggleDarkMode: () => {
        const next = !get().darkMode;
        set({ darkMode: next });
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      },

      setPrimaryColor: (color) => {
        set({ primaryColor: color });
        document.documentElement.style.setProperty('--color-primary', color);
      },

      toggleSidebarCompact: () => set(s => ({ sidebarCompact: !s.sidebarCompact })),

      // Aplicar tema al cargar
      applyTheme: () => {
        const { darkMode, primaryColor } = get();
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        document.documentElement.style.setProperty('--color-primary', primaryColor);
      },
    }),
    { name: 'theme-storage' }
  )
);
