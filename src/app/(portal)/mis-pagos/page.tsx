'use client';

import { useMemo, useState } from 'react';
import { useMisPagos } from '@/modules/pagos/api';
import { SubirComprobanteModal } from '@/modules/pagos/components/SubirComprobanteModal';
import { VerComprobanteModal } from '@/modules/pagos/components/VerComprobanteModal';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { KpiCard } from '@/shared/components/KpiCard';
import { diasHasta, fmtFecha, fmtSoles } from '@/shared/lib/format';
import type { Pago, PagoEstado } from '@/modules/pagos/types';

const TABS: { key: 'todos' | PagoEstado; label: string }[] = [
  { key: 'todos',     label: 'Todos' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'pagado',    label: 'Pagados' },
  { key: 'vencido',   label: 'Vencidos' },
];

export default function MisPagosPage() {
  const { data: pagos, isLoading, reload } = useMisPagos();
  const [filterTab, setFilterTab] = useState<(typeof TABS)[number]['key']>('todos');
  const [pagarPago, setPagarPago] = useState<Pago | null>(null);
  const [comprobantePago, setComprobantePago] = useState<Pago | null>(null);

  const stats = useMemo(() => calcStats(pagos), [pagos]);
  const filtered = filterTab === 'todos' ? pagos : pagos.filter((p) => p.estado === filterTab);
  const proximo = pagos.find((p) => p.estado === 'pendiente');

  if (isLoading) return <p className="text-text-secondary">Cargando pagos…</p>;

  if (pagos.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-md p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-bg-muted flex items-center justify-center mb-4">
          <Icon name="Wallet" size={28} className="text-text-muted" />
        </div>
        <h2 className="text-lg font-bold mb-1">No tienes pagos registrados</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Cuando administración apruebe tu matrícula, se generarán automáticamente
          tu pago de matrícula y las 10 pensiones del periodo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {proximo && <HeroProximoPago pago={proximo} onPagar={() => setPagarPago(proximo)} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="Total pagado" value={fmtSoles(stats.pagado)} icon="Wallet" iconColor="text-success" hint={`${stats.cntPagados} pagos completados`} />
        <KpiCard label="Pendiente" value={fmtSoles(stats.pendiente)} icon="Hourglass" iconColor="text-warning" hint={`${stats.cntPendientes} pagos pendientes`} />
        <KpiCard label="Vencido" value={fmtSoles(stats.vencido)} icon="TriangleAlert" iconColor="text-danger" hint={stats.cntVencidos === 0 ? 'Sin vencidos' : `${stats.cntVencidos} vencidos`} />
        <KpiCard
          label="Próximo vence"
          value={proximo ? `${diasHasta(proximo.fecha_vencimiento)} días` : '—'}
          icon="Calendar"
          iconColor="text-info"
          hint={proximo ? fmtFecha(proximo.fecha_vencimiento) : ''}
        />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-1 sm:gap-2 p-1.5 bg-bg-card rounded-md border border-border overflow-x-auto w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterTab(t.key)}
            className={`px-3 sm:px-4 py-2 rounded-sm text-[13px] whitespace-nowrap transition-colors ${
              filterTab === t.key
                ? 'bg-trilce-primary text-text-on-primary font-semibold'
                : 'text-text-secondary hover:bg-bg-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-bg-card border border-border rounded-md overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_150px_120px_140px_200px] gap-6 px-6 py-4 bg-bg-muted border-b border-border text-[11px] font-bold tracking-widest text-text-muted">
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
          <p className="p-8 text-center text-text-secondary">No hay pagos en esta categoría.</p>
        )}
      </div>

      <SubirComprobanteModal
        pago={pagarPago}
        onClose={() => setPagarPago(null)}
        onUploaded={reload}
      />
      <VerComprobanteModal
        pago={comprobantePago}
        onClose={() => setComprobantePago(null)}
      />
    </div>
  );
}

function HeroProximoPago({ pago, onPagar }: { pago: Pago; onPagar: () => void }) {
  return (
    <div className="bg-trilce-primary text-text-on-primary rounded-lg p-5 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold tracking-widest bg-trilce-primary-dark px-2.5 py-1 rounded-sm self-start">
          PAGO PRÓXIMO
        </span>
        <h2 className="text-xl sm:text-2xl font-bold">Tienes 1 pago próximo a vencer</h2>
        <p className="text-xs sm:text-sm text-trilce-primary-light">
          {pago.descripcion} — vence el {fmtFecha(pago.fecha_vencimiento)}
        </p>
      </div>
      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3">
        <span className="text-3xl sm:text-4xl font-bold">{fmtSoles(pago.monto)}</span>
        <Button variant="on-dark" onClick={onPagar}>
          Subir comprobante <Icon name="Upload" size={16} />
        </Button>
      </div>
    </div>
  );
}

function PagoRow({
  pago,
  onPagar,
  onVerComprobante,
}: {
  pago: Pago;
  onPagar: () => void;
  onVerComprobante: () => void;
}) {
  const porVerificar = pago.estado === 'pendiente' && pago.comprobante_url !== null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-[1fr_150px_120px_140px_200px] gap-x-3 gap-y-2 md:gap-6 px-4 sm:px-6 py-4 border-b border-border md:items-center text-[13px]">
      <span className="col-span-2 md:col-span-1 font-semibold text-text-primary">
        {pago.descripcion}
        {porVerificar && (
          <span className="ml-2 text-[10px] font-bold tracking-widest text-info bg-info/10 px-1.5 py-0.5 rounded-sm">
            POR VERIFICAR
          </span>
        )}
      </span>
      <span className="text-text-secondary order-2 md:order-none">
        <span className="md:hidden text-text-muted text-[11px] mr-1">Vence:</span>
        {fmtFecha(pago.fecha_vencimiento)}
      </span>
      <span className="font-semibold text-text-primary text-right md:text-left order-1 md:order-none">
        <span className="md:hidden text-text-muted text-[11px] mr-1 font-normal">Monto:</span>
        {fmtSoles(pago.monto)}
      </span>
      <span className="order-3 md:order-none">
        <EstadoBadge estado={pago.estado} porVerificar={porVerificar} />
      </span>
      <div className="flex justify-end md:justify-start order-4 md:order-none">
        {pago.estado === 'pagado' && (
          <button
            onClick={onVerComprobante}
            className="text-trilce-primary font-semibold hover:underline whitespace-nowrap text-xs"
          >
            Ver comprobante
          </button>
        )}
        {pago.estado === 'pendiente' && !porVerificar && (
          <Button variant="primary" className="!px-3 !py-1.5 text-xs whitespace-nowrap" onClick={onPagar}>
            <Icon name="Upload" size={13} /> Subir comprobante
          </Button>
        )}
        {pago.estado === 'pendiente' && porVerificar && (
          <button
            onClick={onVerComprobante}
            className="text-info font-semibold hover:underline whitespace-nowrap text-xs"
          >
            Ver comprobante enviado
          </button>
        )}
        {pago.estado === 'vencido' && (
          <Button variant="danger" className="!px-3 !py-1.5 text-xs whitespace-nowrap" onClick={onPagar}>
            <Icon name="Upload" size={13} /> Regularizar
          </Button>
        )}
      </div>
    </div>
  );
}

function EstadoBadge({ estado, porVerificar }: { estado: PagoEstado; porVerificar?: boolean }) {
  if (porVerificar) return <Badge variant="info">En revisión</Badge>;
  const map = {
    pagado:    { v: 'success' as const, label: 'Pagado' },
    pendiente: { v: 'warning' as const, label: 'Pendiente' },
    vencido:   { v: 'danger' as const,  label: 'Vencido' },
    anulado:   { v: 'neutral' as const, label: 'Anulado' },
  };
  const cfg = map[estado];
  return <Badge variant={cfg.v}>{cfg.label}</Badge>;
}

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
