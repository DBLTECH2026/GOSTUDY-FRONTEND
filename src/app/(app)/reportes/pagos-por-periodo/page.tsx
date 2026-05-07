'use client';

import { useReportePagos } from '@/modules/reportes/api';
import { Icon } from '@/shared/components/Icon';
import { KpiCard } from '@/shared/components/KpiCard';

export default function ReportePagosPorPeriodoPage() {
  const { data, isLoading } = useReportePagos();
  if (isLoading || !data) return <p className="text-text-secondary">Cargando…</p>;

  const { totales, recaudacion_por_mes } = data;
  const cobranza = totales.facturado === 0 ? 0 : Math.round((totales.pagado / totales.facturado) * 100);
  const maxMes = Math.max(...recaudacion_por_mes.map((m) => m.total));

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="flex gap-4">
        <KpiCard label="RECAUDADO" value={`S/ ${totales.pagado.toLocaleString('es-PE')}`} emphasize emphasizeColor="success" />
        <KpiCard label="POR COBRAR" value={`S/ ${totales.pendiente.toLocaleString('es-PE')}`} emphasize emphasizeColor="warning" />
        <KpiCard label="% COBRANZA" value={`${cobranza}%`} emphasize emphasizeColor="primary" />
        <KpiCard label="MOROSOS" value="23 alumnos" emphasize emphasizeColor="danger" />
      </div>

      {/* Bar chart por mes */}
      <div className="bg-bg-card border border-border rounded-md p-6">
        <header className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Icon name="ChartBar" size={18} className="text-trilce-primary" />
            <h2 className="text-base font-bold">Recaudación por mes</h2>
          </div>
          <span className="text-xs font-semibold text-success">
            Total: S/ {totales.pagado.toLocaleString('es-PE')}
          </span>
        </header>
        <div className="flex items-end justify-around h-44">
          {recaudacion_por_mes.map((m) => {
            const heightPct = (m.total / maxMes) * 100;
            const isMax = m.total === maxMes;
            return (
              <div key={m.mes} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-14 rounded-sm ${isMax ? 'bg-success' : heightPct > 50 ? 'bg-trilce-primary' : 'bg-trilce-primary-soft'}`}
                  style={{ height: `${Math.max(20, heightPct)}%` }}
                />
                <span className="text-[11px] text-text-secondary">
                  {shortMes(m.mes)} (S/ {(m.total / 1000).toFixed(0)}k)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top alumnos con mora — placeholder */}
      <div className="bg-bg-card border border-border rounded-md p-6">
        <header className="flex items-center gap-2.5 mb-3">
          <Icon name="TriangleAlert" size={18} className="text-danger" />
          <h2 className="text-base font-bold">Top alumnos con mora</h2>
        </header>
        <p className="text-xs text-text-secondary">
          (Datos reales cuando Persona A merge: lista de los estudiantes con mayor saldo vencido.)
        </p>
      </div>
    </div>
  );
}

function shortMes(iso: string) {
  const [, m] = iso.split('-');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return meses[Number(m) - 1] ?? iso;
}
