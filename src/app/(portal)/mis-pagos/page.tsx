'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMisPagos } from '@/modules/pagos/api';
import { PagarOnlineModal } from '@/modules/pagos/components/PagarOnlineModal';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { KpiCard } from '@/shared/components/KpiCard';
import { Modal } from '@/shared/components/Modal';
import { diasHasta, fmtFecha, fmtSoles } from '@/shared/lib/format';
import type { Pago, PagoEstado } from '@/modules/pagos/types';

const TABS: { key: 'todos' | PagoEstado; label: string }[] = [
  { key: 'todos',     label: 'Todos' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'pagado',    label: 'Pagados' },
  { key: 'vencido',   label: 'Vencidos' },
];

export default function MisPagosPage() {
  const { data: pagos, isLoading, marcarPagado } = useMisPagos();
  const [filterTab, setFilterTab] = useState<(typeof TABS)[number]['key']>('todos');
  const [search, setSearch] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [pagarPago, setPagarPago] = useState<Pago | null>(null);
  const [comprobantePago, setComprobantePago] = useState<Pago | null>(null);

  // Años disponibles según los datos. Se recalcula cuando cambian los pagos.
  const availableYears = useMemo(() => {
    const ys = new Set<number>();
    for (const p of pagos) ys.add(parseInt(p.fecha_vencimiento.slice(0, 4), 10));
    return Array.from(ys).sort((a, b) => b - a);
  }, [pagos]);

  // Default al año más reciente disponible una vez cargan los pagos.
  useEffect(() => {
    if (year === null && availableYears.length > 0) {
      setYear(availableYears[0]);
    }
  }, [availableYears, year]);

  const stats = useMemo(() => calcStats(filterByYear(pagos, year)), [pagos, year]);

  // Filtrado: año → tab → búsqueda libre.
  const filtered = useMemo(() => {
    let out = filterByYear(pagos, year);
    if (filterTab !== 'todos') out = out.filter((p) => p.estado === filterTab);
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter((p) =>
        p.descripcion.toLowerCase().includes(q) ||
        p.monto.toString().includes(q) ||
        (p.metodo ?? '').includes(q),
      );
    }
    return out;
  }, [pagos, year, filterTab, search]);

  const proximo = filterByYear(pagos, year).find((p) => p.estado === 'pendiente');

  if (isLoading) return <p className="text-text-secondary">Cargando pagos…</p>;

  return (
    <div className="flex flex-col gap-5">
      {/* HERO */}
      {proximo && (
        <HeroProximoPago pago={proximo} onPagar={() => setPagarPago(proximo)} />
      )}

      {/* KPIs */}
      <div className="flex gap-4">
        <KpiCard label="Total pagado" value={fmtSoles(stats.pagado)} icon="Wallet" iconColor="text-success" hint={`${stats.cntPagados} pagos completados`} />
        <KpiCard label="Pendiente" value={fmtSoles(stats.pendiente)} icon="Hourglass" iconColor="text-warning" hint={`${stats.cntPendientes} pagos pendientes`} />
        <KpiCard label="Vencido" value={fmtSoles(stats.vencido)} icon="TriangleAlert" iconColor="text-danger" hint={stats.cntVencidos === 0 ? 'Sin pagos vencidos' : `${stats.cntVencidos} vencidos`} />
        <KpiCard
          label="Próximo vence"
          value={proximo ? `${diasHasta(proximo.fecha_vencimiento)} días` : '—'}
          icon="Calendar"
          iconColor="text-info"
          hint={proximo ? fmtFecha(proximo.fecha_vencimiento) : ''}
        />
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between flex-wrap gap-3">
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
          <label className="flex items-center gap-2 px-4 py-2.5 bg-bg-card rounded-md border border-border w-60 focus-within:border-trilce-primary transition-colors">
            <Icon name="Search" size={16} className="text-text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pago…"
              className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
            />
          </label>
          <YearSelect years={availableYears} value={year} onChange={setYear} />
        </div>
      </div>

      {/* Tabla — columnas con gap real para no apretar Estado y Acciones */}
      <div className="bg-bg-card border border-border rounded-md overflow-hidden">
        <div className="grid grid-cols-[1fr_150px_120px_140px_180px] gap-6 px-6 py-4 bg-bg-muted border-b border-border text-[11px] font-bold tracking-widest text-text-muted">
          <span>CONCEPTO</span>
          <span>VENCIMIENTO</span>
          <span>MONTO</span>
          <span>ESTADO</span>
          <span>ACCIONES</span>
        </div>
        {filtered.map((pago) => (
          <PagoRow
            key={pago.id}
            pago={pago}
            onPagar={() => setPagarPago(pago)}
            onVerComprobante={() => setComprobantePago(pago)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="p-8 text-center text-text-secondary">
            {search.trim()
              ? `No hay resultados para "${search.trim()}".`
              : 'No hay pagos en esta categoría.'}
          </p>
        )}
      </div>

      {/* Modales */}
      <PagarOnlineModal
        pago={pagarPago}
        onClose={() => setPagarPago(null)}
        onPagoCompleto={(id, metodo) => marcarPagado(id, metodo)}
      />
      <VerComprobanteModal pago={comprobantePago} onClose={() => setComprobantePago(null)} />
    </div>
  );
}

/* ─── Componentes locales ─── */

function HeroProximoPago({ pago, onPagar }: { pago: Pago; onPagar: () => void }) {
  return (
    <div className="bg-trilce-primary text-text-on-primary rounded-lg p-8 flex items-center justify-between flex-wrap gap-4">
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
        <Button variant="on-dark" onClick={onPagar}>
          Pagar ahora <Icon name="ArrowRight" size={16} />
        </Button>
      </div>
    </div>
  );
}

function PagoRow({
  pago, onPagar, onVerComprobante,
}: {
  pago: Pago;
  onPagar: () => void;
  onVerComprobante: () => void;
}) {
  const isPendiente = pago.estado === 'pendiente';
  return (
    <div className="grid grid-cols-[1fr_150px_120px_140px_180px] gap-6 px-6 py-4 border-b border-border items-center text-[13px]">
      <span className="font-semibold text-text-primary">{pago.descripcion}</span>
      <span className="text-text-secondary">{fmtFecha(pago.fecha_vencimiento)}</span>
      <span className="font-semibold text-text-primary">{fmtSoles(pago.monto)}</span>
      <EstadoBadge estado={pago.estado} />
      <div className="flex">
        {isPendiente && (
          <Button variant="primary" className="!px-4 !py-1.5 text-xs whitespace-nowrap" onClick={onPagar}>
            Pagar ahora
          </Button>
        )}
        {pago.estado === 'pagado' && (
          <button
            onClick={onVerComprobante}
            className="text-trilce-primary font-semibold hover:underline whitespace-nowrap"
          >
            Ver comprobante
          </button>
        )}
        {pago.estado === 'vencido' && (
          <Button variant="danger" className="!px-4 !py-1.5 text-xs whitespace-nowrap" onClick={onPagar}>
            Regularizar
          </Button>
        )}
        {pago.estado === 'anulado' && <span className="text-text-muted">—</span>}
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
  return <span><Badge variant={cfg.v}>{cfg.label}</Badge></span>;
}

/* ─── Modales ─── */

function VerComprobanteModal({ pago, onClose }: { pago: Pago | null; onClose: () => void }) {
  return (
    <Modal
      open={pago !== null}
      onClose={onClose}
      title="Comprobante de pago"
      subtitle={pago ? `${pago.descripcion} — ${fmtSoles(pago.monto)}` : undefined}
      width={500}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button variant="primary">
            <Icon name="Download" size={16} /> Descargar PDF
          </Button>
        </>
      }
    >
      {pago && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <DataField label="Concepto" value={pago.descripcion} />
            <DataField label="Monto" value={fmtSoles(pago.monto)} />
            <DataField label="Fecha de pago" value={pago.fecha_pago ? fmtFecha(pago.fecha_pago) : '—'} />
            <DataField label="Método" value={pago.metodo ? capitalize(pago.metodo) : '—'} />
          </div>
          <div className="border-2 border-dashed border-border rounded-sm p-10 flex flex-col items-center justify-center gap-2 bg-bg-muted">
            <Icon name="FileText" size={36} className="text-text-muted" />
            <span className="text-xs text-text-muted">Vista previa del comprobante</span>
            <span className="text-[11px] text-text-muted">(simulado mientras integramos auth)</span>
          </div>
        </div>
      )}
    </Modal>
  );
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold tracking-wide text-text-muted">{label.toUpperCase()}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ─── Filtros ─── */

function YearSelect({
  years, value, onChange,
}: {
  years: number[];
  value: number | null;
  onChange: (y: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-bg-card rounded-md border border-border hover:border-trilce-primary transition-colors"
      >
        <span className="text-[13px] font-semibold text-text-primary">{value ?? '—'}</span>
        <Icon name="ChevronDown" size={16} className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="absolute right-0 top-full mt-1.5 min-w-[100px] bg-bg-card border border-border rounded-md shadow-lg overflow-hidden z-10">
          {years.map((y) => (
            <li key={y}>
              <button
                type="button"
                onClick={() => { onChange(y); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                  value === y
                    ? 'bg-trilce-primary-soft text-trilce-primary-dark font-semibold'
                    : 'text-text-secondary hover:bg-bg-muted'
                }`}
              >
                {y}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function filterByYear(pagos: Pago[], year: number | null): Pago[] {
  if (year === null) return pagos;
  return pagos.filter((p) => p.fecha_vencimiento.startsWith(String(year)));
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
