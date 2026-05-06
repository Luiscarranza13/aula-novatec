/**
 * Página de Configuración del Sistema
 * Mejora #76 — Configuración global del sistema
 * Mejora #47 — Tema de color personalizable
 */
import React, { useEffect, useState } from 'react';
import { Settings, Save, Palette, Shield } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import api from '../services/api';
import Swal from 'sweetalert2';

const Section = ({ icon: Icon, title, children, accent = '#4f46e5' }) => (
  <div style={{ background: 'var(--card-bg, #fff)', borderRadius: 14, border: '1px solid var(--border, #e2e8f0)', padding: 24, marginBottom: 20 }}>
    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #111827)', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={16} color={accent} /> {title}
    </h3>
    {children}
  </div>
);

export const ConfiguracionPage = () => {
  const { darkMode, toggleDarkMode, primaryColor, setPrimaryColor } = useThemeStore();
  const [config, setConfig] = useState({
    nombre_plataforma: 'Aula Virtual',
    color_primario: '#4f46e5',
    max_intentos_login: '5',
    timeout_sesion: '60',
    permitir_registro: '1',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/configuracion').then(r => {
      if (r.data?.data) setConfig(prev => ({ ...prev, ...r.data.data }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/configuracion', config);
      // Aplicar color primario
      setPrimaryColor(config.color_primario);
      Swal.fire({ icon: 'success', title: 'Configuración guardada', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Error al guardar', toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    } finally { setSaving(false); }
  };

  const field = (key, label, type = 'text', options = null) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #374151)', display: 'block', marginBottom: 5 }}>{label}</label>
      {options ? (
        <select value={config[key]} onChange={e => setConfig(p => ({ ...p, [key]: e.target.value }))}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border, #e2e8f0)', fontSize: 13, outline: 'none', background: 'var(--input-bg, #fff)', color: 'var(--text-primary, #111827)' }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} value={config[key]} onChange={e => setConfig(p => ({ ...p, [key]: e.target.value }))}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border, #e2e8f0)', fontSize: 13, outline: 'none', background: 'var(--input-bg, #fff)', color: 'var(--text-primary, #111827)', boxSizing: 'border-box' }} />
      )}
    </div>
  );

  if (loading) return <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Cargando...</p>;

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #111827)', margin: 0 }}>Configuración del Sistema</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #6b7280)', marginTop: 4 }}>Personaliza el comportamiento de la plataforma</p>
      </div>

      <Section icon={Settings} title="General">
        {field('nombre_plataforma', 'Nombre de la plataforma')}
        {field('permitir_registro', 'Registro de nuevos usuarios', 'text', [
          { value: '1', label: '✅ Permitido' },
          { value: '0', label: '🚫 Desactivado' },
        ])}
      </Section>

      <Section icon={Palette} title="Apariencia" accent="#7c3aed">
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #374151)', display: 'block', marginBottom: 5 }}>Color primario</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="color" value={config.color_primario}
              onChange={e => setConfig(p => ({ ...p, color_primario: e.target.value }))}
              style={{ width: 48, height: 38, borderRadius: 8, border: '1px solid var(--border, #e2e8f0)', cursor: 'pointer', padding: 2 }} />
            <input value={config.color_primario} onChange={e => setConfig(p => ({ ...p, color_primario: e.target.value }))}
              style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border, #e2e8f0)', fontSize: 13, outline: 'none', background: 'var(--input-bg, #fff)', color: 'var(--text-primary, #111827)' }} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #374151)', display: 'block', marginBottom: 8 }}>Modo oscuro</label>
          <button onClick={toggleDarkMode}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: darkMode ? '#1e293b' : '#f1f5f9', border: '1px solid var(--border, #e2e8f0)', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary, #111827)' }}>
            {darkMode ? '🌙 Modo oscuro activo' : '☀️ Modo claro activo'} — Clic para cambiar
          </button>
        </div>
      </Section>

      <Section icon={Shield} title="Seguridad" accent="#dc2626">
        {field('max_intentos_login', 'Máximo de intentos de login antes de bloquear', 'number')}
        {field('timeout_sesion', 'Minutos de inactividad para cerrar sesión', 'number')}
      </Section>

      <button onClick={handleSave} disabled={saving}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
        <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Configuración'}
      </button>
    </div>
  );
};
