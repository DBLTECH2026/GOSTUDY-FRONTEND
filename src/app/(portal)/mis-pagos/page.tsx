'use client';

import { useMemo, useState } from 'react';
import { useMisPagos } from '@/modules/pagos/api';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { KpiCard } from '@/shared/components/KpiCard';
import type { Pago, PagoEstado } from '@/modules/pagos/types';

const TABS: { key: 'todos' | PagoEstado; label: string }[] = [
  { key: 'todos',     label: 'Todos' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'pagado',    label: 'Pagados' },
  { key: 'vencido',   label: 'Vencidos' },
];

export default function MisPagosPage() {
  // Mientras Persona A no integre auth, usamos mocks.
  // El endpoint real es GET /api/v1/portal/mis-pagos (auth con DNI+PIN).
  const { data: pagos, isLoading } = useMisPagos();
  const [filterTab, setFilterTab] = useState<(typeof TABS)[number]['key']>('todos');

  const stats = useMemo(() => calcStats(pagos), [pagos]);
  const filtered = filterTab === 'todos'
    ? pagos
    : pagos.filter((p) => p.estado === filterTab);

  const proximo = pagos.find((p) => p.estado === 'pendiente');

  if (isLoading) return <p className="text-text-secondary">Cargando pagos…</p>;

  return (
    <div className="flex flex-col gap-5">
      {/* HERO */}
      {proximo && <HeroProximoPago pago={proximo} />}

      {/* KPIs */}
      <div className="flex gap-4">
        <KpiCard label="Total pagado" value={fmtSoles(stats.pagado)} icon="Wallet" iconColor="text-success" hint={`${stats.cntPagados} pagos completados`} />
        <KpiCard label="Pendiente" value={fmtSoles(stats.pendiente)} icon="Hourglass" iconColor="text-warning" hint={`${stats.cntPendientes} pagos pendientes`} />
        <KpiCard label="Vencido" value={fmtSoles(stats.vencido)} icon="TriangleAlert" iconColor="text-danger" hint={stats.cntVencidos === 0 ? 'Sin pagos vencidos' : `${stats.cntVencidos} vencidos`} />
        <KpiCard label="Próximo vence" value={proximo ? `${diasHasta(proximo.fecha_vencimiento)} días` : '—'} icon="Calendar" iconColor="text-info" hint={proximo?.fecha_vencimiento} />
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1.5 bg-bg-card rounded-md border border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterTab(t.key)}
              className={`px-4 py-2 rounded-sm text-[13px] transition-colors ${
                filterTab === t.key
                  ? 'bg-trilce-primary text-text-on-primary font-semibold'
                  : 'text-text-secondary hover:bg-bg-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-card rounded-md border border-border w-60">
            <Icon name="Search" size={16} className="text-text-muted" />
            <span className="text-[13px] text-text-muted">Buscar pago…</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-card rounded-md border border-border">
            <span className="text-[13px] font-semibold text-text-primary">2026</span>
            <Icon name="ChevronDown" size={16} className="text-text-muted" />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-bg-card border border-border rounded-md overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_110px_120px_160px] px-5 py-4 bg-bg-muted border-b border-border text-[11px] font-bold tracking-widest text-text-muted">
          <span>CONCEPTO</span>
          <span>VENCIMIENTO</span>
          <span>MONTO</span>
          <span>ESTADO</span>
          <span>ACCIONES</span>
        </div>
        {filtered.map((pago) => (
          <PagoRow key={pago.id} pago={pago} />
        ))}
        {filtered.length === 0 && (
          <p className="p-8 text-center text-text-secondary">No hay pagos en esta categoría.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Componentes locales ─── */

function HeroProximoPago({ pago }: { pago: Pago }) {
  return (
    <div className="bg-trilce-primary text-text-on-primary rounded-lg p-8 flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold tracking-widest bg-trilce-primary-dark px-2.5 py-1 rounded-sm self-start">
          PAGO PRÓXIMO
        </span>
        <h2 className="text-2xl font-bold">Tienes 1 pago próximo a vencer</h2>
        <p className="text-sm text-trilce-primary-light">
          {pago.descripcion} — vence el {fmtFecha(pago.fecha_vencimiento)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-3">
        <span className="text-4xl font-bold">{fmtSoles(pago.monto)}</span>
        <Button variant="on-dark">
          Pagar ahora <Icon name="ArrowRight" size={16} />
        </Button>
      </div>
    </div>
  );
}

function PagoRow({ pago }: { pago: Pago }) {
  const isPendiente = pago.estado === 'pendiente';
  return (
    <div className="grid grid-cols-[1fr_140px_110px_120px_160px] px-5 py-4 border-b border-border items-center text-[13px]">
      <span className="font-semibold text-text-primary">{pago.descripcion}</span>
      <span className="text-text-secondary">{fmtFecha(pago.fecha_vencimiento)}</span>
      <span className="font-semibold text-text-primary">{fmtSoles(pago.monto)}</span>
      <EstadoBadge estado={pago.estado} />
      <div>
        {isPendiente ? (
          <Button variant="primary" className="!px-4 !py-1.5 text-xs">Pagar ahora</Button>
        ) : pago.estado === 'pagado' ? (
          <button className="text-trilce-primary font-semibold hover:underline">Ver comprobante</button>
        ) : (
          <span className="text-text-secondary">—</span>
        )}
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: PagoEstado }) {
  const map = {
    pagado:    { v: 'success' as const, label: 'Pagado' },
    pendiente: { v: 'warning' as const, label: 'Pendiente' },
    vencido:   { v: 'danger' as const,  label: 'Vencido' },
    anulado:   { v: 'neutral' as const, label: 'Anulado' },
  };
  const cfg = map[estado];
  return <Badge variant={cfg.v}>{cfg.label}</Badge>;
}

/* ─── helpers ─── */

function calcStats(pagos: Pago[]) {
  return {
    pagado:        pagos.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0),
    pendiente:     pagos.filter(p => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0),
    vencido:       pagos.filter(p => p.estado === 'vencido').reduce((s, p) => s + p.monto, 0),
    cntPagados:    pagos.filter(p => p.estado === 'pagado').length,
    cntPendientes: pagos.filter(p => p.estado === 'pendiente').length,
    cntVencidos:   pagos.filter(p => p.estado === 'vencido').length,
  };
}

function fmtSoles(n: number) {
  return `S/ ${n.toFixed(2)}`;
}

function fmtFecha(iso: string) {
  const d = new Date(iso);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${String(d.getDate()).padStart(2, '0')} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function diasHasta(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}
