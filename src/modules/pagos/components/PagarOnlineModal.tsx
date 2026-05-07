'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Icon, IconName } from '@/shared/components/Icon';
import { Modal } from '@/shared/components/Modal';
import { fmtSoles } from '@/shared/lib/format';
import type { Pago, PagoMetodo } from '@/modules/pagos/types';
import { FakeQR } from './FakeQR';

type Step = 'method' | 'qr' | 'card' | 'transfer' | 'processing' | 'success' | 'error';

type Props = {
  pago: Pago | null;
  onClose: () => void;
  onPagoCompleto: (pagoId: number, metodo: PagoMetodo) => void;
};

const METODOS: { key: PagoMetodo; label: string; icon: IconName; subtitle: string }[] = [
  { key: 'yape',          label: 'Yape',          icon: 'Smartphone', subtitle: 'Escanea el QR' },
  { key: 'plin',          label: 'Plin',          icon: 'Smartphone', subtitle: 'Escanea el QR' },
  { key: 'transferencia', label: 'Transferencia', icon: 'Building2',  subtitle: 'BCP / Interbank' },
  { key: 'otro',          label: 'Tarjeta',       icon: 'CreditCard', subtitle: 'Visa, Mastercard' },
];

export function PagarOnlineModal({ pago, onClose, onPagoCompleto }: Props) {
  const [step, setStep] = useState<Step>('method');
  const [metodo, setMetodo] = useState<PagoMetodo | null>(null);

  useEffect(() => {
    if (pago) {
      setStep('method');
      setMetodo(null);
    }
  }, [pago]);

  // Auto-cierre tras éxito
  useEffect(() => {
    if (step !== 'success') return;
    const t = setTimeout(() => {
      onClose();
    }, 2200);
    return () => clearTimeout(t);
  }, [step, onClose]);

  if (!pago) return null;

  const handleSelectMethod = (m: PagoMetodo) => {
    setMetodo(m);
    if (m === 'yape' || m === 'plin') setStep('qr');
    else if (m === 'transferencia')   setStep('transfer');
    else                              setStep('card');
  };

  const confirmar = async () => {
    if (!metodo) return;
    setStep('processing');
    // Simulación de procesamiento
    await new Promise((r) => setTimeout(r, 1400));
    onPagoCompleto(pago.id, metodo);
    setStep('success');
  };

  const titleByStep: Record<Step, string> = {
    method:     'Pagar ahora',
    qr:         metodo === 'yape' ? 'Pagar con Yape' : 'Pagar con Plin',
    card:       'Pagar con tarjeta',
    transfer:   'Pagar por transferencia',
    processing: 'Procesando pago…',
    success:    '¡Pago confirmado!',
    error:      'No se pudo procesar',
  };

  return (
    <Modal
      open={pago !== null}
      onClose={step === 'processing' ? () => {} : onClose}
      title={titleByStep[step]}
      subtitle={`${pago.descripcion} — ${fmtSoles(pago.monto)}`}
      width={480}
      footer={renderFooter(step, metodo, () => setStep('method'), confirmar, onClose)}
    >
      <DemoBanner />

      {step === 'method'     && <MethodStep onPick={handleSelectMethod} />}
      {step === 'qr'         && metodo && <QrStep metodo={metodo} pago={pago} />}
      {step === 'card'       && <CardStep />}
      {step === 'transfer'   && <TransferStep pago={pago} />}
      {step === 'processing' && <ProcessingStep />}
      {step === 'success'    && metodo && <SuccessStep metodo={metodo} pago={pago} />}
    </Modal>
  );
}

function renderFooter(
  step: Step,
  metodo: PagoMetodo | null,
  back: () => void,
  confirm: () => void,
  close: () => void,
) {
  if (step === 'method') {
    return <Button variant="secondary" onClick={close}>Cancelar</Button>;
  }
  if (step === 'qr' || step === 'card' || step === 'transfer') {
    return (
      <>
        <Button variant="secondary" onClick={back}>Cambiar método</Button>
        <Button variant="primary" onClick={confirm}>
          {step === 'transfer' ? 'Ya transferí' : 'Ya pagué'}
        </Button>
      </>
    );
  }
  if (step === 'success') {
    return <Button variant="primary" onClick={close}>Cerrar</Button>;
  }
  return null;
}

/* ─────────── Steps ─────────── */

function DemoBanner() {
  return (
    <div className="mb-4 px-3 py-2 bg-warning/10 border border-warning/30 rounded-sm flex items-center gap-2">
      <Icon name="TriangleAlert" size={14} className="text-warning" />
      <span className="text-[11px] font-semibold text-warning">
        DEMO — flujo simulado, no se procesan pagos reales todavía
      </span>
    </div>
  );
}

