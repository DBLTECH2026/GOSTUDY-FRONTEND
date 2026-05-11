'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { crearDocente } from '@/modules/personas/api';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { ApiError } from '@/shared/lib/api';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function NuevoDocenteModal({ open, onClose, onCreated }: Props) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    dni: '',
    telefono: '',
    especialidad: '',
    grado_academico: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  function reset() {
    setForm({
      nombres: '', apellidos: '', email: '', password: '', dni: '',
      telefono: '', especialidad: '', grado_academico: '',
    });
    setError(null);
    setFieldErrors({});
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit() {
    if (!token) return;
    setError(null);
    setFieldErrors({});

    if (!form.nombres || !form.apellidos) return setError('Completa nombres y apellidos.');
    if (!form.email.includes('@')) return setError('Email inválido.');
    if (form.password.length < 6) return setError('Password mínimo 6 caracteres.');

    setBusy(true);
    try {
      await crearDocente(token, {
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email,
        password: form.password,
        dni: form.dni || undefined,
        telefono: form.telefono || undefined,
        especialidad: form.especialidad || undefined,
        grado_academico: form.grado_academico || undefined,
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
      title="Nuevo docente"
      subtitle="El docente podrá entrar al panel admin con email + password"
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Creando…' : 'Crear docente'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <Field label="Email institucional *" err={fieldErrors.email?.[0]} className="sm:col-span-2">
          <input
            type="email"
            value={form.email}
            placeholder="docente@trilce.edu.pe"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="Password temporal *" err={fieldErrors.password?.[0]}>
          <input
            type="text"
            value={form.password}
            placeholder="Mín 6 caracteres"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm font-mono focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="DNI" err={fieldErrors.dni?.[0]}>
          <input
            type="text"
            maxLength={8}
            value={form.dni}
            onChange={(e) => setForm({ ...form, dni: e.target.value.replace(/\D/g, '') })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="Teléfono">
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="Especialidad">
          <input
            type="text"
            value={form.especialidad}
            placeholder="Matemáticas, Comunicación…"
            onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="Grado académico" className="sm:col-span-2">
          <input
            type="text"
            value={form.grado_academico}
            placeholder="Bachiller, Licenciado, Magíster…"
            onChange={(e) => setForm({ ...form, grado_academico: e.target.value })}
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
