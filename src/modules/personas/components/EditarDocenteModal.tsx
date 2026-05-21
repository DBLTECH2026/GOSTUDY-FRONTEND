'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { actualizarDocente, DocenteRow } from '@/modules/personas/api';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { ApiError } from '@/shared/lib/api';
import { notify } from '@/shared/lib/notify';

type Props = {
  open: boolean;
  docente: DocenteRow | null;
  onClose: () => void;
  onUpdated?: () => void;
};

export function EditarDocenteModal({ open, docente, onClose, onUpdated }: Props) {
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
    estado: 'activo' as 'activo' | 'inactivo',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (docente) {
      setForm({
        nombres: docente.nombres ?? docente.nombre_completo.split(' ')[0] ?? '',
        apellidos: docente.apellidos ?? docente.nombre_completo.split(' ').slice(1).join(' ') ?? '',
        email: docente.email,
        password: '',
        dni: docente.dni ?? '',
        telefono: docente.telefono ?? '',
        especialidad: docente.especialidad ?? '',
        grado_academico: docente.grado_academico ?? '',
        estado: docente.estado,
      });
      setFieldErrors({});
    }
  }, [docente]);

  function handleClose() {
    setFieldErrors({});
    onClose();
  }

  async function handleSubmit() {
    if (!token || !docente) return;
    setFieldErrors({});

    if (!form.nombres || !form.apellidos) return notify.warning('Completa nombres y apellidos.');
    if (!form.email.includes('@')) return notify.warning('Email inválido.');
    if (form.password && form.password.length < 6) return notify.warning('Si cambias el password, mínimo 6 caracteres.');

    setBusy(true);
    const tid = notify.loading('Guardando cambios…');
    try {
      const res = await actualizarDocente(token, docente.id, {
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email,
        password: form.password || undefined,
        dni: form.dni || undefined,
        telefono: form.telefono || undefined,
        especialidad: form.especialidad || undefined,
        grado_academico: form.grado_academico || undefined,
        estado: form.estado,
      });
      notify.dismiss(tid);
      notify.success({
        title: 'Docente actualizado',
        description: res.data.nombre_completo,
      });
      onUpdated?.();
      handleClose();
    } catch (err) {
      notify.dismiss(tid);
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      notify.apiError(err, 'No se pudo actualizar el docente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Editar docente"
      subtitle={docente ? `${docente.codigo_docente} — deja el password vacío para no cambiarlo` : ''}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar cambios'}
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
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="Nuevo password (opcional)" err={fieldErrors.password?.[0]}>
          <input
            type="text"
            value={form.password}
            placeholder="Dejar vacío para no cambiar"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm font-mono focus:outline-none focus:border-trilce-primary"
          />
        </Field>
        <Field label="Estado">
          <select
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value as 'activo' | 'inactivo' })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
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
