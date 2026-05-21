'use client';

import { useReporteInscripciones } from '@/modules/reportes/api';
import { Button } from '@/shared/components/Button';
import { BarChartReport } from '@/shared/components/charts/BarChartReport';
import { PieChartReport } from '@/shared/components/charts/PieChartReport';
import { Icon } from '@/shared/components/Icon';
import { KpiCard } from '@/shared/components/KpiCard';
import { shortMes } from '@/shared/lib/format';

export default function ReporteInscripcionesPage() {
  const { data, isLoading } = useReporteInscripciones();

  if (isLoading) return <p className="text-text-secondary">Cargando reporte…</p>;

  const total = data
    ? Object.values(data.totales_por_estado).reduce((s, n) => s + n, 0)
    : 0;

  if (!data || total === 0) {
    return <EmptyReport title="Reporte de inscripciones" />;
  }

  const barData = data.por_mes.map((m) => ({
    label: shortMes(m.mes),
    value: Number(m.total),
  }));

  const pieData = data.por_nivel.map((n) => ({
    label: n.nivel,
    value: Number(n.total),
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* Filter row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-card rounded-md border border-border self-start">
          <Icon name="Calendar" size={16} className="text-text-secondary" />
          <span className="text-[13px] font-semibold text-text-primary">Periodo activo</span>
        </div>
        <Button variant="primary" className="self-start sm:self-auto">
          <Icon name="Download" size={16} /> Exportar Excel
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="TOTAL" value={total} />
        <KpiCard label="APROBADAS" value={data.totales_por_estado.aprobada ?? 0} emphasize emphasizeColor="success" />
        <KpiCard label="PENDIENTES" value={data.totales_por_estado.pendiente ?? 0} emphasize emphasizeColor="warning" />
        <KpiCard label="RECHAZADAS" value={data.totales_por_estado.rechazada ?? 0} emphasize emphasizeColor="danger" />
      </div>

      {/* Bar chart por mes */}
      {barData.length > 0 && (
        <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6">
          <header className="flex items-center gap-2.5 mb-4">
            <Icon name="ChartBar" size={18} className="text-trilce-primary" />
            <h2 className="text-base font-bold">Inscripciones por mes</h2>
          </header>
          <BarChartReport data={barData} unidad="inscripciones" />
        </div>
      )}

      {/* Distribución por nivel — pie */}
      {pieData.length > 0 && (
        <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6">
          <header className="flex items-center gap-2.5 mb-4">
            <Icon name="ChartPie" size={18} className="text-trilce-primary" />
            <h2 className="text-base font-bold">Distribución por nivel</h2>
          </header>
          <PieChartReport data={pieData} unidad="inscripciones" />
        </div>
      )}
    </div>
  );
}

function EmptyReport({ title }: { title: string }) {
  return (
    <div className="bg-bg-card border border-border rounded-md p-10 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-trilce-primary-soft flex items-center justify-center mb-4">
        <Icon name="ChartBar" size={28} className="text-trilce-primary" />
      </div>
      <h2 className="text-lg font-bold mb-1">{title}</h2>
      <p className="text-sm text-text-secondary max-w-md mx-auto">
        Aún no hay datos suficientes para generar este reporte. A medida que se registren
        inscripciones y matrículas, los indicadores se actualizarán automáticamente.
      </p>
    </div>
  );
}
