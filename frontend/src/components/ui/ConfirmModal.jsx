import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export function ConfirmModal({ open, onConfirm, onCancel, title = '¿Estás seguro?', message = 'Esta acción no se puede deshacer.' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancelar</Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm}>Eliminar</Button>
        </div>
      </div>
    </div>
  );
}
