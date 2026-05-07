'use client';

import { useMisCursos, useMiMatricula } from '@/modules/portal/api';
import { Badge } from '@/shared/components/Badge';
import { Icon, IconName } from '@/shared/components/Icon';
import type { CursoEnPortal } from '@/modules/portal/types';

const ICON_BY_CODE: Record<string, IconName> = {
  MAT: 'Calculator',
  COM: 'BookOpen',
  CYA: 'Leaf',
  PSC: 'Globe',
  ING: 'Languages',
  REL: 'Church',
  EDF: 'Dumbbell',
  ART: 'Palette',
};

function iconForCurso(curso: CursoEnPortal): IconName {
  const prefix = curso.codigo.split('-')[0];
  return ICON_BY_CODE[prefix] ?? 'BookOpen';
}

export default function MisCursosPage() {
  const { data: cursos, isLoading } = useMisCursos();
  const { data: matricula } = useMiMatricula();

  if (isLoading) return <p className="text-text-secondary">Cargando cursos…</p>;

  const totalHoras = cursos.reduce((s, c) => s + c.horas_semana, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <div className="bg-trilce-primary text-text-on-primary rounded-lg p-5 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <Badge variant="primary" className="!bg-trilce-primary-dark self-start">
            {matricula ? `${matricula.grado.toUpperCase()} ${matricula.nivel.toUpperCase()} — ${matricula.seccion}` : '—'}
          </Badge>
          <h2 className="text-xl sm:text-2xl font-bold">Tu plan de estudios este periodo</h2>
          <p className="text-xs sm:text-sm text-trilce-primary-light">
            Tutor: Prof. {matricula?.tutor_nombres} {matricula?.tutor_apellidos} — {matricula?.periodo_descripcion}
          </p>
        </div>
        <div className="text-left md:text-right flex-shrink-0">
          <div className="text-3xl sm:text-4xl font-bold">{cursos.length} cursos</div>
          <div className="text-xs sm:text-sm text-trilce-primary-light">{totalHoras} horas / semana</div>
        </div>
      </div>

      {/* Grid de cursos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {cursos.map((c) => (
          <article
            key={c.id}
            className="bg-bg-card border border-border rounded-md p-5 flex flex-col gap-2.5"
          >
            <div className="w-11 h-11 rounded-md bg-trilce-primary-soft flex items-center justify-center">
              <Icon name={iconForCurso(c)} size={22} className="text-trilce-primary" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">{c.nombre}</h3>
            <p className="text-[11px] text-text-muted">
              {c.codigo} · {c.horas_semana} hrs/sem
            </p>
            <p className="text-[11px] text-text-secondary">
              Prof. {c.docente_nombres ?? ''} {c.docente_apellidos ?? ''}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