function MethodStep({ onPick }: { onPick: (m: PagoMetodo) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-text-secondary mb-1">Elige cómo quieres pagar:</p>
      {METODOS.map((m) => (
        <button
          key={m.key}
          onClick={() => onPick(m.key)}
          className="flex items-center gap-4 p-4 rounded-sm border border-border bg-bg-card hover:border-trilce-primary hover:bg-trilce-primary-soft transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-sm bg-trilce-primary-soft flex items-center justify-center">
            <Icon name={m.icon} size={20} className="text-trilce-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-text-primary">{m.label}</div>
            <div className="text-xs text-text-secondary">{m.subtitle}</div>
          </div>
          <Icon name="ArrowRight" size={16} className="text-text-muted" />
        </button>
      ))}
    </div>
  );
}

function QrStep({ metodo, pago }: { metodo: PagoMetodo; pago: Pago }) {
  const numero = metodo === 'yape' ? '999 444 777' : '977 222 111';
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <FakeQR seed={pago.id * 7 + (metodo === 'yape' ? 1 : 2)} size={210} />
      <div className="text-center flex flex-col gap-1">
        <span className="text-sm text-text-secondary">o paga al número</span>
        <span className="text-2xl font-bold text-text-primary tracking-wider">{numero}</span>
        <span className="text-[11px] text-text-muted">Trilce SA — Concepto: {pago.descripcion}</span>
      </div>
      <div className="w-full mt-2 px-4 py-3 bg-bg-muted rounded-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Monto exacto</span>
          <span className="font-bold text-text-primary text-base">{fmtSoles(pago.monto)}</span>
        </div>
      </div>
    </div>
  );
}

function CardStep() {
  return (
    <div className="flex flex-col gap-4">
      <CardField label="Número de tarjeta" placeholder="4111 1111 1111 1111" maxLength={19} />
      <CardField label="Nombre del titular" placeholder="JUAN PÉREZ" />
      <div className="grid grid-cols-2 gap-3">
        <CardField label="Vencimiento" placeholder="MM/AA" maxLength={5} />
        <CardField label="CVV" placeholder="123" maxLength={4} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 bg-info/10 rounded-sm">
        <Icon name="TriangleAlert" size={14} className="text-info" />
        <span className="text-[11px] text-text-secondary">
          DEMO: ningún número de tarjeta es validado ni guardado.
        </span>
      </div>
    </div>
  );
}

function CardField({ label, placeholder, maxLength }: { label: string; placeholder: string; maxLength?: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        maxLength={maxLength}
        className="px-4 py-3 bg-bg-card rounded-sm border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-trilce-primary"
      />
    </label>
  );
}

function TransferStep({ pago }: { pago: Pago }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-secondary">Transfiere desde tu app del banco:</p>
      <div className="bg-bg-muted rounded-sm p-4 flex flex-col gap-2 text-sm">
        <Row label="Banco" value="BCP" />
        <Row label="Cta. Cte. Soles" value="191-2345678-0-21" mono />
        <Row label="CCI" value="002-191-002345678021-23" mono />
        <Row label="Titular" value="Trilce SA" />
        <Row label="Concepto" value={pago.descripcion} />
        <Row label="Monto exacto" value={fmtSoles(pago.monto)} bold />
      </div>
      <p className="text-[11px] text-text-muted">
        Cuando hayas transferido, presiona <b>Ya transferí</b>. Adjuntar el voucher
        es opcional pero ayuda a confirmar más rápido.
      </p>
    </div>
  );
}

function Row({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className={`text-text-primary ${mono ? 'font-mono' : ''} ${bold ? 'font-bold' : 'font-semibold'}`}>
        {value}
      </span>
    </div>
  );
}

function ProcessingStep() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="w-12 h-12 rounded-full border-4 border-trilce-primary-soft border-t-trilce-primary animate-spin" />
      <p className="text-sm text-text-secondary">Procesando tu pago…</p>
      <p className="text-[11px] text-text-muted">No cierres esta ventana.</p>
    </div>
  );
}

function SuccessStep({ metodo, pago }: { metodo: PagoMetodo; pago: Pago }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
        <Icon name="CircleCheck" size={36} className="text-success" />
      </div>
      <p className="text-base font-bold text-text-primary">Pago registrado</p>
      <p className="text-xs text-text-secondary text-center">
        {pago.descripcion} — {fmtSoles(pago.monto)}<br />
        Método: {metodo[0].toUpperCase() + metodo.slice(1)}
      </p>
      <p className="text-[11px] text-text-muted">
        Recibirás el comprobante por correo en unos minutos.
      </p>
    </div>
  );
}
