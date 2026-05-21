'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDetalleCurso } from '@/modules/portal/api';
import type { BimestreDetalle, SemanaDetalle } from '@/modules/portal/types';
import { Badge } from '@/shared/components/Badge';
import { Icon, type IconName } from '@/shared/components/Icon';

const DIAS_CORTO = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CursoDetallePage() {
  const params = useParams<{ id: string }>();
  const seccionCursoId = params?.id ? Number(params.id) : null;

  const { data, isLoading, error } = useDetalleCurso(seccionCursoId);

  // Bimestre seleccionado por defecto: el actual; fallback al primero
  const bimestreInicial = useMemo(() => {
    if (!data) return null;
    const actual = data.bimestres.find((b) => b.es_actual);
    return actual?.id ?? data.bimestres[0]?.id ?? null;
  }, [data]);

  const [bimestreActivo, setBimestreActivo] = useState<number | null>(null);

  useEffect(() => {
    if (bimestreInicial !== null && bimestreActivo === null) {
      setBimestreActivo(bimestreInicial);
    }
  }, [bimestreInicial, bimestreActivo]);

  // Solo mostramos "Cargando" cuando no hay datos previos. En refetches mantenemos
  // la UI estable para evitar desmontar children (modales, scroll posicionado, etc.).
  if (isLoading && !data) {
    return <p className="text-text-secondary p-4">Cargando curso…</p>;
  }

  if (error || !data) {
    return (
      <div className="bg-bg-card border border-border rounded-md p-10 text-center">
        <Icon name="TriangleAlert" size={28} className="text-amber-600 mx-auto mb-3" />
        <p className="font-semibold text-text-primary">No se pudo cargar el curso</p>
        <p className="text-sm text-text-secondary mt-1">{error ?? 'Verifica que el curso esté en tu sección.'}</p>
        <Link href="/mis-cursos" className="inline-block mt-4 text-trilce-primary font-semibold hover:underline">
          ← Volver a mis cursos
        </Link>
      </div>
    );
  }

  const { curso, horarios, bimestres } = data;
  const bimestreSel = bimestres.find((b) => b.id === bimestreActivo) ?? bimestres[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <Link
        href="/mis-cursos"
        className="text-xs text-text-secondary hover:text-trilce-primary font-semibold flex items-center gap-1 self-start"
      >
        ← Volver a mis cursos
      </Link>

      {/* Header del curso */}
      <section className="bg-trilce-primary text-white rounded-lg p-5 sm:p-7">
        <p className="text-xs font-bold tracking-widest text-white/70 mb-1">CURSO · {curso.codigo}</p>
        <h1 className="text-2xl sm:text-3xl font-bold">{curso.nombre}</h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-white/85">
          {curso.docente && <InfoChip icon="User">Prof. {curso.docente}</InfoChip>}
          <InfoChip icon="Clock">{curso.horas_semana}h por semana</InfoChip>
        </div>
        {curso.descripcion && (
          <p className="mt-3 text-sm text-white/80">{curso.descripcion}</p>
        )}
      </section>

      {/* Horarios del curso */}
      {horarios.length > 0 && (
        <section className="bg-bg-card border border-border rounded-md p-4 sm:p-5">
          <h3 className="text-xs font-bold tracking-widest text-text-muted mb-3">CUÁNDO SE DICTA</h3>
          <div className="flex flex-wrap gap-2">
            {horarios.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-trilce-primary-soft border border-trilce-primary-light rounded-sm text-sm"
              >
                <Icon name="Calendar" size={14} className="text-trilce-primary" />
                <span className="font-semibold text-trilce-primary-dark">{DIAS_CORTO[h.dia_semana]}</span>
                <span className="text-text-secondary">{h.hora_inicio} – {h.hora_fin}</span>
                {h.aula && (
                  <span className="text-xs text-text-muted">· {h.aula}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tabs de bimestres */}
      <section className="bg-bg-card border border-border rounded-md overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {bimestres.map((b) => (
            <button
              key={b.id}
              onClick={() => setBimestreActivo(b.id)}
              className={`flex-1 min-w-[140px] px-4 py-3 text-sm font-semibold transition-colors relative ${
                bimestreActivo === b.id
                  ? 'text-trilce-primary bg-trilce-primary-soft border-b-2 border-trilce-primary'
                  : 'text-text-secondary hover:bg-bg-muted'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {b.nombre}
                {b.es_actual && (
                  <Badge variant="success" className="text-[9px] py-0 px-1.5">ACTUAL</Badge>
                )}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">
                {fmtRango(b.fecha_inicio, b.fecha_fin)}
              </div>
            </button>
          ))}
        </div>

        {bimestreSel && (
          <BimestrePanel bimestre={bimestreSel} />
        )}
      </section>
    </div>
  );
}

/* ──────────────────────── Panel de bimestre ──────────────────────── */

function BimestrePanel({ bimestre }: { bimestre: BimestreDetalle }) {
  const semanaActualIndex = bimestre.semanas.findIndex((s) => s.es_actual);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold">{bimestre.nombre}</h3>
          <p className="text-xs text-text-muted">
            {bimestre.semanas.length} semanas · {fmtRango(bimestre.fecha_inicio, bimestre.fecha_fin)}
          </p>
        </div>
        {semanaActualIndex !== -1 && (
          <Badge variant="success">Semana {semanaActualIndex + 1} de {bimestre.semanas.length}</Badge>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {bimestre.semanas.map((s) => (
          <SemanaCard key={s.id} semana={s} />
        ))}
      </div>
    </div>
  );
}

function SemanaCard({ semana }: { semana: SemanaDetalle }) {
  const tieneTextos =
    semana.contenido && (semana.contenido.titulo || semana.contenido.descripcion);
  const numArchivos = semana.materiales?.length ?? 0;
  // La semana es "expandible" si tiene texto, tarea, recursos URL o archivos
  const tieneAlgo =
    tieneTextos ||
    !!semana.contenido?.tarea ||
    !!semana.contenido?.recursos_url ||
    numArchivos > 0;
  const [abierto, setAbierto] = useState(semana.es_actual);

  return (
    <article
      className={`border rounded-sm transition-colors ${
        semana.es_actual
          ? 'border-trilce-primary bg-trilce-primary-soft/30'
          : tieneAlgo
          ? 'border-border bg-bg-card'
          : 'border-border bg-bg-muted/50'
      }`}
    >
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full text-left p-3 sm:p-4 flex items-center gap-3"
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          semana.es_actual
            ? 'bg-trilce-primary text-white'
            : tieneAlgo
            ? 'bg-trilce-primary-soft text-trilce-primary-dark'
            : 'bg-bg-muted text-text-muted'
        }`}>
          {semana.numero}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-text-primary">
              Semana {semana.numero}
            </span>
            {semana.es_actual && (
              <Badge variant="success" className="text-[9px] py-0 px-1.5">EN CURSO</Badge>
            )}
            {!tieneAlgo && (
              <span className="text-[10px] text-text-muted italic">Sin contenido aún</span>
            )}
            {numArchivos > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-trilce-primary font-semibold">
                <Icon name="FileText" size={10} />
                {numArchivos} archivo{numArchivos === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-muted">
            {fmtRango(semana.fecha_inicio, semana.fecha_fin)}
          </p>
          {tieneTextos && semana.contenido?.titulo && !abierto && (
            <p className="text-sm text-text-secondary mt-0.5 truncate font-medium flex items-center gap-1.5">
              <Icon name="BookOpen" size={13} className="text-trilce-primary flex-shrink-0" />
              {semana.contenido.titulo}
            </p>
          )}
        </div>
        {tieneAlgo && (
          <Icon
            name="ChevronDown"
            size={16}
            className={`text-text-muted flex-shrink-0 transition-transform ${abierto ? '' : '-rotate-90'}`}
          />
        )}
      </button>

      {tieneAlgo && abierto && (
        <div className="px-4 pb-4 pl-16 sm:pl-[68px] flex flex-col gap-3 border-t border-border/50 pt-3">
          {semana.contenido?.titulo && (
            <div>
              <h4 className="text-base font-bold text-text-primary">
                {semana.contenido.titulo}
              </h4>
            </div>
          )}
          {semana.contenido?.descripcion && (
            <div>
              <h5 className="text-[10px] font-bold tracking-widest text-text-muted mb-1">DESCRIPCIÓN</h5>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">
                {semana.contenido.descripcion}
              </p>
            </div>
          )}
          {semana.contenido?.recursos_url && (
            <div>
              <h5 className="text-[10px] font-bold tracking-widest text-text-muted mb-1">ENLACES</h5>
              <div className="flex flex-col gap-1">
                {semana.contenido.recursos_url.split('\n').filter(Boolean).map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-trilce-primary hover:underline flex items-center gap-1.5 break-all"
                  >
                    <Icon name="ArrowRight" size={13} className="flex-shrink-0" /> {url}
                  </a>
                ))}
              </div>
            </div>
          )}
          {numArchivos > 0 && (
            <div>
              <h5 className="text-[10px] font-bold tracking-widest text-text-muted mb-1.5">
                ARCHIVOS DEL DOCENTE ({numArchivos})
              </h5>
              <div className="flex flex-col gap-1.5">
                {semana.materiales.map((m) => (
                  <a
                    key={m.id}
                    href={m.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-trilce-primary-soft border border-trilce-primary-light rounded-sm hover:border-trilce-primary transition-colors group"
                  >
                    <Icon name="FileText" size={18} className="text-trilce-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate group-hover:text-trilce-primary">
                        {m.nombre}
                      </div>
                      <div className="text-[10px] text-text-muted">{m.tamano_legible}</div>
                    </div>
                    <Icon name="Download" size={14} className="text-trilce-primary flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {semana.contenido?.tarea && (
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-3">
              <h5 className="text-[10px] font-bold tracking-widest text-amber-700 mb-1 flex items-center gap-1.5">
                <Icon name="FileText" size={11} /> TAREA
              </h5>
              <p className="text-sm text-amber-900 whitespace-pre-wrap">{semana.contenido.tarea}</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ──────────────────────── helpers ──────────────────────── */

function fmtRango(inicio: string, fin: string): string {
  const fmt = (d: string) => {
    const [, m, day] = d.split('-');
    return `${day}/${m}`;
  };
  return `${fmt(inicio)} – ${fmt(fin)}`;
}

function InfoChip({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon name={icon} size={14} className="opacity-90 flex-shrink-0" />
      {children}
    </span>
  );
}
