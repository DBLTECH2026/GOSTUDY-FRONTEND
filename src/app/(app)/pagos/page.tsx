'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { registrarPago, usePagosAdmin } from '@/modules/pagos/api';
import { VerComprobanteModal } from '@/modules/pagos/components/VerComprobanteModal';
import type { PagoListItem } from '@/modules/pagos/types';
import { ApiError } from '@/shared/lib/api';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { KpiCard } from '@/shared/components/KpiCard';
import { fmtFecha, fmtSoles } from '@/shared/lib/format';

type Tab = 'por_verificar' | 'pagado' | 'vencido' | 'todos';

const TABS: { key: Tab; label: string }[] = [
  { key: 'por_verificar', label: 'Por verificar' },
  { key: 'pagado',        label: 'Pagados' },
  { key: 'vencido',       label: 'Vencidos' },
  { key: 'todos',         label: 'Todos' },
];

export default function PagosAdminPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>('por_verificar');
  const [search, setSearch] = useState('');
  // El backend filtra por estado; "por_verificar" lo aplicamos en frontend
  // (estado=pendiente AND comprobante_url != null).
  const filtroBackend =
    tab === 'pagado'  ? { estado: 'pagado' } :
    tab === 'vencido' ? { estado: 'vencido' } :
    tab === 'por_verificar' ? { estado: 'pendiente' } :
    undefined;
  const { data: pagos, isLoading, reload } = usePagosAdmin(filtroBackend);

  const [verComprobante, setVerComprobante] = useState<PagoListItem | null>(null);
  const [aprobando, setAprobando] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let out = pagos;

    // Aplicar filtro "Por verificar": pendientes que ya tienen comprobante subido
    if (tab === 'por_verificar') {
      out = out.filter((p) => p.estado === 'pendiente' && !!p.comprobante_url);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter((p) => {
        const alumno = p.alumno
          ? `${p.alumno.nombres} ${p.alumno.apellidos} ${p.alumno.grado} ${p.alumno.seccion}`.toLowerCase()
          : '';
        return (
          alumno.includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.monto.toString().includes(q)
        );
      });
    }
    return out;
  }, [pagos, search, tab]);

  const stats = useMemo(() => ({
    recaudado: pagos.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0),
    pendiente: pagos.filter(p => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0),
    vencido:   pagos.filter(p => p.estado === 'vencido').reduce((s, p) => s + p.monto, 0),
    cntPend:   pagos.filter(p => p.estado === 'pendiente').length,
    cntVenc:   pagos.filter(p => p.estado === 'vencido').length,
    cntPorVerif: pagos.filter(p => p.estado === 'pendiente' && p.comprobante_url).length,
  }), [pagos]);

  async function aprobar(p: PagoListItem) {
    if (!token) return;
    setActionErr(null); setActionMsg(null);
    setAprobando(p.id);
    try {
      await registrarPago(token, p.id, {
        metodo: (p.metodo ?? 'transferencia') as never,
        monto: p.monto,
        observaciones: 'Pago verificado y aprobado por admin.',
        comprobante: null,
      });
      setActionMsg(`Pago de ${p.alumno?.nombres ?? '#' + p.id} aprobado.`);
      reload();
    } catch (err) {
      if (err instanceof ApiError) setActionErr(err.message);
      else setActionErr('Error de red.');
    } finally {
      setAprobando(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-trilce-accent text-white rounded-lg px-5 sm:px-10 py-5 sm:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold tracking-widest bg-trilce-primary px-2.5 py-1 rounded-sm self-start">PAGOS</span>
          <h2 className="text-xl sm:text-2xl font-bold">Gestión de pagos</h2>
          <p className="text-xs sm:text-sm text-white/60">
            {pagos.length === 0
              ? 'Sin datos aún — la información aparecerá al generar pagos a las matrículas activas.'
              : `${pagos.length} pagos · ${stats.cntPorVerif > 0 ? `${stats.cntPorVerif} por verificar` : 'todo al día'}`}
          </p>
        </div>
      </section>

      {actionMsg && (
        <div className="bg-success/10 border border-success/30 text-success text-sm rounded-sm p-3">{actionMsg}</div>
      )}
      {actionErr && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm p-3">{actionErr}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="Recaudado" value={fmtSoles(stats.recaudado)} icon="Wallet" iconColor="text-success" />
        <KpiCard label="Pendiente" value={fmtSoles(stats.pendiente)} icon="Hourglass" iconColor="text-warning" hint={`${stats.cntPend} pendientes`} />
        <KpiCard label="Vencidos" value={fmtSoles(stats.vencido)} icon="TriangleAlert" iconColor="text-danger" hint={`${stats.cntVenc} con mora`} />
        <KpiCard label="Por verificar" value={String(stats.cntPorVerif)} icon="Mail" iconColor="text-info" hint="Comprobantes a revisar" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 bg-bg-card rounded-md border border-border overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 sm:px-4 py-2 rounded-sm text-[13px] whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-trilce-primary text-text-on-primary font-semibold' : 'text-text-secondary'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 px-4 py-2.5 bg-bg-card rounded-md border border-border lg:w-72">
          <Icon name="Search" size={16} className="text-text-muted flex-shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar alumno o concepto…"
            className="flex-1 min-w-0 bg-transparent text-[13px] outline-none"
          />
        </label>
      </div>

      {isLoading ? (
        <p className="p-8 text-center text-text-muted">Cargando pagos…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-md p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-bg-muted flex items-center justify-center mb-3">
            <Icon name={tab === 'por_verificar' ? 'CircleCheck' : 'CreditCard'} size={24} className="text-text-muted" />
          </div>
          <p className="font-semibold text-text-primary">
            {search
              ? `Sin resultados para "${search}"`
              : tab === 'por_verificar' ? 'No hay pagos por verificar'
              : tab === 'pagado'        ? 'Aún no hay pagos confirmados'
              : tab === 'vencido'       ? 'Sin pagos vencidos'
              : 'No hay pagos registrados'}
          </p>
          <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
            {tab === 'por_verificar'
              ? 'Cuando un apoderado suba el comprobante de un pago, aparecerá aquí para que lo apruebes.'
              : 'Los pagos se generan automáticamente al aprobar una matrícula.'}
          </p>
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-md overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_140px_110px_140px_220px] gap-4 px-5 py-3 bg-bg-muted border-b border-border text-[11px] font-bold tracking-widest text-text-muted">
            <span>ALUMNO / CONCEPTO</span>
            <span>VENCIMIENTO</span>
            <span>MONTO</span>
            <span>ESTADO</span>
            <span>ACCIONES</span>
          </div>
          {filtered.map((p) => (
            <PagoRow
              key={p.id}
              pago={p}
              aprobando={aprobando === p.id}
              onVer={() => setVerComprobante(p)}
              onAprobar={() => aprobar(p)}
            />
          ))}
        </div>
      )}

      <VerComprobanteModal
        pago={verComprobante}
        onClose={() => setVerComprobante(null)}
        showAlumno
      />
    </div>
  );
}

function PagoRow({
  pago, aprobando, onVer, onAprobar,
}: {
  pago: PagoListItem;
  aprobando: boolean;
  onVer: () => void;
  onAprobar: () => void;
}) {
  const porVerificar = pago.estado === 'pendiente' && !!pago.comprobante_url;

  const estadoBadge = (() => {
    if (porVerificar) return <Badge variant="info">POR VERIFICAR</Badge>;
    if (pago.estado === 'pagado')    return <Badge variant="success">Pagado</Badge>;
    if (pago.estado === 'pendiente') return <Badge variant="warning">Pendiente</Badge>;
    if (pago.estado === 'vencido')   return <Badge variant="danger">Vencido</Badge>;
    return <Badge variant="neutral">{pago.estado}</Badge>;
  })();

  return (
    <div className="grid grid-cols-2 md:grid-cols-[1fr_140px_110px_140px_220px] gap-x-3 gap-y-2 md:gap-4 px-4 sm:px-5 py-3 border-b border-border last:border-0 md:items-center text-sm">
      <div className="col-span-2 md:col-span-1 flex flex-col gap-0.5 min-w-0">
        <span className="font-semibold text-text-primary truncate">
          {pago.alumno
            ? `${pago.alumno.nombres} ${pago.alumno.apellidos} · ${pago.alumno.grado} — ${pago.alumno.seccion}`
            : `Pago #${pago.id}`}
        </span>
        <span className={`text-[11px] truncate ${pago.estado === 'vencido' ? 'text-danger' : 'text-text-muted'}`}>
          {pago.descripcion}
        </span>
      </div>
      <span className={`text-[13px] order-2 md:order-none ${pago.estado === 'vencido' ? 'text-danger' : 'text-text-secondary'}`}>
        <span className="md:hidden text-[11px] text-text-muted mr-1">Vence:</span>
        {fmtFecha(pago.fecha_vencimiento)}
      </span>
      <span className="font-semibold text-text-primary text-right md:text-left order-1 md:order-none">
        <span className="md:hidden text-[11px] text-text-muted mr-1 font-normal">Monto:</span>
        {fmtSoles(pago.monto)}
      </span>
      <span className="order-3 md:order-none">{estadoBadge}</span>
      <div className="flex flex-wrap justify-end md:justify-start gap-2 order-4 md:order-none">
        {pago.comprobante_url && (
          <button
            onClick={onVer}
            className="text-trilce-primary font-semibold hover:underline whitespace-nowrap text-xs flex items-center gap-1"
          >
            <Icon name="FileText" size={13} /> Ver comprobante
          </button>
        )}
        {porVerificar && (
          <Button
            variant="primary"
            className="!px-3 !py-1.5 text-xs whitespace-nowrap"
            onClick={onAprobar}
            disabled={aprobando}
          >
            <Icon name="CircleCheck" size={13} />
            {aprobando ? 'Aprobando…' : 'Aprobar pago'}
          </Button>
        )}
      </div>
    </div>
  );
}
