import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { GraduationCap, Eye, EyeOff, Mail, Lock, User, Shield } from 'lucide-react';
import { gsap } from 'gsap';
import { authService } from '../services/api';
import { Button } from '../components/ui/Button';

export const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({ defaultValues: { rol: 'estudiante' } });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo('.register-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.register(data);
      Swal.fire({ icon:'success', title:'¡Cuenta creada! Inicia sesión.', toast:true, position:'top-end', showConfirmButton:false, timer:3000, timerProgressBar:true });
      navigate('/admin');
    } catch (error) {
      Swal.fire({ icon:"error", title:"Error", text:error.response?.data?.message || 'Error al registrarse', toast:true, position:"top-end", showConfirmButton:false, timer:4000 });
    } finally {
      setLoading(false);
    }
  };

  const rolValue = watch('rol');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md register-card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 shadow-lg" style={{ background:'#fff', border:'2px solid #e0e7ff', display:'flex', alignItems:'center', justifyContent:'center', padding:'4px' }}>
            <img src="/logo.png" alt="Aula Virtual" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Crear Cuenta</h1>
          <p className="text-slate-500 text-sm mt-1">Únete al sistema educativo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">Nombre completo</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  placeholder="Juan Pérez"
                  className="form-input pl-9"
                />
              </div>
              {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className="form-label">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('email', { required: 'El email es requerido', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
                  type="email"
                  placeholder="tu@email.com"
                  className="form-input pl-9"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('password', { required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="form-input pl-9 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="form-label">Rol</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'estudiante', label: 'Estudiante', icon: '🎓' },
                  { value: 'profesor', label: 'Profesor', icon: '👨‍🏫' },
                ].map(({ value, label, icon }) => (
                  <label key={value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    rolValue === value 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input type="radio" {...register('rol')} value={value} className="sr-only" />
                    <span className="text-xl">{icon}</span>
                    <span className="font-medium text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Crear Cuenta
            </Button>
          </form>

          <p className="text-center mt-5 text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/admin" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
