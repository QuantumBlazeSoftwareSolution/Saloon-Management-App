'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isOwner?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Yes, Confirm',
  cancelText = 'Cancel',
  isOwner = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl pb-6">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 mb-4">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${isOwner ? 'bg-yellow-500/10 text-yellow-500' : 'bg-amber-500/10 text-amber-500'}`}>
            <AlertCircle className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-white">{title}</h3>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 text-xs font-bold hover:bg-zinc-800 hover:text-white transition-all active:scale-[0.98]"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold text-black transition-all active:scale-[0.98] ${
              isOwner
                ? 'bg-yellow-500 hover:bg-yellow-400'
                : 'bg-amber-500 hover:bg-amber-400'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
