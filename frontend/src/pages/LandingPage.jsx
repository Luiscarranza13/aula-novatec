import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  GraduationCap, BookOpen, Users, Award, Star, Shield,
  MessageCircle, TrendingUp, CheckCircle, ArrowRight,
  Monitor, Database, Code2, Palette, BarChart2, Server
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: '500+', label: 'Estudiantes activos' },
  { value: '50+', label: 'Cursos disponibles' },
  { value: '30+', label: 'Profesores expertos' },
  { value: '98%', label: 'Satisfacción' },
];

const FEATURES = [
  { Icon: BookOpen,      title: 'Aprende a tu ritmo',     desc: 'Accede a los cursos cuando quieras, desde cualquier dispositivo.' },
  { Icon: Users,         title: 'Profesores expertos',    desc: 'Aprende de profesionales con años de experiencia en su área.' },
  { Icon: BarChart2,     title: 'Seguimiento de progreso',desc: 'Visualiza tu avance con calificaciones y estadísticas en tiempo real.' },
  { Icon: Award,         title: 'Certificaciones',        desc: 'Obtén certificados al completar cada curso satisfactoriamente.' },
  { Icon: MessageCircle, title: 'Comunidad activa',       desc: 'Conecta con otros estudiantes y comparte conocimiento.' },
  { Icon: Shield,        title: 'Plataforma segura',      desc: 'Tus datos y progreso están protegidos con la mejor tecnología.' },
];

const COURSES = [
  { title: 'Desarrollo Web Completo',  cat: 'Programación',   color: '#4f46e5', Icon: Monitor,   students: 120 },
  { title: 'Diseño UX/UI Moderno',     cat: 'Diseño',         color: '#7c3aed', Icon: Palette,   students: 85  },
  { title: 'Python para Data Science', cat: 'Datos',          color: '#0891b2', Icon: BarChart2, students: 95  },
  { title: 'Node.js Avanzado',         cat: 'Backend',        color: '#059669', Icon: Server,    students: 70  },
  { title: 'Base de Datos MySQL',      cat: 'Bases de Datos', color: '#d97706', Icon: Database,  students: 110 },
  { title: 'React desde Cero',         cat: 'Frontend',       color: '#dc2626', Icon: Code2,     students: 140 },
];

