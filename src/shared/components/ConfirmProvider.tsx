'use client';

/**
 * Reemplazo moderno de window.confirm() y window.prompt().
 * Uso imperativo desde cualquier componente:
 *
 *   const confirm = useConfirm();
 *   const ok = await confirm({
 *     title: '¿Eliminar docente?',
 *     description: 'El docente no podrá iniciar sesión.',
 *     confirmText: 'Eliminar',
 *     variant: 'danger',
 *   });
 *   if (!ok) return;
 *
 * Con input (reemplaza window.prompt):
 *
 *   const motivo = await confirm({
 *     title: '¿Rechazar inscripción?',
 *     description: 'Indica el motivo del rechazo (opcional).',
 *     input: { label: 'Motivo', placeholder: 'Datos incompletos…' },
 *     confirmText: 'Rechazar',
 *     variant: 'danger',
 *   });
 *   if (motivo === null) return; // canceló
 *   // motivo es string (puede ser '')
 */

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { Button } from './Button';
import { Icon, IconName } from './Icon';

type Variant = 'default' | 'danger' | 'warning';

type InputOpts = {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
};

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
  icon?: IconName;
  /** Si se pasa, el diálogo muestra un input y la promesa resuelve a `string | null`. */
  input?: InputOpts;
};

type Resolver = (value: boolean | string | null) => void;

type DialogState = ConfirmOptions & { resolver: Resolver };

const ConfirmContext = createContext<((opts: ConfirmOptions) => Promise<boolean | string | null>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [inputValue, setInputValue] = useState('');

  const confirm = useCallback((opts: ConfirmOptions) => {
    setInputValue(opts.input?.defaultValue ?? '');
    return new Promise<boolean | string | null>((resolve) => {
      setDialog({ ...opts, resolver: resolve });
    });
  }, []);

  function close(result: boolean | string | null) {
    dialog?.resolver(result);
    setDialog(null);
    setInputValue('');
  }

  function handleCancel() {
    close(dialog?.input ? null : false);
  }

  function handleConfirm() {
    if (!dialog) return;
    if (dialog.input) {
      if (dialog.input.required && !inputValue.trim()) return;
      close(inputValue);
    } else {
      close(true);
    }
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <ConfirmDialog
          {...dialog}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider />');
  return ctx;
}

/* ─────────────────────── UI del diálogo ─────────────────────── */

type DialogProps = ConfirmOptions & {
  inputValue: string;
  onInputChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmDialog({
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  icon,
  input,
  inputValue,
  onInputChange,
  onCancel,
  onConfirm,
}: DialogProps) {
  const iconName: IconName =
    icon ?? (variant === 'danger' ? 'TriangleAlert' : variant === 'warning' ? 'TriangleAlert' : 'CircleCheck');

  const iconColor =
    variant === 'danger'
      ? 'text-red-600 bg-red-50'
      : variant === 'warning'
      ? 'text-amber-600 bg-amber-50'
      : 'text-trilce-primary bg-trilce-primary-soft';

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-bg-card rounded-lg shadow-2xl border border-border w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center ${iconColor}`}>
              <Icon name={iconName} size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-text-primary">{title}</h2>
              {description && (
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">{description}</p>
              )}
            </div>
          </div>

          {input && (
            <div className="mt-4 flex flex-col gap-1.5">
              {input.label && (
                <span className="text-xs font-semibold text-text-secondary">{input.label}</span>
              )}
              {input.multiline ? (
                <textarea
                  autoFocus
                  value={inputValue}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder={input.placeholder}
                  rows={3}
                  className="px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary resize-none"
                />
              ) : (
                <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onConfirm();
                    if (e.key === 'Escape') onCancel();
                  }}
                  placeholder={input.placeholder}
                  className="px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end p-4 bg-bg-muted border-t border-border">
          <Button variant="secondary" onClick={onCancel}>{cancelText}</Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
