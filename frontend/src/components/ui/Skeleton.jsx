/**
 * Skeleton loaders animados
 * Mejora #33 — Skeleton loaders
 */
import React from 'react';
import { useThemeStore } from '../../store/useThemeStore';

const pulse = {
  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
};

// Inyectar keyframes una sola vez
if (typeof document !== 'undefined' && !document.getElementById('skeleton-styles')) {
  const style = document.createElement('style');
  style.id = 'skeleton-styles';
  style.textContent = `
    @keyframes skeleton-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    [data-theme="dark"] .skeleton-base { background: #374151 !important; }
  `;
  document.head.appendChild(style);
}

export const Skeleton = ({ width = '100%', height = 16, borderRadius = 6, style = {} }) => {
  const { darkMode } = useThemeStore();
  return (
    <div
      className="skeleton-base"
      style={{
        width,
        height,
        borderRadius,
        background: darkMode ? '#374151' : '#e5e7eb',
        ...pulse,
        ...style,
      }}
    />
  );
};

export const SkeletonCard = () => (
  <div style={{ background: 'var(--card-bg, #fff)', borderRadius: 12, border: '1px solid var(--border, #e5e7eb)', padding: 20 }}>
    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
      <Skeleton width={44} height={44} borderRadius={10} />
      <div style={{ flex: 1 }}>
        <Skeleton height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={12} />
      </div>
    </div>
    <Skeleton height={12} style={{ marginBottom: 6 }} />
    <Skeleton width="80%" height={12} style={{ marginBottom: 6 }} />
    <Skeleton width="50%" height={12} />
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div style={{ background: 'var(--card-bg, #fff)', borderRadius: 12, border: '1px solid var(--border, #e5e7eb)', overflow: 'hidden' }}>
    {/* Header */}
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, padding: '12px 16px', background: 'var(--bg-subtle, #f8fafc)', borderBottom: '1px solid var(--border, #e5e7eb)' }}>
      {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} height={12} />)}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border, #e5e7eb)' }}>
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} height={12} width={j === 0 ? '80%' : j === cols - 1 ? '50%' : '70%'} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ items = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', background: 'var(--card-bg, #fff)', borderRadius: 10, border: '1px solid var(--border, #e5e7eb)' }}>
        <Skeleton width={36} height={36} borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton height={13} style={{ marginBottom: 6 }} />
          <Skeleton width="60%" height={11} />
        </div>
        <Skeleton width={60} height={24} borderRadius={99} />
      </div>
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <Skeleton height={100} borderRadius={16} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
      {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);
