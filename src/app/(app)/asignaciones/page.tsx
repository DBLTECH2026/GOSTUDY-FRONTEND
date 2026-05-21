'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import {
  asignarTutor,
  AsignacionesResponse,
  AsignacionItem,
  guardarAsignaciones,
  obtenerAsignaciones,
  SeccionRow,
  useSecciones,
} from '@/modules/academico/api';
import { Badge } from '@/shared/components/Badge';
import { Icon } from '@/shared/components/Icon';
import { notify } from '@/shared/lib/notify';

export default function AsignacionesPage() {
  const { token } = useAuth();
  const { data: secciones, isLoading: loadingList, reload: reloadSecciones } = useSecciones();

  const [seccionId, setSeccionId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<AsignacionesResponse | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [saving, setSaving] = useState(false);

  // Borrador editable de asignaciones: curso_id -> docente_id|null
  const [borrador, setBorrador] = useState<Record<number, number | null>>({});
  const [tutorBorrador, setTutorBorrador] = useState<number | null>(null);

  // Auto-seleccionar la primera sección si aún no hay
  useEffect(() => {
    if (seccionId === null && secciones.length > 0) {
      setSeccionId(secciones[0].id);
    }
  }, [secciones, seccionId]);

  // Cargar detalle cuando cambia la sección
  useEffect(() => {
    if (!token || seccionId === null) return;
    let cancelled = false;
    setLoadingDetalle(true);
    obtenerAsignaciones(token, seccionId)
      .then((r) => {
        if (cancelled) return;
        setDetalle(r.data);
        const inicial: Record<number, number | null> = {};
        r.data.asignaciones.forEach((a) => { inicial[a.curso_id] = a.docente_id; });
        setBorrador(inicial);
        const tutorActual = secciones.find((s) => s.id === seccionId);
        setTutorBorrador(tutorActual?.docente_tutor ? findDocenteIdByName(r.data.docentes, tutorActual.docente_tutor) : null);
      })
      .catch(() => { if (!cancelled) notify.apiError(null, 'No se pudo cargar la sección.'); })
      .finally(() => { if (!cancelled) setLoadingDetalle(false); });
    return () => { cancelled = true; };
  }, [token, seccionId, secciones]);

  const seccionActual = useMemo(
    () => secciones.find((s) => s.id === seccionId) ?? null,
    [secciones, seccionId],
  );

  const cambios = useMemo(() => {
    if (!detalle) return 0;
    return detalle.asignaciones.reduce((n, a) => {
      const nuevo = borrador[a.curso_id] ?? null;
      return n + (nuevo !== a.docente_id ? 1 : 0);
    }, 0);
  }, [borrador, detalle]);

  const totalAsignados = useMemo(
    () => Object.values(borrador).filter((d) => d !== null).length,
    [borrador],
  );

  async function handleGuardar() {
    if (!token || !detalle || !seccionId) return;
    if (cambios === 0) {
      notify.info('No hay cambios por guardar.');
      return;
    }

    setSaving(true);
    const tid = notify.loading('Guardando asignaciones…');
    try {
      const payload = detalle.asignaciones.map((a) => ({
        curso_id: a.curso_id,
        docente_id: borrador[a.curso_id] ?? null,
      }));
      const res = await guardarAsignaciones(token, seccionId, payload);
      notify.dismiss(tid);
      notify.success({
        title: 'Asignaciones guardadas',
        description: `${res.data.asignadas} de ${res.data.total} cursos con docente asignado.`,
      });
      reloadSecciones();
      // Recargar detalle para reflejar IDs persistidos
      const fresh = await obtenerAsignaciones(token, seccionId);
      setDetalle(fresh.data);
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudieron guardar las asignaciones.');
    } finally {
      setSaving(false);
    }
  }

  async function handleGuardarTutor() {
    if (!token || !seccionId) return;
    const tid = notify.loading('Actualizando tutor…');
    try {
      const res = await asignarTutor(token, seccionId, tutorBorrador);
      notify.dismiss(tid);
      notify.success(res.message);
      reloadSecciones();
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudo actualizar el tutor.');
    }
  }

  function setDocenteDeCurso(cursoId: number, docenteId: number | null) {
    setBorrador((b) => ({ ...b, [cursoId]: docenteId }));
  }

  /* ───────────────────────────── render ───────────────────────────── */

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold">Asignaciones académicas</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Define qué docente dicta cada curso en cada sección.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        {/* ─── Selector de secciones ─── */}
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
              <li className="p-6 text-center text-sm text-text-muted">
                No hay secciones del periodo activo. Crea secciones primero.
              </li>
            ) : (
              secciones.map((s) => <SeccionRowItem key={s.id} s={s} active={s.id === seccionId} onClick={() => setSeccionId(s.id)} />)
            )}
          </ul>
        </aside>

        {/* ─── Panel de asignaciones ─── */}
        <main className="bg-bg-card border border-border rounded-md p-5 sm:p-6 min-h-[400px]">
          {!seccionActual || !detalle ? (
            <p className="text-text-secondary text-sm">
              {loadingDetalle ? 'Cargando…' : 'Selecciona una sección para gestionar sus cursos.'}
            </p>
          ) : (
            <>
              <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl font-bold">{detalle.seccion.label}</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Periodo {detalle.seccion.periodo} · Capacidad {detalle.seccion.capacidad}
                  </p>
                </div>
                <Badge variant={totalAsignados === detalle.asignaciones.length ? 'success' : 'warning'}>
                  {totalAsignados}/{detalle.asignaciones.length} cursos asignados
                </Badge>
              </header>

              {/* Tutor de la sección */}
              <section className="bg-bg-muted border border-border rounded-sm p-4 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-text-primary mb-0.5">
                      Docente tutor de la sección
                    </h3>
                    <p className="text-xs text-text-secondary">
                      El tutor es el responsable general del grupo (asistencia, comunicados, etc.).
                    </p>
                  </div>
                  <div className="flex gap-2 self-start sm:self-auto">
                    <select
                      value={tutorBorrador ?? ''}
                      onChange={(e) => setTutorBorrador(e.target.value ? Number(e.target.value) : null)}
                      className="px-3 py-2 border border-border rounded-sm text-sm bg-bg-card focus:outline-none focus:border-trilce-primary min-w-[200px]"
                    >
                      <option value="">— Sin tutor —</option>
                      {detalle.docentes.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre_completo}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleGuardarTutor}
                      className="bg-trilce-primary hover:bg-trilce-primary-dark text-white text-sm font-semibold px-4 rounded-sm"
                    >
                      Guardar tutor
                    </button>
                  </div>
                </div>
              </section>

              {/* Tabla cursos↔docente */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold tracking-widest text-text-muted">
                    CURSOS DEL GRADO ({detalle.asignaciones.length})
                  </h3>
                  {cambios > 0 && (
                    <span className="text-xs text-amber-600 font-semibold">
                      {cambios} cambio{cambios === 1 ? '' : 's'} sin guardar
                    </span>
                  )}
                </div>

                {detalle.docentes.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-sm p-3 mb-3">
                    No hay docentes activos. Crea docentes en{' '}
                    <a href="/docentes" className="font-semibold underline">/docentes</a>{' '}
                    antes de asignar cursos.
                  </div>
                )}

                <div className="border border-border rounded-sm overflow-hidden">
                  <div className="hidden md:grid grid-cols-[1fr_120px_70px_280px] gap-4 px-4 py-2.5 bg-bg-muted border-b border-border text-[11px] font-bold tracking-widest text-text-muted">
                    <span>CURSO</span>
                    <span>CÓDIGO</span>
                    <span>HORAS</span>
                    <span>DOCENTE</span>
                  </div>
                  {detalle.asignaciones.map((a) => (
                    <CursoRow
                      key={a.curso_id}
                      a={a}
                      docentes={detalle.docentes}
                      docenteSeleccionado={borrador[a.curso_id] ?? null}
                      onChange={(id) => setDocenteDeCurso(a.curso_id, id)}
                    />
                  ))}
                </div>
              </section>

              {/* Acciones */}
              <footer className="flex justify-end gap-2 mt-5 pt-5 border-t border-border">
                <button
                  disabled={cambios === 0 || saving}
                  onClick={() => {
                    const inicial: Record<number, number | null> = {};
                    detalle.asignaciones.forEach((a) => { inicial[a.curso_id] = a.docente_id; });
                    setBorrador(inicial);
                  }}
                  className="text-text-secondary hover:text-text-primary text-sm font-semibold px-4 py-2 disabled:opacity-40"
                >
                  Descartar cambios
                </button>
                <button
                  disabled={cambios === 0 || saving}
                  onClick={handleGuardar}
                  className="bg-trilce-primary hover:bg-trilce-primary-dark disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-sm flex items-center gap-2"
                >
                  <Icon name="CircleCheck" size={16} />
                  {saving ? 'Guardando…' : `Guardar asignaciones${cambios > 0 ? ` (${cambios})` : ''}`}
                </button>
              </footer>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ──────────────────────────── subcomponentes ──────────────────────────── */

function SeccionRowItem({
  s, active, onClick,
}: {
  s: SeccionRow;
  active: boolean;
  onClick: () => void;
}) {
  const completo = s.cursos_asignados === s.cursos_total && s.cursos_total > 0;
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-bg-muted ${
          active ? 'bg-trilce-primary-soft border-l-4 border-l-trilce-primary' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-semibold text-sm text-text-primary truncate">
              {s.grado} {s.nombre}
            </div>
            <div className="text-[11px] text-text-muted truncate">
              {s.nivel} · {s.matriculados}/{s.capacidad} matriculados
            </div>
          </div>
          <Badge variant={completo ? 'success' : s.cursos_asignados > 0 ? 'warning' : 'neutral'}>
            {s.cursos_asignados}/{s.cursos_total}
          </Badge>
        </div>
        {s.docente_tutor && (
          <div className="text-[10px] text-text-muted mt-1 truncate">
            Tutor: {s.docente_tutor}
          </div>
        )}
      </button>
    </li>
  );
}

function CursoRow({
  a, docentes, docenteSeleccionado, onChange,
}: {
  a: AsignacionItem;
  docentes: { id: number; nombre_completo: string; especialidad: string | null }[];
  docenteSeleccionado: number | null;
  onChange: (id: number | null) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-[1fr_120px_70px_280px] gap-x-3 gap-y-1 md:gap-4 px-4 py-3 border-b border-border last:border-0 text-sm items-center">
      <span className="col-span-2 md:col-span-1 font-semibold text-text-primary">{a.curso_nombre}</span>
      <span className="text-text-muted text-xs font-mono">
        <span className="md:hidden text-[10px] text-text-muted mr-1">Código:</span>
        {a.curso_codigo}
      </span>
      <span className="text-text-secondary text-xs">
        <span className="md:hidden text-[10px] text-text-muted mr-1">Horas:</span>
        {a.horas_semana}h
      </span>
      <select
        value={docenteSeleccionado ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="col-span-2 md:col-span-1 px-3 py-1.5 border border-border rounded-sm text-sm bg-bg-card focus:outline-none focus:border-trilce-primary"
      >
        <option value="">— Sin asignar —</option>
        {docentes.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nombre_completo}{d.especialidad ? ` · ${d.especialidad}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ──────────────────────────── helpers ──────────────────────────── */

function findDocenteIdByName(
  docentes: { id: number; nombre_completo: string }[],
  nombre: string,
): number | null {
  const found = docentes.find((d) => d.nombre_completo.trim() === nombre.trim());
  return found?.id ?? null;
}
