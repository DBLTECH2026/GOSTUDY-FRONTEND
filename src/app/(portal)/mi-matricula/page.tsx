'use client';

import { useMiMatricula } from '@/modules/portal/api';
import { Icon } from '@/shared/components/Icon';

export default function MiMatriculaPage() {
  const { data: matricula, isLoading } = useMiMatricula();

  if (isLoading) return <p className="text-text-secondary">Cargando matrícula…</p>;

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
      <div className="bg-trilce-primary text-text-on-primary rounded-lg p-5 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold">
          {matricula.grado} {matricula.nivel} — {matricula.seccion}
        </h2>
        <p className="text-xs sm:text-sm text-trilce-primary-light mt-1">
          {matricula.periodo_descripcion}
        </p>
      </div>
    </div>
  );
}
