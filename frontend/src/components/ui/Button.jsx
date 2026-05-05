import React from 'react';
import { cn } from '../../lib/utils';
import { ClipLoader } from 'react-spinners';

export const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  loading,
  children,
  disabled,
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:bg-indigo-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
    ghost: 'text-slate-700 hover:bg-slate-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm',
    link: 'text-indigo-600 underline-offset-4 hover:underline p-0 h-auto',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-11 px-6 text-base',
    icon: 'h-9 w-9',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ClipLoader size={14} color="currentColor" className="mr-2 opacity-80" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
