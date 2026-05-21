'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { actualizarCurso, type CursoRow } from '@/modules/academico/api';
import { inscripcionApi, type NivelCatalogo } from '@/modules/inscripcion/api';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { ApiError } from '@/shared/lib/api';
import { notify } from '@/shared/lib/notify';

type Props = {
  open: boolean;
  curso: CursoRow | null;
  onClose: () => void;
  onUpdated?: () => void;
};

export function EditarCursoModal({ open, curso, onClose, onUpdated }: Props) {
  const { token } = useAuth();
  const [niveles, setNiveles] = useState<NivelCatalogo[]>([]);
  const [form, setForm] = useState({
    nivel_id: '',
    grado_id: '',
    nombre: '',
    codigo: '',
    horas_semana: '4',
    descripcion: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    inscripcionApi.catalogoNivelesGrados()
      .then((r) => setNiveles(r.data))
      .catch(() => setNiveles([]));
  }, [open]);

  useEffect(() => {
    if (curso) {
      setForm({
        nivel_id:     String(curso.nivel_id ?? ''),
        grado_id:     String(curso.grado_id),
        nombre:       curso.nombre,
        codigo:       curso.codigo,
        horas_semana: String(curso.horas_semana),
        descripcion:  curso.descripcion ?? '',
      });
      setFieldErrors({});
    }
  }, [curso]);

  const nivelActual = useMemo(
    () => niveles.find((n) => n.id === Number(form.nivel_id)) ?? null,
    [niveles, form.nivel_id],
  );

  function handleClose() {
    setFieldErrors({});
    onClose();
  }

  async function handleSubmit() {
    if (!token || !curso) return;
    setFieldErrors({});

    if (!form.grado_id) return notify.warning('Selecciona un grado.');
    if (!form.nombre.trim()) return notify.warning('Indica el nombre del curso.');
    if (!form.codigo.trim()) return notify.warning('El código es obligatorio.');
    const horas = Number(form.horas_semana);
    if (!horas || horas < 1 || horas > 15) return notify.warning('Las horas deben estar entre 1 y 15.');

    setBusy(true);
    const tid = notify.loading('Guardando cambios…');
    try {
      const res = await actualizarCurso(token, curso.id, {
        grado_id: Number(form.grado_id),
        nombre: form.nombre.trim(),
        codigo: form.codigo.trim(),
        horas_semana: horas,
        descripcion: form.descripcion.trim() || undefined,
      });
      notify.dismiss(tid);
      notify.success({
        title: 'Curso actualizado',
        description: `${res.data.nombre} · ${res.data.codigo}`,
      });
      onUpdated?.();
      handleClose();
    } catch (err) {
      notify.dismiss(tid);
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      notify.apiError(err, 'No se pudo actualizar el curso.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Editar curso"
      subtitle={curso ? `${curso.codigo} · ${curso.secciones_asignadas} secciones lo dictan` : ''}
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
        <Field label="Nivel *">
          <select
            value={form.nivel_id}
            onChange={(e) => setForm({ ...form, nivel_id: e.target.value, grado_id: '' })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm bg-bg-card focus:outline-none focus:border-trilce-primary"
          >
            <option value="">— Selecciona —</option>
            {niveles.map((n) => (
              <option key={n.id} value={n.id}>{n.nombre}</option>
            ))}
          </select>
        </Field>

        <Field label="Grado *" err={fieldErrors.grado_id?.[0]}>
          <select
            value={form.grado_id}
            onChange={(e) => setForm({ ...form, grado_id: e.target.value })}
            disabled={!nivelActual}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm bg-bg-card focus:outline-none focus:border-trilce-primary disabled:opacity-50"
          >
            <option value="">— Selecciona —</option>
            {nivelActual?.grados.map((g) => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </select>
        </Field>

        <Field label="Nombre *" err={fieldErrors.nombre?.[0]} className="sm:col-span-2">
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>

        <Field label="Código *" err={fieldErrors.codigo?.[0]}>
          <input
            type="text"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm font-mono focus:outline-none focus:border-trilce-primary"
          />
        </Field>

        <Field label="Horas por semana *" err={fieldErrors.horas_semana?.[0]}>
          <input
            type="number"
            min={1}
            max={15}
            value={form.horas_semana}
            onChange={(e) => setForm({ ...form, horas_semana: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
          />
        </Field>

        <Field label="Descripción (opcional)" className="sm:col-span-2">
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={2}
            maxLength={300}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm resize-none focus:outline-none focus:border-trilce-primary"
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
