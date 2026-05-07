'use client';

import { use } from 'react';
import { useEstadoCuenta } from '@/modules/pagos/api';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';

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
      <section className="bg-trilce-accent text-white rounded-lg px-10 py-7 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-trilce-primary flex items-center justify-center text-white text-2xl font-bold">
              {estudiante.nombres[0]}{estudiante.apellidos[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold">{estudiante.nombres} {estudiante.apellidos}</h1>
              <p className="text-sm text-white/60">DNI {estudiante.dni} · Código {estudiante.codigo_estudiante}</p>
            </div>
          </div>
          <Button variant="on-dark">
            <Icon name="FileText" size={14} /> Generar PDF
          </Button>
        </div>
        <div className="flex gap-8 pt-2 border-t border-white/10">
          <Stat value={`S/ ${totales.pagado.toLocaleString('es-PE')}`} label="PAGADO" tone="success" />
          <Stat value={`S/ ${totales.pendiente.toLocaleString('es-PE')}`} label="PENDIENTE" tone="warning" />
          <Stat value={`S/ ${totales.vencido.toLocaleString('es-PE')}`} label="VENCIDO" tone="danger" />
          <Stat value={`${totales.cobranza_porcentaje}%`} label="COBRANZA" tone="primary" />
        </div>
      </section>

      {/* Detalle de pagos */}
      <div className="bg-bg-card border border-border rounded-md p-6">
        <header className="flex items-center justify-between mb-4">
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
                className={`flex items-center justify-between px-4 py-3 rounded-sm ${
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

function fmtFecha(iso: string) {
  const d = new Date(iso);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${String(d.getDate()).padStart(2, '0')} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}
