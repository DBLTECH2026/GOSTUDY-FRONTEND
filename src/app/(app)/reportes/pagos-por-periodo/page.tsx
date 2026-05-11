'use client';

import { useReportePagos } from '@/modules/reportes/api';
import { Icon } from '@/shared/components/Icon';
import { KpiCard } from '@/shared/components/KpiCard';
import { fmtSoles, shortMes } from '@/shared/lib/format';

export default function ReportePagosPorPeriodoPage() {
  const { data, isLoading } = useReportePagos();

  if (isLoading) return <p className="text-text-secondary">Cargando…</p>;

  if (!data || (data.totales.facturado === 0 && data.totales.pagado === 0)) {
    return (
      <div className="bg-bg-card border border-border rounded-md p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-trilce-primary-soft flex items-center justify-center mb-4">
          <Icon name="CreditCard" size={28} className="text-trilce-primary" />
        </div>
        <h2 className="text-lg font-bold mb-1">Sin pagos registrados</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Aún no se han generado pagos en este periodo. Al aprobar matrículas se
          crearán automáticamente y este reporte se actualizará.
        </p>
      </div>
    );
  }

  const { totales, recaudacion_por_mes, por_concepto } = data;
  const cobranza =
    totales.facturado === 0 ? 0 : Math.round((totales.pagado / totales.facturado) * 100);
  const maxMes = Math.max(1, ...recaudacion_por_mes.map((m) => Number(m.total)));

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="RECAUDADO" value={fmtSoles(totales.pagado)} emphasize emphasizeColor="success" />
        <KpiCard label="POR COBRAR" value={fmtSoles(totales.pendiente)} emphasize emphasizeColor="warning" />
        <KpiCard label="VENCIDO" value={fmtSoles(totales.vencido)} emphasize emphasizeColor="danger" />
        <KpiCard label="% COBRANZA" value={`${cobranza}%`} emphasize emphasizeColor="primary" />
      </div>

      {/* Bar chart por mes */}
      {recaudacion_por_mes.length > 0 && (
        <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div className="flex items-center gap-2.5">
              <Icon name="ChartBar" size={18} className="text-trilce-primary" />
              <h2 className="text-base font-bold">Recaudación por mes</h2>
            </div>
            <span className="text-xs font-semibold text-success">
              Total: {fmtSoles(totales.pagado)}
            </span>
          </header>
          <div className="flex items-end justify-around h-44">
            {recaudacion_por_mes.map((m) => {
              const total = Number(m.total);
              const heightPct = (total / maxMes) * 100;
              const isMax = total === maxMes;
              return (
                <div key={m.mes} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 sm:w-14 rounded-sm ${
                      isMax ? 'bg-success' : heightPct > 50 ? 'bg-trilce-primary' : 'bg-trilce-primary-soft'
                    }`}
                    style={{ height: `${Math.max(20, heightPct)}%` }}
                  />
                  <span className="text-[10px] sm:text-[11px] text-text-secondary text-center">
                    {shortMes(m.mes)} (S/ {(total / 1000).toFixed(1)}k)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Por concepto */}
      {por_concepto.length > 0 && (
        <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6">
          <header className="flex items-center gap-2.5 mb-3">
            <Icon name="ChartPie" size={18} className="text-trilce-primary" />
            <h2 className="text-base font-bold">Por concepto</h2>
          </header>
          <div className="flex flex-col gap-2">
            {por_concepto.map((c) => (
              <div
                key={c.concepto}
                className="flex items-center justify-between bg-bg-muted px-3 sm:px-4 py-3 rounded-sm gap-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold capitalize">{c.concepto}</span>
                  <span className="text-[11px] text-text-muted">{c.cantidad} registros</span>
                </div>
                <span className="text-sm font-bold text-trilce-primary">
                  {fmtSoles(Number(c.total))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
