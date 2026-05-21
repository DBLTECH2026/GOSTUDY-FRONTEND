'use client';

import { useRef, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { subirComprobantePago } from '@/modules/pagos/api';
import type { Pago, PagoMetodo } from '@/modules/pagos/types';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { Modal } from '@/shared/components/Modal';
import { notify } from '@/shared/lib/notify';
import { fmtFecha, fmtSoles } from '@/shared/lib/format';

type Props = {
  pago: Pago | null;
  onClose: () => void;
  onUploaded?: () => void;
};

const METODOS: { key: PagoMetodo; label: string; icon: 'Building2' | 'Smartphone' }[] = [
  { key: 'transferencia', label: 'Transferencia bancaria', icon: 'Building2' },
  { key: 'yape',          label: 'Yape',                    icon: 'Smartphone' },
  { key: 'plin',          label: 'Plin',                    icon: 'Smartphone' },
  { key: 'otro',          label: 'Otro',                    icon: 'Building2' },
];

export function SubirComprobanteModal({ pago, onClose, onUploaded }: Props) {
  const { token } = useAuth();
  const [metodo, setMetodo] = useState<PagoMetodo>('yape');
  const [file, setFile] = useState<File | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setMetodo('yape');
    setFile(null);
    setObservaciones('');
    setSuccess(false);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit() {
    if (!pago || !token) return;
    if (!file) return notify.warning('Selecciona el archivo del comprobante.');

    setBusy(true);
    const tid = notify.loading('Subiendo comprobante…');
    try {
      await subirComprobantePago(token, pago.id, file, metodo, observaciones || undefined);
      notify.dismiss(tid);
      notify.success({
        title: 'Comprobante enviado',
        description: 'El colegio lo verificará en las próximas 24 horas.',
      });
      setSuccess(true);
      onUploaded?.();
      setTimeout(handleClose, 2000);
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudo subir el comprobante.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={pago !== null}
      onClose={busy ? () => {} : handleClose}
      title="Subir comprobante de pago"
      subtitle={pago ? `${pago.descripcion} — ${fmtSoles(pago.monto)}` : undefined}
      width={520}
      footer={
        success ? null : (
          <>
            <Button variant="secondary" onClick={handleClose} disabled={busy}>Cancelar</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={busy || !file}>
              {busy ? 'Subiendo…' : 'Enviar comprobante'}
            </Button>
          </>
        )
      }
    >
      {pago && success && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
            <Icon name="CircleCheck" size={36} className="text-success" />
          </div>
          <p className="text-base font-bold text-text-primary text-center">
            Comprobante enviado
          </p>
          <p className="text-xs text-text-secondary text-center max-w-sm">
            El colegio verificará tu pago en las próximas 24 horas.
            Te llegará una notificación cuando esté confirmado.
          </p>
        </div>
      )}

      {pago && !success && (
        <div className="flex flex-col gap-4">
          {/* Info del pago */}
          <div className="flex items-center justify-between p-3 bg-trilce-primary-soft rounded-sm">
            <div>
              <div className="text-sm font-semibold">{pago.descripcion}</div>
              <div className="text-[11px] text-text-secondary">
                Vence: {fmtFecha(pago.fecha_vencimiento)}
              </div>
            </div>
            <div className="text-base font-bold text-trilce-primary">{fmtSoles(pago.monto)}</div>
          </div>

          {/* Método de pago */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary">
              ¿Cómo pagaste?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {METODOS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMetodo(m.key)}
                  className={`flex items-center gap-2 p-3 rounded-sm border-2 transition-colors ${
                    metodo === m.key
                      ? 'bg-trilce-primary-soft border-trilce-primary'
                      : 'bg-bg-card border-border'
                  }`}
                >
                  <Icon
                    name={m.icon}
                    size={18}
                    className={metodo === m.key ? 'text-trilce-primary' : 'text-text-secondary'}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      metodo === m.key ? 'text-trilce-primary-dark' : 'text-text-secondary'
                    }`}
                  >
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload archivo */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary">
              Archivo del comprobante *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-sm transition-colors ${
                file
                  ? 'bg-success/5 border-success text-success'
                  : 'bg-bg-muted border-border text-text-muted hover:border-trilce-primary'
              }`}
            >
              <Icon name={file ? 'CircleCheck' : 'Upload'} size={24} />
              {file ? (
                <>
                  <span className="text-sm font-semibold text-success">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {(file.size / 1024).toFixed(0)} KB · Haz clic para cambiar
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold">
                    Haz clic para seleccionar el archivo
                  </span>
                  <span className="text-[11px] text-text-muted">
                    PDF, JPG o PNG · Máx 5MB
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Observaciones */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Ej. Pagué desde Yape de mi mamá"
              className="px-3 py-2 border border-border rounded-sm text-sm resize-none focus:outline-none focus:border-trilce-primary"
            />
          </div>

        </div>
      )}
    </Modal>
  );
}
