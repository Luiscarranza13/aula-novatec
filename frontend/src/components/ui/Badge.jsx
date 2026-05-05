import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-emerald-100 text-emerald-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  indigo: 'bg-indigo-100 text-indigo-800',
};

export const Badge = ({ children, variant = 'default', className, dot }) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
    variants[variant],
    className
  )}>
    {dot && (
      <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-slate-500': variant === 'default',
        'bg-blue-500': variant === 'blue',
        'bg-emerald-500': variant === 'green',
        'bg-purple-500': variant === 'purple',
        'bg-orange-500': variant === 'orange',
        'bg-red-500': variant === 'red',
        'bg-yellow-500': variant === 'yellow',
        'bg-indigo-500': variant === 'indigo',
      })} />
    )}
    {children}
  </span>
);
