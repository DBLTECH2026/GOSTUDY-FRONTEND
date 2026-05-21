'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import {
  guardarHorariosSeccion,
  obtenerHorariosSeccion,
  useSecciones,
  type HorariosSeccionResponse,
  type SlotPayload,
} from '@/modules/academico/api';
import { Badge } from '@/shared/components/Badge';
import { useConfirm } from '@/shared/components/ConfirmProvider';
import { Icon } from '@/shared/components/Icon';
import { notify } from '@/shared/lib/notify';

const DIAS = [
  { num: 1, label: 'Lun' },
  { num: 2, label: 'Mar' },
  { num: 3, label: 'Mié' },
  { num: 4, label: 'Jue' },
  { num: 5, label: 'Vie' },
];

type SlotEditable = SlotPayload & { _key: string };

export default function HorariosAdminPage() {
  const { token } = useAuth();
  const confirm = useConfirm();
  const { data: secciones, isLoading: loadingList } = useSecciones();

  const [seccionId, setSeccionId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<HorariosSeccionResponse | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [saving, setSaving] = useState(false);

  // Slots editables locales
  const [slots, setSlots] = useState<SlotEditable[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (seccionId === null && secciones.length > 0) {
      setSeccionId(secciones[0].id);
    }
  }, [secciones, seccionId]);

  const cargarDetalle = useCallback(async () => {
    if (!token || seccionId === null) return;
    setLoadingDetalle(true);
    try {
      const r = await obtenerHorariosSeccion(token, seccionId);
      setDetalle(r.data);
      setSlots(
        r.data.horarios.map((h) => ({
          _key: 'srv-' + h.id,
          seccion_curso_id: h.seccion_curso_id,
          dia_semana: h.dia_semana,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          aula: h.aula,
        })),
      );
      setDirty(false);
    } catch {
      notify.error('No se pudo cargar el horario de la sección.');
    } finally {
      setLoadingDetalle(false);
    }
  }, [token, seccionId]);

  useEffect(() => { cargarDetalle(); }, [cargarDetalle]);

  function addSlot(seccionCursoId: number) {
    setSlots((prev) => [
      ...prev,
      {
        _key: 'new-' + Date.now() + '-' + Math.random(),
        seccion_curso_id: seccionCursoId,
        dia_semana: 1,
        hora_inicio: '08:00',
        hora_fin: '09:30',
        aula: null,
      },
    ]);
    setDirty(true);
  }

  function updateSlot(key: string, patch: Partial<SlotEditable>) {
    setSlots((prev) => prev.map((s) => (s._key === key ? { ...s, ...patch } : s)));
    setDirty(true);
  }

  function removeSlot(key: string) {
    setSlots((prev) => prev.filter((s) => s._key !== key));
    setDirty(true);
  }

  async function handleGuardar() {
    if (!token || !detalle) return;

    // Validación básica
    for (const s of slots) {
      if (s.hora_inicio >= s.hora_fin) {
        notify.warning(`Hay un horario con hora fin anterior o igual a inicio.`);
        return;
      }
    }

    setSaving(true);
    const tid = notify.loading('Guardando horario…');
    try {
      const res = await guardarHorariosSeccion(token, detalle.seccion.id,
        slots.map(({ _key, ...rest }) => rest),
      );
      notify.dismiss(tid);
      notify.success({ title: 'Horario guardado', description: res.message });
      await cargarDetalle();
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudo guardar el horario.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLimpiar() {
    const ok = await confirm({
      title: '¿Vaciar todos los horarios de esta sección?',
      description: 'Los slots se eliminarán al guardar. Esta acción puede deshacerse antes de guardar.',
      confirmText: 'Vaciar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!ok) return;
    setSlots([]);
    setDirty(true);
  }

  const slotsPorCurso = useMemo(() => {
    const map = new Map<number, SlotEditable[]>();
    for (const s of slots) {
      if (!map.has(s.seccion_curso_id)) map.set(s.seccion_curso_id, []);
      map.get(s.seccion_curso_id)!.push(s);
    }
    return map;
  }, [slots]);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold">Horarios por sección</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Configura el día y hora en que se dicta cada curso. Los estudiantes verán este horario en su panel.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Selector de secciones */}
        <aside className="bg-bg-card border border-border rounded-md flex flex-col max-h-[700px]">
          <div className="p-4 border-b border-border">
            <h2 className="text-xs font-bold tracking-widest text-text-muted">
              SECCIONES ({secciones.length})
            </h2>
          </div>
          <ul className="overflow-y-auto flex-1">
            {loadingList ? (
              <li className="p-6 text-center text-sm text-text-muted">Cargando…</li>
            ) : secciones.length === 0 ? (
              <li className="p-6 text-center text-sm text-text-muted">No hay secciones del periodo activo.</li>
            ) : (
              secciones.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setSeccionId(s.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-bg-muted ${
                      s.id === seccionId ? 'bg-trilce-primary-soft border-l-4 border-l-trilce-primary' : ''
                    }`}
                  >
                    <div className="font-semibold text-sm">{s.grado} {s.nombre}</div>
                    <div className="text-[11px] text-text-muted">{s.nivel}</div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* Editor */}
        <main className="bg-bg-card border border-border rounded-md p-5 sm:p-6 min-h-[400px]">
          {loadingDetalle || !detalle ? (
            <p className="text-text-secondary text-sm">
              {loadingDetalle ? 'Cargando…' : 'Selecciona una sección.'}
            </p>
          ) : (
            <>
              <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl font-bold">{detalle.seccion.label}</h2>
                  <p className="text-xs text-text-muted">Periodo {detalle.seccion.periodo}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleLimpiar}
                    disabled={slots.length === 0 || saving}
                    className="text-xs text-text-secondary hover:text-red-600 font-semibold px-3 py-2 disabled:opacity-40"
                  >
                    Vaciar todo
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={!dirty || saving}
                    className="bg-trilce-primary hover:bg-trilce-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-sm flex items-center gap-2 disabled:opacity-40"
                  >
                    <Icon name="CircleCheck" size={14} />
                    {saving ? 'Guardando…' : dirty ? 'Guardar cambios' : 'Sin cambios'}
                  </button>
                </div>
              </header>

              {detalle.cursos.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-sm p-3">
                  Esta sección no tiene cursos asignados. Asigna docentes en{' '}
                  <a href="/asignaciones" className="font-semibold underline">/asignaciones</a> primero.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {detalle.cursos.map((curso) => {
                    const slotsDelCurso = slotsPorCurso.get(curso.seccion_curso_id) ?? [];
                    return (
                      <CursoCard
                        key={curso.seccion_curso_id}
                        curso={curso}
                        slots={slotsDelCurso}
                        onAdd={() => addSlot(curso.seccion_curso_id)}
                        onUpdate={updateSlot}
                        onRemove={removeSlot}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ──────────────────────── Subcomponentes ──────────────────────── */

function CursoCard({
  curso, slots, onAdd, onUpdate, onRemove,
}: {
  curso: { seccion_curso_id: number; curso: string; codigo: string; horas_semana: number;
           docente_nombres: string | null; docente_apellidos: string | null };
  slots: SlotEditable[];
  onAdd: () => void;
  onUpdate: (key: string, patch: Partial<SlotEditable>) => void;
  onRemove: (key: string) => void;
}) {
  const horasAsignadas = slots.reduce((acc, s) => acc + diffMin(s.hora_inicio, s.hora_fin) / 60, 0);

  return (
    <article className="border border-border rounded-md">
      <header className="flex items-center justify-between p-3 bg-bg-muted border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{curso.curso}</h3>
          <p className="text-[11px] text-text-muted">
            {curso.codigo} · Prof. {curso.docente_nombres ?? '—'} {curso.docente_apellidos ?? ''}
          </p>
        </div>
        <Badge variant={Math.abs(horasAsignadas - curso.horas_semana) < 0.01 ? 'success' : 'warning'}>
          {horasAsignadas}h / {curso.horas_semana}h sem
        </Badge>
      </header>

      <div className="p-3 flex flex-col gap-2">
        {slots.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-2">Sin slots configurados</p>
        ) : (
          slots.map((s) => (
            <div
              key={s._key}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center text-xs"
            >
              <select
                value={s.dia_semana}
                onChange={(e) => onUpdate(s._key, { dia_semana: Number(e.target.value) })}
                className="px-2 py-1.5 border border-border rounded-sm bg-bg-card"
              >
                {DIAS.map((d) => <option key={d.num} value={d.num}>{d.label}</option>)}
              </select>
              <input
                type="time"
                value={s.hora_inicio}
                onChange={(e) => onUpdate(s._key, { hora_inicio: e.target.value })}
                className="px-2 py-1.5 border border-border rounded-sm"
              />
              <input
                type="time"
                value={s.hora_fin}
                onChange={(e) => onUpdate(s._key, { hora_fin: e.target.value })}
                className="px-2 py-1.5 border border-border rounded-sm"
              />
              <input
                type="text"
                value={s.aula ?? ''}
                onChange={(e) => onUpdate(s._key, { aula: e.target.value || null })}
                placeholder="Aula 101"
                className="px-2 py-1.5 border border-border rounded-sm"
              />
              <button
                onClick={() => onRemove(s._key)}
                className="p-1.5 rounded-sm text-text-muted hover:text-red-600 hover:bg-red-50"
                title="Eliminar slot"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ))
        )}
        <button
          onClick={onAdd}
          className="self-start text-xs text-trilce-primary font-semibold hover:underline flex items-center gap-1 mt-1"
        >
          <Icon name="Plus" size={12} /> Agregar slot
        </button>
      </div>
    </article>
  );
}

function diffMin(a: string, b: string): number {
  const [h1, m1] = a.split(':').map(Number);
  const [h2, m2] = b.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}
