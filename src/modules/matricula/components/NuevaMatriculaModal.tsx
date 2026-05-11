'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { crearMatricula, useCatalogoMatricula } from '@/modules/matricula/api';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { Modal } from '@/shared/components/Modal';
import { ApiError } from '@/shared/lib/api';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function NuevaMatriculaModal({ open, onClose, onCreated }: Props) {
  const { token } = useAuth();
  const { data: catalogo, isLoading } = useCatalogoMatricula(open);

  const [search, setSearch] = useState('');
  const [estudianteId, setEstudianteId] = useState<number | null>(null);
  const [seccionId, setSeccionId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtrados = useMemo(() => {
    if (!catalogo?.estudiantes) return [];
    const q = search.trim().toLowerCase();
    if (!q) return catalogo.estudiantes.slice(0, 25);
    return catalogo.estudiantes
      .filter(
        (e) =>
          e.nombre_completo.toLowerCase().includes(q) ||
          e.dni.includes(search) ||
          e.codigo_estudiante.toLowerCase().includes(q),
      )
      .slice(0, 25);
  }, [catalogo, search]);

  function reset() {
    setSearch(''); setEstudianteId(null); setSeccionId(null);
    setObservaciones(''); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit() {
    if (!token) return;
    setError(null);
    if (!estudianteId) return setError('Selecciona un estudiante.');
    if (!seccionId) return setError('Selecciona una sección.');

    setBusy(true);
    try {
      await crearMatricula(token, {
        estudiante_id: estudianteId,
        seccion_id: seccionId,
        observaciones: observaciones || undefined,
      });
      onCreated?.();
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Error de red.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nueva matrícula"
      subtitle={catalogo?.periodo ? `Periodo ${catalogo.periodo.descripcion}` : 'Selecciona estudiante y sección'}
      width={620}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={busy || !estudianteId || !seccionId}>
            {busy ? 'Creando…' : 'Crear matrícula'}
          </Button>
        </>
      }
    >
      {isLoading && <p className="text-sm text-text-secondary">Cargando catálogo…</p>}

      {!isLoading && !catalogo?.periodo && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm p-3">
          No hay periodo académico activo. Crea uno antes de generar matrículas.
        </div>
      )}

      {!isLoading && catalogo?.periodo && (
        <div className="flex flex-col gap-4">
          {/* Selección de estudiante */}
          <section>
            <h3 className="text-xs font-bold tracking-widest text-text-muted mb-2">
              1. ESTUDIANTE SIN MATRÍCULA EN ESTE PERIODO
            </h3>
            <label className="flex items-center gap-2 px-3 py-2 bg-bg-card border border-border rounded-sm mb-2">
              <Icon name="Search" size={14} className="text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, DNI o código…"
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </label>
            <div className="max-h-44 overflow-y-auto border border-border rounded-sm">
              {filtrados.length === 0 ? (
                <p className="p-4 text-center text-sm text-text-muted">
                  {catalogo.estudiantes.length === 0
                    ? 'No hay estudiantes sin matrícula en este periodo.'
                    : 'Ningún estudiante coincide con la búsqueda.'}
                </p>
              ) : (
                filtrados.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setEstudianteId(e.id)}
                    className={`w-full text-left px-3 py-2 border-b border-border last:border-0 text-sm flex items-center justify-between ${
                      estudianteId === e.id ? 'bg-trilce-primary-soft' : 'hover:bg-bg-muted'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{e.nombre_completo}</div>
                      <div className="text-[11px] text-text-muted">DNI {e.dni} · {e.codigo_estudiante}</div>
                    </div>
                    {estudianteId === e.id && (
                      <Icon name="CircleCheck" size={16} className="text-trilce-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Selección de sección */}
          <section>
            <h3 className="text-xs font-bold tracking-widest text-text-muted mb-2">
              2. SECCIÓN DE DESTINO
            </h3>
            <select
              value={seccionId ?? ''}
              onChange={(e) => setSeccionId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-border rounded-sm text-sm bg-bg-card focus:outline-none focus:border-trilce-primary"
            >
              <option value="">Selecciona una sección…</option>
              {catalogo.secciones.map((s) => (
                <option key={s.id} value={s.id} disabled={s.cupo <= 0}>
                  {s.label} · {s.matriculados}/{s.capacidad} {s.cupo <= 0 ? '(LLENA)' : `(${s.cupo} cupos)`}
                </option>
              ))}
            </select>
          </section>

          {/* Observaciones */}
          <section>
            <h3 className="text-xs font-bold tracking-widest text-text-muted mb-2">
              3. OBSERVACIONES (OPCIONAL)
            </h3>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Ej. Estudiante reincorporado del año pasado…"
              className="w-full px-3 py-2 border border-border rounded-sm text-sm resize-none focus:outline-none focus:border-trilce-primary"
            />
          </section>

          <div className="bg-trilce-primary-soft border border-trilce-primary-light rounded-sm p-3 text-xs flex items-start gap-2">
            <Icon name="CircleCheck" size={14} className="text-trilce-primary mt-0.5" />
            <span className="text-text-secondary">
              Al crear la matrícula se generarán <b>11 pagos automáticamente</b>: 1 matrícula + 10 pensiones.
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm p-3">
              {error}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
