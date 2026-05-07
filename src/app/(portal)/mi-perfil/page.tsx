'use client';

import { useState } from 'react';
import { useMiPerfil } from '@/modules/portal/api';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { Modal } from '@/shared/components/Modal';

export default function MiPerfilPage() {
  const { data, isLoading } = useMiPerfil();
  const [openPIN, setOpenPIN] = useState(false);

  if (isLoading || !data) return <p className="text-text-secondary">Cargando perfil…</p>;
  const { estudiante, apoderados } = data;

  const titularInitials =
    `${estudiante.nombres.split(' ')[0][0]}${estudiante.apellidos.split(' ')[0][0]}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Hero perfil */}
      <div className="bg-trilce-primary text-text-on-primary rounded-lg p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-trilce-primary-dark flex items-center justify-center text-3xl sm:text-4xl font-bold flex-shrink-0">
          {titularInitials}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">{estudiante.nombres} {estudiante.apellidos}</h1>
          <p className="text-xs sm:text-sm text-trilce-primary-light mt-1">
            Código {estudiante.codigo_estudiante}
          </p>
        </div>
      </div>

      {/* Datos personales */}
      <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6 flex flex-col gap-4">
        <header className="flex items-center gap-2.5">
          <Icon name="User" className="text-trilce-primary" />
          <h2 className="text-base font-bold text-text-primary">Datos personales</h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Field label="DNI" value={estudiante.dni} />
          <Field label="Fecha de nacimiento" value={estudiante.fecha_nacimiento} />
          <Field label="Sexo" value={estudiante.sexo === 'M' ? 'Masculino' : 'Femenino'} />
          <Field label="I.E. de procedencia" value={estudiante.ie_procedencia ?? '—'} />
          <Field label="Dirección" value={estudiante.direccion ?? '—'} />
          <Field label="Departamento" value={estudiante.departamento ?? '—'} />
          <Field label="Provincia" value={estudiante.provincia ?? '—'} />
          <Field label="Distrito" value={estudiante.distrito ?? '—'} />
        </div>
      </div>

      {/* Apoderados */}
      <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6 flex flex-col gap-3">
        <header className="flex items-center gap-2.5">
          <Icon name="Users" className="text-trilce-primary" />
          <h2 className="text-base font-bold text-text-primary">Apoderados</h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {apoderados.map((a) => (
            <article key={a.id} className="bg-bg-muted rounded-sm p-4 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold tracking-widest text-trilce-primary">
                {a.tipo.toUpperCase()}
              </span>
              <span className="text-sm font-semibold text-text-primary">
                {a.nombres} {a.apellidos ? a.apellidos : a.parentesco ? `(${a.parentesco})` : ''}
              </span>
              <span className="text-xs text-text-secondary">DNI {a.dni}</span>
              <span className="text-xs text-text-secondary">{a.telefono ?? '—'}</span>
            </article>
          ))}
        </div>
      </div>

      {/* Cambiar PIN */}
      <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Cambiar PIN de acceso</h3>
          <p className="text-xs text-text-secondary mt-1">
            Modifica tu PIN de 6 dígitos para entrar al portal.
          </p>
        </div>
        <Button variant="primary" onClick={() => setOpenPIN(true)} className="self-start sm:self-auto">
          <Icon name="KeyRound" size={16} /> Cambiar PIN
        </Button>
      </div>

      <CambiarPinModal open={openPIN} onClose={() => setOpenPIN(false)} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold tracking-wide text-text-muted">
        {label.toUpperCase()}
      </span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function CambiarPinModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [pinActual, setPinActual] = useState('');
  const [pinNuevo, setPinNuevo] = useState('');
  const [pinConfirma, setPinConfirma] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  function reset() {
    setPinActual(''); setPinNuevo(''); setPinConfirma('');
    setError(null); setSuccess(false);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit() {
    setError(null);
    if (!/^\d{6}$/.test(pinNuevo)) return setError('El PIN nuevo debe ser exactamente 6 dígitos.');
    if (pinNuevo !== pinConfirma)   return setError('La confirmación no coincide.');
    if (pinActual.length !== 6)     return setError('Ingresa tu PIN actual (6 dígitos).');

    setBusy(true);
    // TODO: cuando A tenga auth, llamar a POST /api/v1/portal/cambiar-pin
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    setSuccess(true);
    setTimeout(handleClose, 1500);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Cambiar PIN de acceso"
      subtitle="6 dígitos numéricos"
      width={440}
      footer={
        success ? (
          <Button variant="primary" onClick={handleClose}>Listo</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar PIN'}
            </Button>
          </>
        )
      }
    >
      {success ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center">
            <Icon name="CircleCheck" size={28} className="text-success" />
          </div>
          <p className="text-sm font-semibold text-text-primary">PIN actualizado</p>
          <p className="text-xs text-text-secondary">Usa el nuevo PIN la próxima vez que ingreses.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <PinField label="PIN actual" value={pinActual} onChange={setPinActual} />
          <PinField label="PIN nuevo" value={pinNuevo} onChange={setPinNuevo} />
          <PinField label="Confirmar PIN nuevo" value={pinConfirma} onChange={setPinConfirma} />
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-danger/10 rounded-sm">
              <Icon name="TriangleAlert" size={14} className="text-danger" />
              <span className="text-xs text-danger font-semibold">{error}</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function PinField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
      <input
        type="password"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        placeholder="••••••"
        className="px-4 py-3 bg-bg-card rounded-sm border border-border text-base tracking-[0.5em] font-semibold text-text-primary text-center focus:outline-none focus:border-trilce-primary"
      />
    </label>
  );
}
