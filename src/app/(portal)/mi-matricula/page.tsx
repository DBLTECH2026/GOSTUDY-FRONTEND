'use client';

import { useMemo } from 'react';
import { useMiHorario, useMiMatricula } from '@/modules/portal/api';
import type { SlotHorario } from '@/modules/portal/types';
import { Icon, type IconName } from '@/shared/components/Icon';

const DIAS = [
  { num: 1, label: 'Lun', full: 'Lunes' },
  { num: 2, label: 'Mar', full: 'Martes' },
  { num: 3, label: 'Mié', full: 'Miércoles' },
  { num: 4, label: 'Jue', full: 'Jueves' },
  { num: 5, label: 'Vie', full: 'Viernes' },
];

// Paleta de colores asignada por curso_id (consistente entre vistas)
const PALETA_CURSOS = [
  { bg: 'bg-trilce-primary-soft',  border: 'border-trilce-primary',  text: 'text-trilce-primary-dark' },
  { bg: 'bg-sky-50',               border: 'border-sky-400',         text: 'text-sky-800' },
  { bg: 'bg-emerald-50',           border: 'border-emerald-400',     text: 'text-emerald-800' },
  { bg: 'bg-amber-50',             border: 'border-amber-400',       text: 'text-amber-800' },
  { bg: 'bg-violet-50',            border: 'border-violet-400',      text: 'text-violet-800' },
  { bg: 'bg-rose-50',              border: 'border-rose-400',        text: 'text-rose-800' },
  { bg: 'bg-indigo-50',            border: 'border-indigo-400',      text: 'text-indigo-800' },
  { bg: 'bg-teal-50',              border: 'border-teal-400',        text: 'text-teal-800' },
];

function colorDeCurso(cursoId: number) {
  return PALETA_CURSOS[cursoId % PALETA_CURSOS.length];
}

export default function MiMatriculaPage() {
  const { data: matricula, isLoading: loadingMat } = useMiMatricula();
  const { data: horario, isLoading: loadingHor } = useMiHorario();

  if (loadingMat || loadingHor) {
    return <p className="text-text-secondary p-4">Cargando matrícula y horario…</p>;
  }

  if (!matricula) {
    return (
      <div className="bg-bg-card border border-border rounded-md p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-bg-muted flex items-center justify-center mb-4">
          <Icon name="FileText" size={28} className="text-text-muted" />
        </div>
        <h2 className="text-lg font-bold mb-1">Aún no tienes una matrícula activa</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Cuando un administrador apruebe tu inscripción y genere la ficha de matrícula
          para el periodo actual, los datos aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Hero: datos de la matrícula */}
      <section className="bg-trilce-primary text-white rounded-lg p-5 sm:p-7">
        <p className="text-xs font-bold tracking-widest text-white/70 mb-1">MATRÍCULA ACTIVA</p>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {matricula.grado} {matricula.seccion} — {matricula.nivel}
        </h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-white/85">
          <InfoChip icon="Calendar">Periodo {matricula.periodo_descripcion}</InfoChip>
          {matricula.tutor_nombres && (
            <InfoChip icon="User">Tutor: {matricula.tutor_nombres} {matricula.tutor_apellidos}</InfoChip>
          )}
        </div>
      </section>

      {/* Calendario */}
      <section className="bg-bg-card border border-border rounded-md p-4 sm:p-6">
        <header className="flex items-center gap-2.5 mb-4">
          <Icon name="Calendar" size={18} className="text-trilce-primary" />
          <h2 className="text-base font-bold">Tu horario semanal</h2>
        </header>
        <Calendario slots={horario?.slots ?? []} />
      </section>

      {/* Leyenda de cursos */}
      {horario && horario.slots.length > 0 && (
        <section className="bg-bg-card border border-border rounded-md p-4 sm:p-5">
          <h3 className="text-xs font-bold tracking-widest text-text-muted mb-3">CURSOS DE LA SEMANA</h3>
          <Leyenda slots={horario.slots} />
        </section>
      )}
    </div>
  );
}

/* ─────────────────────────── Calendario ─────────────────────────── */

