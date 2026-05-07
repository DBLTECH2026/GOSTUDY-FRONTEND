'use client';

import { useReporteMatriculasPorSeccion } from '@/modules/reportes/api';
import { Badge } from '@/shared/components/Badge';
import type { SeccionRow } from '@/modules/reportes/types';

export default function ReporteMatriculasPorSeccionPage() {
  const { data: secciones, isLoading } = useReporteMatriculasPorSeccion();
  if (isLoading) return <p className="text-text-secondary">Cargando…</p>;

  const totalCupos = secciones.reduce((s, c) => s + c.capacidad, 0);
  const totalMatr = secciones.reduce((s, c) => s + c.matriculados, 0);
  const cobertura = totalCupos === 0 ? 0 : Math.round((totalMatr / totalCupos) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* Resumen oscuro */}
      <section className="bg-trilce-accent text-white rounded-lg px-5 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">{secciones.length} secciones activas</h2>
          <p className="text-xs text-white/60">{totalMatr} matriculados de {totalCupos} cupos disponibles</p>
        </div>
        <span className="text-3xl sm:text-4xl font-bold text-trilce-primary">{cobertura}%</span>
      </section>

      {/* Grid de secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {secciones.map((s) => <SeccionCard key={s.seccion_id} seccion={s} />)}
      </div>
    </div>
  );
}

function SeccionCard({ seccion }: { seccion: SeccionRow }) {
  const tono =
    seccion.ocupacion_porcentaje >= 100 ? 'danger'
    : seccion.ocupacion_porcentaje >= 80 ? 'success'
    : seccion.ocupacion_porcentaje >= 50 ? 'success'
    : 'warning';

  const borderCls =
    tono === 'danger'  ? 'border-danger border-2'
    : tono === 'warning' ? 'border-warning border-2'
    : 'border-border';
  const fillCls =
    tono === 'danger'  ? 'bg-danger'
    : tono === 'success' ? 'bg-success'
    : 'bg-warning';

  const badge = seccion.ocupacion_porcentaje >= 100 ? 'LLENA'
    : seccion.ocupacion_porcentaje < 50 ? 'BAJA'
    : 'DISPONIBLE';

  return (
    <div className={`bg-bg-card rounded-md p-5 flex flex-col gap-2.5 ${borderCls}`}>
      <header className="flex items-center justify-between">
        <h3 className="text-base font-bold">{seccion.grado} {seccion.nivel} — {seccion.seccion}</h3>
        <Badge variant={tono === 'danger' ? 'danger' : tono === 'warning' ? 'warning' : 'success'}>{badge}</Badge>
      </header>
      <div className="text-2xl font-bold text-text-primary">{seccion.matriculados} / {seccion.capacidad} matriculados</div>
      <div className="w-full h-2 bg-bg-muted rounded-sm overflow-hidden">
        <div className={`h-full ${fillCls}`} style={{ width: `${Math.min(100, seccion.ocupacion_porcentaje)}%` }} />
      </div>
      <span className="text-[11px] text-text-secondary">Tutor: a definir</span>
    </div>
  );
}
