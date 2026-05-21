'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useMiPerfil } from '@/modules/portal/api';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { Modal } from '@/shared/components/Modal';
import { notify } from '@/shared/lib/notify';

export default function MiPerfilPage() {
  const { user } = useAuth();
  const { data: perfil, isLoading } = useMiPerfil();
  const [openPIN, setOpenPIN] = useState(false);

  if (!user || isLoading) return <p className="text-text-secondary">Cargando perfil…</p>;

  // El backend devuelve estudiante completo; si llega null usamos el del auth como fallback
  const estudiante = perfil?.estudiante ?? user;
  const apoderados = perfil?.apoderados ?? [];

  const initials = `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      {/* Hero perfil */}
      <div className="bg-trilce-primary text-text-on-primary rounded-lg p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-trilce-primary-dark flex items-center justify-center text-3xl sm:text-4xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            {user.nombres} {user.apellidos}
          </h1>
          {user.codigo_estudiante && (
            <p className="text-xs sm:text-sm text-trilce-primary-light mt-1">
              Código {user.codigo_estudiante}
            </p>
          )}
        </div>
      </div>

      {/* Datos personales */}
      <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6 flex flex-col gap-4">
        <header className="flex items-center gap-2.5">
          <Icon name="User" className="text-trilce-primary" />
          <h2 className="text-base font-bold text-text-primary">Datos personales</h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Field label="DNI" value={estudiante.dni ?? '—'} />
          <Field label="Fecha de nacimiento" value={estudiante.fecha_nacimiento ?? '—'} />
          <Field
            label="Sexo"
            value={estudiante.sexo === 'M' ? 'Masculino' : estudiante.sexo === 'F' ? 'Femenino' : '—'}
          />
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
          <h2 className="text-base font-bold text-text-primary">
            Apoderados ({apoderados.length})
          </h2>
        </header>
        {apoderados.length === 0 ? (
          <p className="text-sm text-text-secondary py-4 text-center">
            Sin apoderados registrados. Los datos del apoderado se asocian durante el
            proceso de inscripción aprobado por administración.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {apoderados.map((a) => (
              <article
                key={a.id}
                className={`rounded-sm p-4 flex flex-col gap-1.5 ${
                  a.es_titular
                    ? 'bg-trilce-primary-soft border-2 border-trilce-primary'
                    : 'bg-bg-muted'
                }`}
              >
                <span className="text-[10px] font-bold tracking-widest text-trilce-primary">
                  {a.tipo.toUpperCase()}
                  {a.es_titular && ' · TITULAR'}
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {a.nombres} {a.apellidos ?? ''}
                </span>
                <span className="text-xs text-text-secondary">DNI {a.dni ?? '—'}</span>
                <span className="text-xs text-text-secondary">{a.telefono ?? '—'}</span>
                {a.email && (
                  <span className="text-xs text-text-secondary truncate">{a.email}</span>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Cambiar PIN */}
      <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Cambiar PIN de acceso</h3>
          <p className="text-xs text-text-secondary mt-1">
            Modifica tu PIN de 6 dígitos para entrar al portal.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setOpenPIN(true)}
          className="self-start sm:self-auto"
        >
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

  function reset() {
    setPinActual(''); setPinNuevo(''); setPinConfirma('');
  }

  function handleClose() { reset(); onClose(); }

  function handleSubmit() {
    if (pinActual.length !== 6) return notify.warning('Ingresa tu PIN actual (6 dígitos).');
    if (!/^\d{6}$/.test(pinNuevo)) return notify.warning('El PIN nuevo debe ser exactamente 6 dígitos.');
    if (pinNuevo !== pinConfirma) return notify.warning('La confirmación no coincide.');
    notify.info({
      title: 'Función en desarrollo',
      description: 'El endpoint de cambio de PIN aún no está implementado en el backend.',
    });
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Cambiar PIN de acceso"
      subtitle="6 dígitos numéricos"
      width={440}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Guardar PIN</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <PinField label="PIN actual" value={pinActual} onChange={setPinActual} />
        <PinField label="PIN nuevo" value={pinNuevo} onChange={setPinNuevo} />
        <PinField label="Confirmar PIN nuevo" value={pinConfirma} onChange={setPinConfirma} />
      </div>
    </Modal>
  );
}

function PinField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
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
