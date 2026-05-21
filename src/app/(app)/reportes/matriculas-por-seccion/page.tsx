'use client';

import { useReporteMatriculasPorSeccion } from '@/modules/reportes/api';
import { Badge } from '@/shared/components/Badge';
import { BarChartReport } from '@/shared/components/charts/BarChartReport';
import { Icon } from '@/shared/components/Icon';
import type { SeccionRow } from '@/modules/reportes/types';

export default function ReporteMatriculasPorSeccionPage() {
  const { data: secciones, isLoading } = useReporteMatriculasPorSeccion();

  if (isLoading) return <p className="text-text-secondary">Cargando…</p>;

  if (!secciones || secciones.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-md p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-trilce-primary-soft flex items-center justify-center mb-4">
          <Icon name="GraduationCap" size={28} className="text-trilce-primary" />
        </div>
        <h2 className="text-lg font-bold mb-1">Sin secciones registradas</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Crea secciones en los catálogos para ver la ocupación. Cada sección se reporta
          con su porcentaje de cupos utilizados.
        </p>
      </div>
    );
  }

  const totalCupos = secciones.reduce((s, c) => s + Number(c.capacidad), 0);
  const totalMatr = secciones.reduce((s, c) => s + Number(c.matriculados), 0);
  const cobertura = totalCupos === 0 ? 0 : Math.round((totalMatr / totalCupos) * 100);

  const ocupacionData = secciones.map((s) => ({
    label: `${s.grado.split(' ')[0]} ${s.seccion}`,
    value: Number(s.ocupacion_porcentaje),
    caption: `${s.matriculados}/${s.capacidad} matriculados`,
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* Resumen oscuro */}
      <section className="bg-trilce-accent text-white rounded-lg px-5 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">{secciones.length} secciones activas</h2>
          <p className="text-xs text-white/60">
            {totalMatr} matriculados de {totalCupos} cupos disponibles
          </p>
        </div>
        <span className="text-3xl sm:text-4xl font-bold text-trilce-primary">{cobertura}%</span>
      </section>

      {/* Bar chart de ocupación por sección */}
      <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6">
        <header className="flex items-center gap-2.5 mb-4">
          <Icon name="ChartBar" size={18} className="text-trilce-primary" />
          <h2 className="text-base font-bold">Ocupación por sección (%)</h2>
        </header>
        <BarChartReport
          data={ocupacionData}
          unidad="% ocupación"
          formatValue={(v) => `${v.toFixed(1)}%`}
          highlightMax={false}
        />
      </div>

      {/* Grid de secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {secciones.map((s) => (
          <SeccionCard key={s.seccion_id} seccion={s} />
        ))}
      </div>
    </div>
  );
}

function SeccionCard({ seccion }: { seccion: SeccionRow }) {
  const ocupacion = Number(seccion.ocupacion_porcentaje);
  const matr = Number(seccion.matriculados);
  const cap = Number(seccion.capacidad);

  const tono =
    ocupacion >= 100 ? 'danger'
    : ocupacion >= 50 ? 'success'
    : 'warning';

  const borderCls =
    tono === 'danger' ? 'border-danger border-2'
    : tono === 'warning' ? 'border-warning border-2'
    : 'border-border';

  const fillCls =
    tono === 'danger' ? 'bg-danger'
    : tono === 'success' ? 'bg-success'
    : 'bg-warning';

  const badge =
    ocupacion >= 100 ? 'LLENA'
    : ocupacion < 50 ? 'BAJA'
    : 'DISPONIBLE';

  return (
    <div className={`bg-bg-card rounded-md p-5 flex flex-col gap-2.5 ${borderCls}`}>
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold">
          {seccion.grado} {seccion.nivel} — {seccion.seccion}
        </h3>
        <Badge variant={tono === 'danger' ? 'danger' : tono === 'warning' ? 'warning' : 'success'}>
          {badge}
        </Badge>
      </header>
      <div className="text-2xl font-bold text-text-primary">
        {matr} / {cap} matriculados
      </div>
      <div className="w-full h-2 bg-bg-muted rounded-sm overflow-hidden">
        <div className={`h-full ${fillCls}`} style={{ width: `${Math.min(100, ocupacion)}%` }} />
      </div>
      <span className="text-[11px] text-text-secondary">{ocupacion.toFixed(1)}% ocupación</span>
    </div>
  );
}
