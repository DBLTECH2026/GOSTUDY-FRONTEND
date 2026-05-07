'use client';

import { ReactNode, useEffect } from 'react';
import { Icon } from './Icon';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Ancho máximo del modal en px. Default 480 */
  width?: number;
};

export function Modal({ open, onClose, title, subtitle, children, footer, width = 480 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-bg-card rounded-md max-h-[90vh] w-full overflow-y-auto border border-border shadow-2xl"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-text-muted hover:text-text-secondary">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6">{children}</div>

        {footer && <div className="flex justify-end gap-3 p-4 border-t border-border">{footer}</div>}
      </div>
    </div>
  );
}
