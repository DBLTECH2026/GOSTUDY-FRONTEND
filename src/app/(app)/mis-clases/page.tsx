'use client';

import Link from 'next/link';
import { useMisClasesDocente } from '@/modules/academico/api';
import { Badge } from '@/shared/components/Badge';
import { Icon } from '@/shared/components/Icon';

export default function MisClasesPage() {
  const { data: clases, isLoading } = useMisClasesDocente();

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold">Mis clases</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Cursos que dictas este periodo · {clases.length} {clases.length === 1 ? 'clase' : 'clases'}
        </p>
      </header>

      {isLoading ? (
        <p className="text-text-muted text-sm p-8 text-center">Cargando…</p>
      ) : clases.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-md p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-bg-muted flex items-center justify-center mb-3">
            <Icon name="GraduationCap" size={24} className="text-text-muted" />
          </div>
          <p className="font-semibold text-text-primary">Aún no tienes clases asignadas</p>
          <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
            Cuando el administrador te asigne cursos en una sección, aparecerán aquí.
            Avísale a coordinación si crees que falta una asignación.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clases.map((c) => (
            <Link
              key={c.seccion_curso_id}
              href={`/mis-clases/${c.seccion_curso_id}`}
              className="group bg-bg-card border border-border rounded-md p-5 flex flex-col gap-3 hover:border-trilce-primary hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-md bg-trilce-primary-soft flex items-center justify-center flex-shrink-0">
                  <Icon name="BookOpen" size={22} className="text-trilce-primary" />
                </div>
                <Badge variant="info">{c.estudiantes} alumno{c.estudiantes === 1 ? '' : 's'}</Badge>
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary group-hover:text-trilce-primary transition-colors">
                  {c.curso}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">{c.codigo}</p>
              </div>
              <div className="flex flex-col gap-1 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Icon name="GraduationCap" size={12} className="text-text-muted" />
                  {c.label}
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="Calendar" size={12} className="text-text-muted" />
                  {c.periodo} · {c.horas_semana}h/sem
                </div>
              </div>
              <div className="text-xs text-trilce-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity mt-auto flex items-center gap-1">
                Planificar contenido <Icon name="ArrowRight" size={12} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
