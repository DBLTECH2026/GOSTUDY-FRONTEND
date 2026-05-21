'use client';

import { useReportePagos } from '@/modules/reportes/api';
import { BarChartReport } from '@/shared/components/charts/BarChartReport';
import { PieChartReport } from '@/shared/components/charts/PieChartReport';
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

  const barData = recaudacion_por_mes.map((m) => ({
    label: shortMes(m.mes),
    value: Number(m.total),
    caption: fmtSoles(Number(m.total)),
  }));

  const pieData = por_concepto.map((c) => ({
    label: c.concepto.charAt(0).toUpperCase() + c.concepto.slice(1),
    value: Number(c.total),
  }));

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
      {barData.length > 0 && (
        <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <Icon name="ChartBar" size={18} className="text-trilce-primary" />
              <h2 className="text-base font-bold">Recaudación por mes</h2>
            </div>
            <span className="text-xs font-semibold text-success">
              Total: {fmtSoles(totales.pagado)}
            </span>
          </header>
          <BarChartReport data={barData} formatValue={fmtSoles} unidad="recaudados" />
        </div>
      )}

      {/* Por concepto — pie */}
      {pieData.length > 0 && (
        <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6">
          <header className="flex items-center gap-2.5 mb-4">
            <Icon name="ChartPie" size={18} className="text-trilce-primary" />
            <h2 className="text-base font-bold">Distribución por concepto</h2>
          </header>
          <PieChartReport data={pieData} formatValue={fmtSoles} />
        </div>
      )}
    </div>
  );
}
