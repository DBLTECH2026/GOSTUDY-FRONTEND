'use client';

import { use } from 'react';
import { useEstadoCuenta } from '@/modules/pagos/api';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { fmtFecha, fmtSoles } from '@/shared/lib/format';

export default function EstadoCuentaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 16: params es Promise (síncronos eliminados).
  const { id } = use(params);
  const { data, isLoading } = useEstadoCuenta(Number(id));

  if (isLoading || !data) return <p className="text-text-secondary">Cargando estado de cuenta…</p>;
  const { estudiante, totales, pagos } = data;

  const proximoPendiente = pagos.find((p) => p.estado === 'pendiente');

  return (
    <div className="flex flex-col gap-5">
      {/* Header oscuro */}
      <section className="bg-trilce-accent text-white rounded-lg px-5 sm:px-10 py-5 sm:py-7 flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-trilce-primary flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
              {estudiante.nombres[0]}{estudiante.apellidos[0]}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">{estudiante.nombres} {estudiante.apellidos}</h1>
              <p className="text-xs sm:text-sm text-white/60 truncate">DNI {estudiante.dni} · Código {estudiante.codigo_estudiante}</p>
            </div>
          </div>
          <Button variant="on-dark" className="self-start md:self-auto">
            <Icon name="FileText" size={14} /> Generar PDF
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-3 sm:pt-2 border-t border-white/10">
          <Stat value={fmtSoles(totales.pagado)} label="PAGADO" tone="success" />
          <Stat value={fmtSoles(totales.pendiente)} label="PENDIENTE" tone="warning" />
          <Stat value={fmtSoles(totales.vencido)} label="VENCIDO" tone="danger" />
          <Stat value={`${totales.cobranza_porcentaje}%`} label="COBRANZA" tone="primary" />
        </div>
      </section>

      {/* Detalle de pagos */}
      <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <Icon name="List" className="text-trilce-primary" />
            <h2 className="text-base font-bold">Detalle de pagos del periodo</h2>
          </div>
          <span className="text-xs text-text-muted">
            {pagos.length} pagos · {pagos.filter(p => p.estado === 'pagado').length} pagados · {pagos.filter(p => p.estado === 'pendiente').length} pendientes
          </span>
        </header>

        <div className="flex flex-col gap-2">
          {pagos.map((p) => {
            const isProximo = p.id === proximoPendiente?.id;
            return (
              <div
                key={p.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-4 py-3 rounded-sm ${
                  isProximo ? 'bg-trilce-primary-soft border border-trilce-primary' : 'bg-bg-muted'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-text-primary">{p.descripcion}</span>
                  <span className={`text-[11px] ${isProximo ? 'text-trilce-primary-dark font-semibold' : 'text-text-secondary'}`}>
                    {p.estado === 'pagado'
                      ? `Pagado el ${fmtFecha(p.fecha_pago!)} · ${p.metodo}`
                      : isProximo
                      ? 'Vence en 5 días · ' + fmtFecha(p.fecha_vencimiento)
                      : 'Vence el ' + fmtFecha(p.fecha_vencimiento)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-text-primary">S/ {p.monto.toFixed(2)}</span>
                  {p.estado === 'pagado' && <Badge variant="success">Pagado</Badge>}
                  {isProximo && (
                    <button className="bg-trilce-primary text-text-on-primary px-3 py-1.5 rounded-sm text-xs font-semibold">
                      Registrar pago
                    </button>
                  )}
                  {p.estado === 'pendiente' && !isProximo && <Badge variant="neutral">Pendiente</Badge>}
                  {p.estado === 'vencido' && <Badge variant="danger">Vencido</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: 'success' | 'warning' | 'danger' | 'primary' }) {
  const tones = {
    success: 'text-success',
    warning: 'text-warning',
    danger:  'text-danger',
    primary: 'text-trilce-primary',
  };
  return (
    <div className="flex flex-col gap-1">
      <span className={`text-2xl font-bold ${tones[tone]}`}>{value}</span>
      <span className="text-[10px] font-bold tracking-widest text-white/40">{label}</span>
    </div>
  );
}

