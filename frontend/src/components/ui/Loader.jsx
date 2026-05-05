import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export const Loader = ({ fullScreen = false, text = 'Cargando...' }) => {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simular progreso
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) { clearInterval(interval); return 95; }
        return p + Math.random() * 12;
      });
    }, 180);

    const ctx = gsap.context(() => {
      // Logo flota
      gsap.to('.ld-logo', {
        y: -8, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut'
      });
      // Anillo exterior gira
      gsap.to('.ld-ring-outer', {
        rotation: 360, duration: 2.5, repeat: -1, ease: 'none',
        transformOrigin: '50% 50%'
      });
      // Anillo interior gira al revés
      gsap.to('.ld-ring-inner', {
        rotation: -360, duration: 1.8, repeat: -1, ease: 'none',
        transformOrigin: '50% 50%'
      });
      // Partículas orbitando
      gsap.to('.ld-particle', {
        rotation: 360, duration: 3, repeat: -1, ease: 'none',
        transformOrigin: '50px 50px', stagger: { each: 0.4 }
      });
      // Brillo pulsante
      gsap.to('.ld-glow', {
        opacity: 0.8, scale: 1.4, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut'
      });
      // Texto fade
      gsap.to('.ld-text', {
        opacity: 0.4, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut'
      });
    }, ref);

    return () => { ctx.revert(); clearInterval(interval); };
  }, []);

  const wrap = fullScreen ? {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #2d1b69 70%, #0f172a 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  } : {
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48,
    background: 'transparent',
  };

  return (
    <div ref={ref} style={wrap}>
      {/* Fondo con grid sutil */}
      {fullScreen && (
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, position: 'relative' }}>

        {/* Logo con anillos y partículas */}
        <div style={{ position: 'relative', width: 200, height: 200 }}>

          {/* Glow de fondo */}
          <div className="ld-glow" style={{
            position: 'absolute', inset: -32, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(168,85,247,0.15) 50%, transparent 70%)',
            opacity: 0.4,
          }} />

          {/* Anillo exterior con dash */}
          <svg className="ld-ring-outer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 200 200">
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="94" fill="none" stroke="url(#g1)" strokeWidth="3"
              strokeLinecap="round" strokeDasharray="300 292" />
          </svg>

          {/* Anillo interior */}
          <svg className="ld-ring-inner" style={{ position: 'absolute', inset: 14, width: 'calc(100% - 28px)', height: 'calc(100% - 28px)' }} viewBox="0 0 172 172">
            <defs>
              <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="86" cy="86" r="80" fill="none" stroke="url(#g2)" strokeWidth="2"
              strokeLinecap="round" strokeDasharray="130 372" />
          </svg>

          {/* Partículas orbitando */}
          {[0, 1, 2].map((i) => (
            <svg key={i} className="ld-particle" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              transform: `rotate(${i * 120}deg)`,
            }} viewBox="0 0 200 200">
              <circle cx="100" cy="8" r={5 - i}
                fill={['#6366f1', '#a855f7', '#c084fc'][i]}
                style={{ filter: `drop-shadow(0 0 6px ${['#6366f1', '#a855f7', '#c084fc'][i]})` }}
              />
            </svg>
          ))}

          {/* Logo central */}
          <div className="ld-logo" style={{
            position: 'absolute', inset: 26,
            background: '#ffffff',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(168,85,247,0.2)',
            border: '3px solid rgba(99,102,241,0.25)',
          }}>
            <img src="/logo.png" alt="Aula Virtual" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* Texto */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 22, fontWeight: 800, margin: '0 0 6px',
            background: 'linear-gradient(135deg, #818cf8, #c084fc, #818cf8)',
            backgroundSize: '200%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.3px',
          }}>
            Aula Virtual
          </p>
          <p className="ld-text" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '0.5px' }}>
            {text}
          </p>
        </div>

        {/* Barra de progreso */}
        <div style={{ width: 200 }}>
          <div style={{
            height: 3, background: 'rgba(255,255,255,0.08)',
            borderRadius: 99, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              width: `${Math.min(progress, 100)}%`,
              transition: 'width 0.2s ease',
              boxShadow: '0 0 8px rgba(99,102,241,0.6)',
            }} />
          </div>
          <p style={{ textAlign: 'right', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
            {Math.round(Math.min(progress, 100))}%
          </p>
        </div>
      </div>
    </div>
  );
};
