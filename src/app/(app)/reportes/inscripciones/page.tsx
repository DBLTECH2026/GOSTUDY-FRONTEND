'use client';

import { useReporteInscripciones } from '@/modules/reportes/api';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { KpiCard } from '@/shared/components/KpiCard';

export default function ReporteInscripcionesPage() {
  const { data, isLoading } = useReporteInscripciones();
  if (isLoading || !data) return <p className="text-text-secondary">Cargando reporte…</p>;

  const total = Object.values(data.totales_por_estado).reduce((s, n) => s + n, 0);
  const maxMes = Math.max(...data.por_mes.map((m) => m.total));
  const maxNivel = Math.max(...data.por_nivel.map((n) => n.total));

  return (
    <div className="flex flex-col gap-5">
      {/* Filter row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-card rounded-md border border-border">
          <Icon name="Calendar" size={16} className="text-text-secondary" />
          <span className="text-[13px] font-semibold text-text-primary">Periodo 2026-I</span>
          <Icon name="ChevronDown" size={16} className="text-text-muted" />
        </div>
        <Button variant="primary">
          <Icon name="Download" size={16} /> Exportar Excel
        </Button>
      </div>

      {/* KPIs */}
      <div className="flex gap-4">
        <KpiCard label="TOTAL INSCRIPCIONES" value={total} />
        <KpiCard label="APROBADAS" value={data.totales_por_estado.aprobada ?? 0} emphasize emphasizeColor="success" />
        <KpiCard label="PENDIENTES" value={data.totales_por_estado.pendiente ?? 0} emphasize emphasizeColor="warning" />
        <KpiCard label="RECHAZADAS" value={data.totales_por_estado.rechazada ?? 0} emphasize emphasizeColor="danger" />
      </div>

      {/* Bar chart */}
      <div className="bg-bg-card border border-border rounded-md p-6">
        <header className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Icon name="ChartBar" size={18} className="text-trilce-primary" />
            <h2 className="text-base font-bold">Inscripciones por mes</h2>
          </div>
          <span className="text-xs font-semibold text-success">+12% vs periodo anterior</span>
        </header>
        <div className="flex items-end justify-around h-44">
          {data.por_mes.map((m) => {
            const heightPct = (m.total / maxMes) * 100;
            return (
              <div key={m.mes} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-14 rounded-sm bg-trilce-primary"
                  style={{ height: `${Math.max(20, heightPct)}%` }}
                />
                <span className="text-[11px] text-text-secondary">{shortMes(m.mes)} ({m.total})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribución por nivel */}
      <div className="bg-bg-card border border-border rounded-md p-6">
        <header className="flex items-center gap-2.5 mb-3">
          <Icon name="ChartPie" size={18} className="text-trilce-primary" />
          <h2 className="text-base font-bold">Distribución por nivel</h2>
        </header>
        <div className="flex flex-col gap-2">
          {data.por_nivel.map((n) => (
            <div key={n.nivel} className="flex items-center justify-between bg-bg-muted px-4 py-3 rounded-sm">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-trilce-primary" />
                <span className="text-sm font-semibold">{n.nivel} · {n.total} inscripciones</span>
              </div>
              <span className="text-sm font-bold text-trilce-primary">
                {Math.round((n.total / maxNivel) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function shortMes(iso: string) {
  // iso like '2026-03'
  const [, m] = iso.split('-');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return meses[Number(m) - 1] ?? iso;
}
