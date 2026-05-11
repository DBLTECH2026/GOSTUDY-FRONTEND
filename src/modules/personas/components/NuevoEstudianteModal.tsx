'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { crearEstudiante } from '@/modules/personas/api';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { ApiError } from '@/shared/lib/api';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function NuevoEstudianteModal({ open, onClose, onCreated }: Props) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    dni: '',
    pin: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    sexo: 'M' as 'M' | 'F',
    direccion: '',
    distrito: '',
    ie_procedencia: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  function reset() {
    setForm({
      dni: '', pin: '', nombres: '', apellidos: '', fecha_nacimiento: '',
      sexo: 'M', direccion: '', distrito: '', ie_procedencia: '',
    });
    setError(null);
    setFieldErrors({});
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!token) return;
    setError(null);
    setFieldErrors({});

    if (!/^\d{8}$/.test(form.dni)) return setError('DNI debe tener 8 dígitos.');
    if (!/^\d{6}$/.test(form.pin)) return setError('PIN debe ser de 6 dígitos.');
    if (!form.nombres || !form.apellidos) return setError('Completa nombres y apellidos.');
    if (!form.fecha_nacimiento) return setError('Selecciona la fecha de nacimiento.');
    if (!form.direccion) return setError('Indica la dirección.');

    setBusy(true);
    try {
      await crearEstudiante(token, {
        dni: form.dni,
        pin: form.pin,
        nombres: form.nombres,
        apellidos: form.apellidos,
        fecha_nacimiento: form.fecha_nacimiento,
        sexo: form.sexo,
        direccion: form.direccion,
        distrito: form.distrito || undefined,
        ie_procedencia: form.ie_procedencia || undefined,
      });
      onCreated?.();
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) setFieldErrors(err.errors);
      } else {
        setError('Error de red.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nuevo estudiante"
      subtitle="El estudiante podrá entrar al portal con DNI + PIN"
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Creando…' : 'Crear estudiante'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="DNI *" err={fieldErrors.dni?.[0]}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={form.dni}
            onChange={(e) => setForm({ ...form, dni: e.target.value.replace(/\D/g, '') })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="PIN 6 dígitos *" err={fieldErrors.pin?.[0]}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={form.pin}
            onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm font-mono tracking-widest focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="Nombres *" err={fieldErrors.nombres?.[0]}>
          <input
            type="text"
            value={form.nombres}
            onChange={(e) => setForm({ ...form, nombres: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="Apellidos *" err={fieldErrors.apellidos?.[0]}>
          <input
            type="text"
            value={form.apellidos}
            onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="Fecha de nacimiento *" err={fieldErrors.fecha_nacimiento?.[0]}>
          <input
            type="date"
            value={form.fecha_nacimiento}
            onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="Sexo *">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, sexo: 'M' })}
              className={`flex-1 py-2 rounded-sm text-sm font-semibold border ${
                form.sexo === 'M'
                  ? 'bg-trilce-primary text-white border-trilce-primary'
                  : 'bg-bg-card border-border text-text-secondary'
              }`}
            >
              Masculino
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, sexo: 'F' })}
              className={`flex-1 py-2 rounded-sm text-sm font-semibold border ${
                form.sexo === 'F'
                  ? 'bg-trilce-primary text-white border-trilce-primary'
                  : 'bg-bg-card border-border text-text-secondary'
              }`}
            >
              Femenino
            </button>
          </div>
        </Field>
        <Field label="Dirección *" err={fieldErrors.direccion?.[0]}>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="Distrito">
          <input
            type="text"
            value={form.distrito}
            onChange={(e) => setForm({ ...form, distrito: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="IE de procedencia" className="sm:col-span-2">
          <input
            type="text"
            value={form.ie_procedencia}
            onChange={(e) => setForm({ ...form, ie_procedencia: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm p-3">
          {error}
        </div>
      )}
    </Modal>
  );
}

function Field({
  label, err, children, className,
}: {
  label: string;
  err?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
      {children}
      {err && <span className="text-[11px] text-red-600">{err}</span>}
    </label>
  );
}