export const LandingPage = () => {
  const navRef    = useRef(null);
  const statsRef  = useRef(null);
  const featRef   = useRef(null);
  const coursesRef= useRef(null);
  const ctaRef    = useRef(null);

  useEffect(() => {
    // Nav
    gsap.fromTo(navRef.current, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    // Hero
    gsap.fromTo('.hero-left',  { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1,   ease: 'power3.out', delay: 0.3 });
    gsap.fromTo('.hero-right', { x:  60, opacity: 0 }, { x: 0, opacity: 1, duration: 1,   ease: 'power3.out', delay: 0.5 });
    // Floating cards
    gsap.to('.fc1', { y: -14, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.fc2', { y:  12, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8 });
    gsap.to('.fc3', { y:  -8, duration: 2.0, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.4 });
    // Blobs
    gsap.to('.blob1', { x: 30, y: -20, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.blob2', { x:-20, y:  30, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
    // Stats
    gsap.fromTo('.stat-i', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out',
      scrollTrigger: { trigger: statsRef.current, start: 'top 80%' } });
    // Features
    gsap.fromTo('.feat-c', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: featRef.current, start: 'top 75%' } });
    // Courses
    gsap.fromTo('.crs-c', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: coursesRef.current, start: 'top 75%' } });
    // CTA
    gsap.fromTo('.cta-c', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: ctaRef.current, start: 'top 80%' } });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", overflowX: 'hidden', background: '#fff' }}>

      {/* ── NAV ── */}
      <nav ref={navRef} style={{ position:'fixed', top:0, left:0, right:0, zIndex:100,
        background:'rgba(255,255,255,0.95)', backdropFilter:'blur(14px)',
        borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', height:72, display:'flex',
          alignItems:'center', justifyContent:'space-between', padding:'0 5%' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:60, height:60, borderRadius:14, flexShrink:0, background:'#fff', boxShadow:'0 4px 16px rgba(79,70,229,0.25)', border:'2px solid #c7d2fe', display:'flex', alignItems:'center', justifyContent:'center', padding:6 }}>
              <img src="/logo.png" alt="Aula Virtual" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
            </div>
            <div>
              <span style={{ fontSize:20, fontWeight:800, display:'block', lineHeight:1.1,
                background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Aula Virtual
              </span>
              <span style={{ fontSize:10, color:'#94a3b8', fontWeight:500, letterSpacing:'0.5px', textTransform:'uppercase' }}>Sistema Educativo</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:32 }}>
            {[['Inicio','hero'],['Características','features'],['Cursos','courses'],['Contacto','cta']].map(([l,id])=>(
              <span key={id} onClick={()=>scrollTo(id)}
                style={{ fontSize:14, fontWeight:500, color:'#475569', cursor:'pointer',
                  transition:'color 0.2s' }}
                onMouseEnter={e=>e.target.style.color='#4f46e5'}
                onMouseLeave={e=>e.target.style.color='#475569'}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" style={{ minHeight:'100vh', paddingTop:64, position:'relative', overflow:'hidden',
        background:'linear-gradient(135deg,#f8f7ff 0%,#fdf4ff 50%,#f0f9ff 100%)',
        display:'flex', alignItems:'center' }}>
        {/* blobs */}
        <div className="blob1" style={{ position:'absolute', top:'8%', left:'3%', width:500, height:500,
          background:'radial-gradient(circle,rgba(79,70,229,0.13) 0%,transparent 70%)',
          borderRadius:'50%', pointerEvents:'none' }} />
        <div className="blob2" style={{ position:'absolute', bottom:'5%', right:'3%', width:600, height:600,
          background:'radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%)',
          borderRadius:'50%', pointerEvents:'none' }} />

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'80px 5%',
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center', width:'100%' }}>

          {/* Left */}
          <div className="hero-left">
            <div style={{ display:'inline-flex', alignItems:'center', gap:6,
              background:'linear-gradient(135deg,#eef2ff,#f5f3ff)',
              border:'1px solid #c7d2fe', borderRadius:99, padding:'6px 14px',
              fontSize:12, fontWeight:600, color:'#4f46e5', marginBottom:20 }}>
              <Star size={12} fill="#4f46e5" /> Plataforma educativa #1
            </div>
            <h1 style={{ fontSize:'clamp(36px,5vw,62px)', fontWeight:900, lineHeight:1.1,
              color:'#0f172a', margin:'0 0 20px' }}>
              Transforma tu futuro con{' '}
              <span style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed,#ec4899)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                educación digital
              </span>
            </h1>
            <p style={{ fontSize:18, color:'#64748b', lineHeight:1.7, margin:'0 0 32px', maxWidth:480 }}>
              Aprende con los mejores profesores, accede a cursos de calidad y lleva tus habilidades al siguiente nivel.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {['Sin costo inicial','Acceso inmediato','Certificado incluido'].map(t=>(
                <div key={t} style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, color:'#475569' }}>
                  <CheckCircle size={16} color="#4f46e5" fill="#eef2ff" /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual card */}
          <div className="hero-right" style={{ position:'relative', display:'flex', justifyContent:'center' }}>
            <div style={{ width:'100%', maxWidth:460, aspectRatio:'4/3', borderRadius:28,
              background:'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#ec4899 100%)',
              boxShadow:'0 40px 80px rgba(79,70,229,0.25)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <GraduationCap color="rgba(255,255,255,0.9)" size={120} strokeWidth={1} />
            </div>

            {/* Floating cards */}
            <div className="fc1" style={{ position:'absolute', top:'6%', left:'-8%',
              background:'#fff', borderRadius:16, padding:'12px 16px',
              boxShadow:'0 8px 32px rgba(0,0,0,0.12)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, background:'#eef2ff', borderRadius:10,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <BookOpen size={18} color="#4f46e5" />
              </div>
              <div>
                <div style={{ fontSize:10, color:'#94a3b8' }}>Cursos activos</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>50+ cursos</div>
              </div>
            </div>

            <div className="fc2" style={{ position:'absolute', bottom:'10%', right:'-8%',
              background:'#fff', borderRadius:16, padding:'12px 16px',
              boxShadow:'0 8px 32px rgba(0,0,0,0.12)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, background:'#f0fdf4', borderRadius:10,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Award size={18} color="#16a34a" />
              </div>
              <div>
                <div style={{ fontSize:10, color:'#94a3b8' }}>Certificados</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>+200 emitidos</div>
              </div>
            </div>

            <div className="fc3" style={{ position:'absolute', top:'42%', right:'-10%',
              background:'#fff', borderRadius:16, padding:'12px 16px',
              boxShadow:'0 8px 32px rgba(0,0,0,0.12)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, background:'#fefce8', borderRadius:10,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Star size={18} color="#ca8a04" fill="#fef08a" />
              </div>
              <div>
                <div style={{ fontSize:10, color:'#94a3b8' }}>Valoración</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>4.9 / 5.0</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', padding:'64px 5%' }}>
        <div style={{ maxWidth:1200, margin:'0 auto',
          display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:32, textAlign:'center' }}>
          {STATS.map(s=>(
            <div key={s.label} className="stat-i">
              <p style={{ fontSize:48, fontWeight:900, color:'#fff', margin:0 }}>{s.value}</p>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', margin:'4px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" ref={featRef} style={{ padding:'100px 5%', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <span style={{ display:'inline-block', background:'#eef2ff', color:'#4f46e5',
              borderRadius:99, padding:'4px 14px', fontSize:11, fontWeight:700,
              textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>
              Características
            </span>
            <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:800, color:'#0f172a', margin:'0 0 12px' }}>
              Todo lo que necesitas para aprender
            </h2>
            <p style={{ fontSize:16, color:'#64748b', maxWidth:520, margin:'0 auto' }}>
              Una plataforma completa diseñada para maximizar tu aprendizaje
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24 }}>
            {FEATURES.map(({ Icon, title, desc })=>(
              <div key={title} className="feat-c"
                style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, padding:28, transition:'all 0.3s' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 20px 40px rgba(79,70,229,0.1)'; e.currentTarget.style.borderColor='#c7d2fe'; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='#e2e8f0'; }}>
                <div style={{ width:48, height:48, background:'#eef2ff', borderRadius:14,
                  display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                  <Icon size={24} color="#4f46e5" />
                </div>
                <h3 style={{ fontSize:17, fontWeight:700, color:'#1e293b', margin:'0 0 8px' }}>{title}</h3>
                <p style={{ fontSize:14, color:'#64748b', lineHeight:1.6, margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section id="courses" ref={coursesRef} style={{ padding:'100px 5%', background:'#f8fafc' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <span style={{ display:'inline-block', background:'#eef2ff', color:'#4f46e5',
              borderRadius:99, padding:'4px 14px', fontSize:11, fontWeight:700,
              textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>
              Cursos
            </span>
            <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:800, color:'#0f172a', margin:'0 0 12px' }}>
              Explora nuestros cursos
            </h2>
            <p style={{ fontSize:16, color:'#64748b', maxWidth:520, margin:'0 auto' }}>
              Aprende las tecnologías más demandadas del mercado laboral
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:20 }}>
            {COURSES.map(({ title, cat, color, Icon, students })=>(
              <div key={title} className="crs-c"
                style={{ background:'#fff', borderRadius:20, overflow:'hidden',
                  boxShadow:'0 2px 12px rgba(0,0,0,0.06)', transition:'all 0.3s' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)'; }}>
                <div style={{ background:`linear-gradient(135deg,${color}18,${color}30)`,
                  padding:'24px 24px 20px', borderBottom:`3px solid ${color}` }}>
                  <div style={{ width:48, height:48, background:`${color}22`, borderRadius:14,
                    display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                    <Icon size={24} color={color} />
                  </div>
                  <span style={{ display:'inline-block', background:color, color:'#fff',
                    borderRadius:99, padding:'2px 10px', fontSize:11, fontWeight:600, marginBottom:8 }}>
                    {cat}
                  </span>
                  <h3 style={{ fontSize:17, fontWeight:700, color:'#1e293b', margin:0 }}>{title}</h3>
                </div>
                <div style={{ padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#64748b' }}>
                    <Users size={14} /> {students} estudiantes
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'#4f46e5', fontWeight:600 }}>
                    Ver más <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" ref={ctaRef}
        style={{ background:'linear-gradient(135deg,#0f172a,#1e1b4b)', padding:'100px 5%', textAlign:'center' }}>
        <div className="cta-c" style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ width:72, height:72, background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
            borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 24px' }}>
            <TrendingUp color="#fff" size={36} />
          </div>
          <h2 style={{ fontSize:'clamp(28px,4vw,50px)', fontWeight:900, color:'#fff', margin:'0 0 16px' }}>
            Comienza tu aprendizaje hoy
          </h2>
          <p style={{ fontSize:18, color:'rgba(255,255,255,0.65)', margin:'0 0 40px' }}>
            Únete a miles de estudiantes que ya están transformando su futuro profesional
          </p>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10,
            background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:12, padding:'14px 24px', color:'rgba(255,255,255,0.7)', fontSize:14 }}>
            <Shield size={16} color="#818cf8" />
            Accede en <code style={{ color:'#a5b4fc', margin:'0 4px' }}>localhost:5173/login</code>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#0f172a', padding:'32px 5%', textAlign:'center',
        borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:10 }}>
          <div style={{ width:28, height:28, background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
            borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <GraduationCap color="#fff" size={16} />
          </div>
          <span style={{ fontSize:15, fontWeight:700,
            background:'linear-gradient(135deg,#818cf8,#a78bfa)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Aula Virtual
          </span>
        </div>
        <p style={{ color:'rgba(255,255,255,0.25)', fontSize:12, margin:0 }}>
          © 2026 Aula Virtual — Sistema de Gestión Educativa
        </p>
      </footer>
    </div>
  );
};
