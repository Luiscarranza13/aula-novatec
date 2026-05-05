import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className, type, label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        className={cn(
          'form-input',
          error && 'border-red-400 focus:ring-red-400 focus:border-red-400',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export const Select = React.forwardRef(({ className, label, error, children, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="form-label">{label}</label>}
      <select
        className={cn(
          'form-select',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';

export const Textarea = React.forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="form-label">{label}</label>}
      <textarea
        className={cn(
          'form-input resize-none',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';
