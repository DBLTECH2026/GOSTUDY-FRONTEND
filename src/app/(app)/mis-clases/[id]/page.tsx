'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  useDetalleClaseDocente,
  type BimestreDocente,
  type SemanaDocente,
} from '@/modules/academico/api';
import { EditarSemanaModal } from '@/modules/academico/components/EditarSemanaModal';
import { Badge } from '@/shared/components/Badge';
import { Icon, type IconName } from '@/shared/components/Icon';

export default function ClaseDetalleDocentePage() {
  const params = useParams<{ id: string }>();
  const seccionCursoId = params?.id ? Number(params.id) : null;

  const { data, isLoading, error, reload } = useDetalleClaseDocente(seccionCursoId);

  const [bimestreActivo, setBimestreActivo] = useState<number | null>(null);
  const [semanaEditando, setSemanaEditando] = useState<SemanaDocente | null>(null);

  const bimestreInicial = useMemo(() => {
    if (!data) return null;
    const actual = data.bimestres.find((b) => b.es_actual);
    return actual?.id ?? data.bimestres[0]?.id ?? null;
  }, [data]);

  useEffect(() => {
    if (bimestreInicial !== null && bimestreActivo === null) {
      setBimestreActivo(bimestreInicial);
    }
  }, [bimestreInicial, bimestreActivo]);

  // Solo bloqueamos la UI con "Cargando" cuando NO hay datos aún.
  // En recargas posteriores (después de subir un archivo, p.ej.), mantenemos
  // la UI visible para que el modal abierto NO se desmonte.
  if (isLoading && !data) return <p className="text-text-secondary p-4">Cargando…</p>;

  if (error || !data) {
    return (
      <div className="bg-bg-card border border-border rounded-md p-10 text-center">
        <Icon name="TriangleAlert" size={28} className="text-amber-600 mx-auto mb-3" />
        <p className="font-semibold text-text-primary">No se pudo cargar la clase</p>
        <p className="text-sm text-text-secondary mt-1">{error ?? 'Verifica que esta clase te pertenezca.'}</p>
        <Link href="/mis-clases" className="inline-block mt-4 text-trilce-primary font-semibold hover:underline">
          ← Volver a mis clases
        </Link>
      </div>
    );
  }

  const { clase, bimestres } = data;
  const bimestreSel = bimestres.find((b) => b.id === bimestreActivo) ?? bimestres[0];

  const totalSemanas = bimestres.reduce((s, b) => s + b.semanas.length, 0);
  const semanasConContenido = bimestres.reduce(
    (s, b) => s + b.semanas.filter((sm) => sm.contenido !== null).length,
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/mis-clases"
        className="text-xs text-text-secondary hover:text-trilce-primary font-semibold flex items-center gap-1 self-start"
      >
        ← Volver a mis clases
      </Link>

      {/* Header */}
      <section className="bg-trilce-primary text-white rounded-lg p-5 sm:p-7">
        <p className="text-xs font-bold tracking-widest text-white/70 mb-1">
          CLASE · {clase.codigo}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold">{clase.curso}</h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-white/85">
          <InfoChip icon="GraduationCap">{clase.label}</InfoChip>
          <InfoChip icon="Calendar">{clase.periodo}</InfoChip>
          <InfoChip icon="Users">{clase.estudiantes} alumno{clase.estudiantes === 1 ? '' : 's'}</InfoChip>
          <InfoChip icon="Clock">{clase.horas_semana}h por semana</InfoChip>
        </div>
      </section>

      {/* Progreso de planificación */}
      <section className="bg-bg-card border border-border rounded-md p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Progreso de planificación</h3>
            <p className="text-xs text-text-secondary">
              Has llenado contenido en {semanasConContenido} de {totalSemanas} semanas
            </p>
          </div>
          <span className="text-2xl font-bold text-trilce-primary">
            {totalSemanas === 0 ? 0 : Math.round((semanasConContenido / totalSemanas) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-bg-muted rounded-sm overflow-hidden">
          <div
            className="h-full bg-trilce-primary transition-all"
            style={{
              width: totalSemanas === 0 ? '0%' : `${(semanasConContenido / totalSemanas) * 100}%`,
            }}
          />
        </div>
      </section>

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
                {b.es_actual && <Badge variant="success" className="text-[9px] py-0 px-1.5">ACTUAL</Badge>}
              </div>
            </button>
          ))}
        </div>

        {bimestreSel && (
          <BimestrePanel
            bimestre={bimestreSel}
            onEditar={setSemanaEditando}
          />
        )}
      </section>

      <EditarSemanaModal
        open={semanaEditando !== null}
        semana={semanaEditando}
        seccionCursoId={clase.seccion_curso_id}
        onClose={() => setSemanaEditando(null)}
        onSaved={reload}
      />
    </div>
  );
}

function BimestrePanel({
  bimestre, onEditar,
}: {
  bimestre: BimestreDocente;
  onEditar: (s: SemanaDocente) => void;
}) {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold">{bimestre.nombre}</h3>
        <span className="text-xs text-text-muted">{bimestre.semanas.length} semanas</span>
      </div>

      <div className="flex flex-col gap-2">
        {bimestre.semanas.map((s) => (
          <SemanaCardDocente key={s.id} semana={s} onEditar={() => onEditar(s)} />
        ))}
      </div>
    </div>
  );
}

function SemanaCardDocente({ semana, onEditar }: { semana: SemanaDocente; onEditar: () => void }) {
  const tieneContenido =
    semana.contenido && (semana.contenido.titulo || semana.contenido.descripcion);
  const numArchivos = semana.materiales?.length ?? 0;

  return (
    <article
      className={`border rounded-sm p-3 sm:p-4 flex items-center gap-3 ${
        semana.es_actual
          ? 'border-trilce-primary bg-trilce-primary-soft/30'
          : 'border-border bg-bg-card'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
        semana.es_actual
          ? 'bg-trilce-primary text-white'
          : tieneContenido
          ? 'bg-trilce-primary-soft text-trilce-primary-dark'
          : 'bg-bg-muted text-text-muted'
      }`}>
        {semana.numero}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-text-primary">Semana {semana.numero}</span>
          {semana.es_actual && (
            <Badge variant="success" className="text-[9px] py-0 px-1.5">EN CURSO</Badge>
          )}
          {tieneContenido ? (
            <Badge variant="info" className="text-[9px] py-0 px-1.5">PLANIFICADA</Badge>
          ) : (
            <Badge variant="neutral" className="text-[9px] py-0 px-1.5">SIN CONTENIDO</Badge>
          )}
          {numArchivos > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
              <Icon name="FileText" size={10} />
              {numArchivos} archivo{numArchivos === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <p className="text-[11px] text-text-muted">
          {fmtRango(semana.fecha_inicio, semana.fecha_fin)}
        </p>
        {tieneContenido && semana.contenido?.titulo && (
          <p className="text-sm text-text-secondary mt-0.5 truncate font-medium flex items-center gap-1.5">
            <Icon name="BookOpen" size={13} className="text-trilce-primary flex-shrink-0" />
            {semana.contenido.titulo}
          </p>
        )}
      </div>
      <button
        onClick={onEditar}
        className="text-trilce-primary hover:bg-trilce-primary-soft p-2 rounded-sm flex items-center gap-1.5 text-sm font-semibold flex-shrink-0"
        title={tieneContenido ? 'Editar contenido' : 'Agregar contenido'}
      >
        <Icon name={tieneContenido ? 'Pencil' : 'Plus'} size={14} />
        <span className="hidden sm:inline">{tieneContenido ? 'Editar' : 'Planificar'}</span>
      </button>
    </article>
  );
}

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