function Calendario({ slots }: { slots: SlotHorario[] }) {
  const { horasGrid, slotsPorDia } = useMemo(() => {
    if (slots.length === 0) {
      return { horasGrid: [] as string[], slotsPorDia: {} as Record<number, SlotHorario[]> };
    }

    const minMin = Math.min(...slots.map((s) => toMin(s.hora_inicio)));
    const maxMin = Math.max(...slots.map((s) => toMin(s.hora_fin)));
    const inicio = Math.floor(minMin / 60) * 60;
    const fin    = Math.ceil(maxMin / 60) * 60;

    const horas: string[] = [];
    for (let m = inicio; m < fin; m += 30) horas.push(fromMin(m));

    const byDay: Record<number, SlotHorario[]> = {};
    for (const s of slots) {
      (byDay[s.dia_semana] ??= []).push(s);
    }
    return { horasGrid: horas, slotsPorDia: byDay };
  }, [slots]);

  if (slots.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-text-muted">
        Tu sección aún no tiene horarios configurados. El colegio los asignará antes de iniciar clases.
      </div>
    );
  }

  // Cada fila del grid = 30 min.
  const rowHeight = 22;
  const inicio0 = toMin(horasGrid[0]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Encabezado de días */}
        <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border">
          <div />
          {DIAS.map((d) => (
            <div key={d.num} className="text-center py-2">
              <div className="text-[11px] font-bold tracking-widest text-text-muted">
                {d.label.toUpperCase()}
              </div>
              <div className="text-xs text-text-secondary">{d.full}</div>
            </div>
          ))}
        </div>

        {/* Cuerpo del calendario */}
        <div className="grid grid-cols-[60px_repeat(5,1fr)] relative">
          {/* Columna de horas */}
          <div className="flex flex-col">
            {horasGrid.map((h) => (
              <div
                key={h}
                className="text-[10px] text-text-muted text-right pr-2 border-b border-border/50"
                style={{ height: rowHeight }}
              >
                {h.endsWith(':00') ? h : ''}
              </div>
            ))}
          </div>

          {/* Columnas por día */}
          {DIAS.map((d) => {
            const slotsDia = slotsPorDia[d.num] ?? [];
            return (
              <div key={d.num} className="relative border-l border-border">
                {horasGrid.map((h) => (
                  <div
                    key={h}
                    className="border-b border-border/50"
                    style={{ height: rowHeight }}
                  />
                ))}

                {/* Bloques de clases */}
                {slotsDia.map((s) => {
                  const top = ((toMin(s.hora_inicio) - inicio0) / 30) * rowHeight;
                  const height = ((toMin(s.hora_fin) - toMin(s.hora_inicio)) / 30) * rowHeight;
                  const color = colorDeCurso(s.curso_id);

                  return (
                    <div
                      key={s.id}
                      className={`absolute left-1 right-1 rounded-sm border-l-4 ${color.bg} ${color.border} px-1.5 py-1 overflow-hidden`}
                      style={{ top, height: height - 2 }}
                      title={`${s.curso}\n${s.hora_inicio} – ${s.hora_fin}\n${s.aula ?? ''}\n${s.docente ?? ''}`}
                    >
                      <div className={`text-[10px] font-bold ${color.text} leading-tight`}>
                        {s.curso}
                      </div>
                      <div className="text-[9px] text-text-secondary leading-tight">
                        {s.hora_inicio}–{s.hora_fin}
                      </div>
                      {s.aula && height > 50 && (
                        <div className="text-[9px] text-text-muted leading-tight truncate">
                          {s.aula}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Leyenda ─────────────────────────── */

function Leyenda({ slots }: { slots: SlotHorario[] }) {
  const cursos = useMemo(() => {
    const mapa = new Map<number, { curso: string; docente: string | null; horas: number }>();
    for (const s of slots) {
      const mins = toMin(s.hora_fin) - toMin(s.hora_inicio);
      const existente = mapa.get(s.curso_id);
      if (existente) {
        existente.horas += mins / 60;
      } else {
        mapa.set(s.curso_id, { curso: s.curso, docente: s.docente, horas: mins / 60 });
      }
    }
    return Array.from(mapa.entries()).map(([id, info]) => ({ id, ...info }));
  }, [slots]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {cursos.map((c) => {
        const color = colorDeCurso(c.id);
        return (
          <div
            key={c.id}
            className={`flex items-center gap-2 p-2.5 rounded-sm border-l-4 ${color.bg} ${color.border}`}
          >
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold truncate ${color.text}`}>{c.curso}</div>
              <div className="text-[11px] text-text-muted truncate">
                {c.docente ? `Prof. ${c.docente}` : 'Sin docente asignado'} · {c.horas}h/sem
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

function fromMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function InfoChip({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon name={icon} size={14} className="opacity-90 flex-shrink-0" />
      {children}
    </span>
  );
}
