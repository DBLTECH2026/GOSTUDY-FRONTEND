'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { crearCurso, type CursoRow } from '@/modules/academico/api';
import { inscripcionApi, type NivelCatalogo } from '@/modules/inscripcion/api';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { ApiError } from '@/shared/lib/api';
import { notify } from '@/shared/lib/notify';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function NuevoCursoModal({ open, onClose, onCreated }: Props) {
  const { token } = useAuth();
  const [niveles, setNiveles] = useState<NivelCatalogo[]>([]);
  const [form, setForm] = useState({
    nivel_id: '',
    grado_id: '',
    nombre: '',
    horas_semana: '4',
    descripcion: '',
    codigo: '',
  });
  const [modoLote, setModoLote] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  // Cargar niveles+grados al abrir
  useEffect(() => {
    if (!open) return;
    inscripcionApi.catalogoNivelesGrados()
      .then((r) => setNiveles(r.data))
      .catch(() => setNiveles([]));
  }, [open]);

  const nivelActual = useMemo(
    () => niveles.find((n) => n.id === Number(form.nivel_id)) ?? null,
    [niveles, form.nivel_id],
  );

  const gradoActual = useMemo(
    () => nivelActual?.grados.find((g) => g.id === Number(form.grado_id)) ?? null,
    [nivelActual, form.grado_id],
  );

  // Sugerir código cuando hay nivel + grado + nombre y el modo es único
  const codigoSugerido = useMemo(() => {
    if (modoLote || !nivelActual || !gradoActual || !form.nombre.trim()) return '';
    return generarCodigoCliente(nivelActual.nombre, gradoActual.nombre, form.nombre);
  }, [modoLote, nivelActual, gradoActual, form.nombre]);

  function reset() {
    setForm({ nivel_id: '', grado_id: '', nombre: '', horas_semana: '4', descripcion: '', codigo: '' });
    setModoLote(false);
    setFieldErrors({});
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit() {
    if (!token) return;
    setFieldErrors({});

    if (!form.nivel_id) return notify.warning('Selecciona un nivel.');
    if (!modoLote && !form.grado_id) return notify.warning('Selecciona un grado o activa el modo lote.');
    if (!form.nombre.trim()) return notify.warning('Indica el nombre del curso.');
    const horas = Number(form.horas_semana);
    if (!horas || horas < 1 || horas > 15) return notify.warning('Las horas deben estar entre 1 y 15.');

    setBusy(true);
    const tid = notify.loading(modoLote ? 'Creando cursos en lote…' : 'Creando curso…');
    try {
      const payload = modoLote
        ? {
            modo_lote: true as const,
            nivel_id: Number(form.nivel_id),
            nombre: form.nombre.trim(),
            horas_semana: horas,
            descripcion: form.descripcion.trim() || undefined,
          }
        : {
            grado_id: Number(form.grado_id),
            nombre: form.nombre.trim(),
            codigo: (form.codigo || codigoSugerido).trim() || undefined,
            horas_semana: horas,
            descripcion: form.descripcion.trim() || undefined,
          };

      const res = await crearCurso(token, payload);
      notify.dismiss(tid);

      if (modoLote && 'creados' in (res.data as object)) {
        const data = res.data as { creados: number; cursos: CursoRow[] };
        notify.success({
          title: 'Cursos creados',
          description: `${data.creados} cursos generados, 1 por cada grado de ${nivelActual?.nombre}.`,
        });
      } else {
        const data = res.data as CursoRow;
        notify.success({
          title: 'Curso creado',
          description: `${data.nombre} · ${data.codigo}`,
        });
      }

      onCreated?.();
      handleClose();
    } catch (err) {
      notify.dismiss(tid);
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      notify.apiError(err, 'No se pudo crear el curso.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nuevo curso"
      subtitle="Define el curso una vez, o repítelo en todos los grados de un nivel"
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Creando…' : modoLote ? 'Crear en lote' : 'Crear curso'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Modo lote */}
        <label className="flex items-start gap-3 p-3 bg-trilce-primary-soft rounded-sm cursor-pointer">
          <input
            type="checkbox"
            checked={modoLote}
            onChange={(e) => setModoLote(e.target.checked)}
            className="mt-0.5 accent-trilce-primary"
          />
          <div className="flex-1">
            <span className="text-sm font-semibold text-trilce-primary-dark block">
              Crear para todos los grados de este nivel
            </span>
            <span className="text-xs text-text-secondary">
              Ej: crear "Robótica" para 1ro, 2do, 3ro, 4to, 5to y 6to de Primaria de una sola vez.
            </span>
          </div>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nivel *" err={fieldErrors.nivel_id?.[0]}>
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

          <Field
            label={modoLote ? 'Grado (no aplica en lote)' : 'Grado *'}
            err={fieldErrors.grado_id?.[0]}
          >
            <select
              disabled={modoLote || !nivelActual}
              value={form.grado_id}
              onChange={(e) => setForm({ ...form, grado_id: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-sm text-sm bg-bg-card focus:outline-none focus:border-trilce-primary disabled:opacity-50"
            >
              <option value="">— Selecciona —</option>
              {nivelActual?.grados.map((g) => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
          </Field>

          <Field label="Nombre del curso *" err={fieldErrors.nombre?.[0]} className="sm:col-span-2">
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Matemática, Comunicación, Educación Física…"
              className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
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

          {!modoLote && (
            <Field label="Código (auto-generado, editable)" err={fieldErrors.codigo?.[0]}>
              <input
                type="text"
                value={form.codigo || codigoSugerido}
                onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                placeholder={codigoSugerido || 'Ej: PRI-1ro-MMAT'}
                className="w-full px-3 py-2 border border-border rounded-sm text-sm font-mono focus:outline-none focus:border-trilce-primary"
              />
            </Field>
          )}

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

        {modoLote && nivelActual && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-sm p-3">
            Se crearán <b>{nivelActual.grados.length} cursos</b> ({nivelActual.grados.map((g) => g.nombre).join(', ')}), uno por cada grado de {nivelActual.nombre}.
          </div>
        )}
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

/**
 * Replica simplificada del generador del backend para mostrar
 * la sugerencia en tiempo real. El backend valida unicidad.
 */
function generarCodigoCliente(nivel: string, grado: string, curso: string): string {
  const prefNivel = nivel.substring(0, 3).toUpperCase();
  const cleanGrado = grado.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const clean = curso
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // sin tildes
    .replace(/[^A-Za-z ]/g, '')
    .trim();
  const palabras = clean.split(/\s+/).filter(Boolean);
  const iniciales = palabras.map((w) => w[0]).join('').toUpperCase();
  const sufijo = clean.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  return `${prefNivel}-${cleanGrado}-${iniciales}${sufijo}`;
}
