'use client';

import { useMemo, useState } from 'react';
import { registrarPago, usePagosAdmin } from '@/modules/pagos/api';
import { VerComprobanteModal } from '@/modules/pagos/components/VerComprobanteModal';
import type { PagoListItem, PagoMetodo } from '@/modules/pagos/types';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { KpiCard } from '@/shared/components/KpiCard';
import { fmtFecha, fmtSoles } from '@/shared/lib/format';

export default function PagosAdminPage() {
  const [tab, setTab] = useState<'todos' | 'pendiente' | 'pagado' | 'vencido'>('todos');
  const { data: pagos, isLoading } = usePagosAdmin(tab === 'todos' ? {} : { estado: tab });
  const [modalPago, setModalPago] = useState<PagoListItem | null>(null);
  const [comprobantePago, setComprobantePago] = useState<PagoListItem | null>(null);
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    const all = pagos;
    return {
      recaudado: all.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0),
      pendiente: all.filter(p => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0),
      vencido:   all.filter(p => p.estado === 'vencido').reduce((s, p) => s + p.monto, 0),
      cntPend:   all.filter(p => p.estado === 'pendiente').length,
      cntVenc:   all.filter(p => p.estado === 'vencido').length,
    };
  }, [pagos]);

  const filteredPagos = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pagos;
    return pagos.filter((p) => {
      const alumno = p.alumno
        ? `${p.alumno.nombres} ${p.alumno.apellidos} ${p.alumno.grado} ${p.alumno.seccion}`.toLowerCase()
        : '';
      return (
        alumno.includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.monto.toString().includes(q)
      );
    });
  }, [pagos, search]);

  // Selecciona automáticamente el primer pago pendiente cuando admin clickea "Registrar pago" en el hero
  const pickFirstPendiente = () => {
    const p = filteredPagos.find((p) => p.estado === 'pendiente' || p.estado === 'vencido')
      ?? pagos.find((p) => p.estado === 'pendiente' || p.estado === 'vencido');
    if (p) setModalPago(p);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Hero strip oscuro */}
      <section className="bg-trilce-accent text-white rounded-lg px-10 py-7 flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold tracking-widest bg-trilce-primary px-2.5 py-1 rounded-sm self-start">
            PERIODO 2026-I
          </span>
          <h2 className="text-2xl font-bold">Recaudación al {fmtFechaCorta(new Date())}</h2>
          <p className="text-sm text-white/60">
            {fmtSoles(stats.recaudado)} cobrados de {fmtSoles(stats.recaudado + stats.pendiente + stats.vencido)} facturados
          </p>
        </div>
        <Button variant="primary" onClick={pickFirstPendiente}>
          <Icon name="Plus" size={16} /> Registrar pago
        </Button>
      </section>

      {/* KPIs */}
      <div className="flex gap-4 flex-wrap">
        <KpiCard label="Recaudado" value={fmtSoles(stats.recaudado)} icon="Wallet" iconColor="text-success" />
        <KpiCard label="Pendiente" value={fmtSoles(stats.pendiente)} icon="Hourglass" iconColor="text-warning" hint={`${stats.cntPend} pagos pendientes`} />
        <KpiCard label="Vencidos" value={fmtSoles(stats.vencido)} icon="TriangleAlert" iconColor="text-danger" hint={`${stats.cntVenc} alumnos con mora`} />
        <KpiCard label="Cobrado este mes" value="S/ 45,200" icon="Calendar" iconColor="text-info" hint="Mayo 2026" />
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1.5 bg-bg-card rounded-md border border-border">
          {(['todos', 'pendiente', 'pagado', 'vencido'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-sm text-[13px] capitalize transition-colors ${
                tab === k ? 'bg-trilce-primary text-text-on-primary font-semibold' : 'text-text-secondary'
              }`}
            >
              {k === 'todos' ? 'Todos' : k}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-bg-card rounded-md border border-border w-72 focus-within:border-trilce-primary transition-colors">
            <Icon name="Search" size={16} className="text-text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar alumno, concepto o monto…"
              className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
            />
          </label>
          <Button variant="secondary">
            <Icon name="Download" size={16} /> Exportar
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-bg-card border border-border rounded-md overflow-hidden">
        <div className="grid grid-cols-[1fr_150px_120px_140px_180px] gap-6 px-6 py-4 bg-bg-muted border-b border-border text-[11px] font-bold tracking-widest text-text-muted">
          <span>ALUMNO / CONCEPTO</span>
          <span>VENCIMIENTO</span>
          <span>MONTO</span>
          <span>ESTADO</span>
          <span>ACCIONES</span>
        </div>
        {isLoading && <p className="p-6 text-text-secondary">Cargando…</p>}
        {!isLoading && filteredPagos.length === 0 && (
          <p className="p-8 text-center text-text-secondary">
            {search.trim()
              ? `No hay resultados para "${search.trim()}".`
              : 'No hay pagos en esta categoría.'}
          </p>
        )}
        {filteredPagos.map((p) => (
          <PagoRow
            key={p.id}
            pago={p}
            onRegistrar={() => setModalPago(p)}
            onVerComprobante={() => setComprobantePago(p)}
          />
        ))}
      </div>

      {modalPago && <RegistrarPagoModal pago={modalPago} onClose={() => setModalPago(null)} />}
      <VerComprobanteModal
        pago={comprobantePago}
        onClose={() => setComprobantePago(null)}
        showAlumno
      />
    </div>
  );
}

/* ─── locales ─── */

function PagoRow({
  pago,
  onRegistrar,
  onVerComprobante,
}: {
  pago: PagoListItem;
  onRegistrar: () => void;
  onVerComprobante: () => void;
}) {
  const estadoCfg = {
    pagado:    { v: 'success' as const, label: 'Pagado' },
    pendiente: { v: 'warning' as const, label: 'Pendiente' },
    vencido:   { v: 'danger' as const,  label: 'Vencido' },
    anulado:   { v: 'neutral' as const, label: 'Anulado' },
  }[pago.estado];

  return (
    <div className="grid grid-cols-[1fr_150px_120px_140px_180px] gap-6 px-6 py-4 border-b border-border items-center text-[13px]">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-semibold text-text-primary truncate">
          {pago.alumno ? `${pago.alumno.nombres} ${pago.alumno.apellidos} · ${pago.alumno.grado} — ${pago.alumno.seccion}` : `Pago #${pago.id}`}
        </span>
        <span className={`text-[11px] truncate ${pago.estado === 'vencido' ? 'text-danger' : 'text-text-muted'}`}>
          {pago.descripcion}
        </span>
      </div>
      <span className={pago.estado === 'vencido' ? 'text-danger' : 'text-text-secondary'}>
        {fmtFecha(pago.fecha_vencimiento)}
      </span>
      <span className="font-semibold text-text-primary">{fmtSoles(pago.monto)}</span>
      <span><Badge variant={estadoCfg.v}>{estadoCfg.label}</Badge></span>
      <div className="flex">
        {pago.estado === 'pendiente' && (
          <Button variant="primary" className="!px-4 !py-1.5 text-xs" onClick={onRegistrar}>
            Registrar pago
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
          <button className="text-trilce-primary font-semibold hover:underline" onClick={onRegistrar}>
            Registrar / Anular
          </button>
        )}
      </div>
    </div>
  );
}

function RegistrarPagoModal({ pago, onClose }: { pago: PagoListItem; onClose: () => void }) {
  const [metodo, setMetodo] = useState<PagoMetodo>('efectivo');
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    await registrarPago(pago.id, { metodo, monto: pago.monto });
    setBusy(false);
    onClose();
  }

  const metodos: { key: PagoMetodo; label: string; icon: 'Banknote' | 'Building2' | 'Smartphone' }[] = [
    { key: 'efectivo',      label: 'Efectivo',  icon: 'Banknote' },
    { key: 'transferencia', label: 'Transfer.', icon: 'Building2' },
    { key: 'yape',          label: 'Yape',      icon: 'Smartphone' },
    { key: 'plin',          label: 'Plin',      icon: 'Smartphone' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-bg-card rounded-md w-[560px] max-h-[90vh] overflow-y-auto border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Registrar pago</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {pago.alumno ? `${pago.alumno.nombres} ${pago.alumno.apellidos} · ${pago.alumno.grado} — ${pago.alumno.seccion}` : `Pago #${pago.id}`}
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar">
            <Icon name="X" size={20} className="text-text-muted hover:text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          {/* Resumen */}
          <div className="flex items-center gap-3 p-4 bg-trilce-primary-soft rounded-sm">
            <Icon name="FileText" size={18} className="text-trilce-primary" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-text-primary">{pago.descripcion}</div>
              <div className="text-[11px] text-text-secondary">Vence el {fmtFecha(pago.fecha_vencimiento)}</div>
            </div>
            <div className="text-base font-bold text-trilce-primary">S/ {pago.monto.toFixed(2)}</div>
          </div>

          {/* Monto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Monto recibido</label>
            <input
              defaultValue={pago.monto.toFixed(2)}
              className="px-4 py-3 bg-bg-card rounded-sm border border-border text-sm font-semibold"
              type="text"
            />
          </div>

          {/* Método de pago */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary">Método de pago</label>
            <div className="grid grid-cols-4 gap-2">
              {metodos.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetodo(m.key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-sm border-2 transition-colors ${
                    metodo === m.key
                      ? 'bg-trilce-primary-soft border-trilce-primary'
                      : 'bg-bg-card border-border'
                  }`}
                >
                  <Icon name={m.icon} size={20} className={metodo === m.key ? 'text-trilce-primary' : 'text-text-secondary'} />
                  <span className={`text-[11px] ${metodo === m.key ? 'font-semibold text-trilce-primary-dark' : 'text-text-secondary'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Comprobante upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Comprobante de pago</label>
            <div className="flex flex-col items-center gap-1.5 p-6 border-2 border-dashed border-border rounded-sm bg-bg-muted">
              <Icon name="Upload" size={24} className="text-text-muted" />
              <span className="text-xs text-text-secondary">Arrastra el comprobante o haz clic para subir</span>
              <span className="text-[11px] text-text-muted">PDF, JPG, PNG · Máx 5MB</span>
            </div>
          </div>

          {/* Observaciones */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Observaciones (opcional)</label>
            <textarea
              placeholder="Ej. Pago realizado en mesa de partes"
              className="px-4 py-3 bg-bg-card rounded-sm border border-border text-[13px] text-text-secondary h-[60px] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={busy}>
            {busy ? 'Confirmando…' : 'Confirmar pago'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function fmtFechaCorta(d: Date) {
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${String(d.getDate()).padStart(2, '0')} de ${meses[d.getMonth()]}`;
}
