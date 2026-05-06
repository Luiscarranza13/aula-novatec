/**
 * Contador de caracteres para textareas
 * Mejora #46 — Contador de caracteres
 */
import React from 'react';

export const CharCounter = ({ value = '', max = 500, style = {} }) => {
  const count = value?.length || 0;
  const pct = count / max;
  const color = pct > 0.9 ? '#dc2626' : pct > 0.75 ? '#d97706' : '#9ca3af';

  return (
    <span style={{ fontSize: 11, color, textAlign: 'right', display: 'block', marginTop: 3, ...style }}>
      {count} / {max}
    </span>
  );
};

/**
 * Textarea con contador integrado
 */
export const TextareaWithCounter = ({ value, onChange, max = 500, placeholder, rows = 3, style = {}, ...props }) => (
  <div>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      maxLength={max}
      style={{
        width: '100%',
        padding: '9px 12px',
        borderRadius: 9,
        border: '1px solid var(--border, #e2e8f0)',
        fontSize: 13,
        outline: 'none',
        resize: 'vertical',
        background: 'var(--input-bg, #fff)',
        color: 'var(--text-primary, #111827)',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    />
    <CharCounter value={value} max={max} />
  </div>
);
