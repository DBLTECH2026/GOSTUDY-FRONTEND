'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { consultarDni, crearEstudiante } from '@/modules/personas/api';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { ApiError } from '@/shared/lib/api';
import { notify } from '@/shared/lib/notify';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  async function handleLookupDni() {
    if (!token) return;
    if (!/^\d{8}$/.test(form.dni)) return notify.warning('Ingresa un DNI de 8 dígitos para buscar.');

    setLookingUp(true);
    const tid = notify.loading('Consultando RENIEC…');
    try {
      const { data } = await consultarDni(token, form.dni);
      setForm((f) => ({ ...f, nombres: data.nombres, apellidos: data.apellidos }));
      setFieldErrors((e) => ({ ...e, nombres: [], apellidos: [] }));
      notify.dismiss(tid);
      notify.success({ title: 'DNI encontrado', description: data.nombre_completo });
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se encontró el DNI.');
    } finally {
      setLookingUp(false);
    }
  }

  function reset() {
    setForm({
      dni: '', pin: '', nombres: '', apellidos: '', fecha_nacimiento: '',
      sexo: 'M', direccion: '', distrito: '', ie_procedencia: '',
    });
    setFieldErrors({});
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!token) return;
    setFieldErrors({});

    if (!/^\d{8}$/.test(form.dni)) return notify.warning('DNI debe tener 8 dígitos.');
    if (!/^\d{6}$/.test(form.pin)) return notify.warning('PIN debe ser de 6 dígitos.');
    if (!form.nombres || !form.apellidos) return notify.warning('Completa nombres y apellidos.');
    if (!form.fecha_nacimiento) return notify.warning('Selecciona la fecha de nacimiento.');
    if (!form.direccion) return notify.warning('Indica la dirección.');

    setBusy(true);
    const tid = notify.loading('Creando estudiante…');
    try {
      const res = await crearEstudiante(token, {
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
      notify.dismiss(tid);
      notify.success({
        title: 'Estudiante creado',
        description: `${res.data.nombre_completo} · ${res.data.codigo_estudiante}`,
      });
      onCreated?.();
      handleClose();
    } catch (err) {
      notify.dismiss(tid);
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      notify.apiError(err, 'No se pudo crear el estudiante.');
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
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value.replace(/\D/g, '') })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleLookupDni();
                }
              }}
              placeholder="8 dígitos"
              className="flex-1 px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
            />
            <button
              type="button"
              onClick={handleLookupDni}
              disabled={lookingUp || form.dni.length !== 8}
              title="Buscar datos en RENIEC"
              className="shrink-0 px-3 py-2 rounded-sm text-sm font-semibold border border-trilce-primary text-trilce-primary hover:bg-trilce-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {lookingUp ? '…' : 'Buscar'}
            </button>
          </div>
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
