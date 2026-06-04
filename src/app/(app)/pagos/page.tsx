'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { registrarPago, usePagosAdmin } from '@/modules/pagos/api';
import { VerComprobanteModal } from '@/modules/pagos/components/VerComprobanteModal';
import type { PagoListItem } from '@/modules/pagos/types';
import { Badge } from '@/shared/components/Badge';
import { useConfirm } from '@/shared/components/ConfirmProvider';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { KpiCard } from '@/shared/components/KpiCard';
import { BarChartReport, type BarDatum } from '@/shared/components/charts/BarChartReport';
import { fmtFecha, fmtSoles } from '@/shared/lib/format';
import { notify } from '@/shared/lib/notify';

type Tab = 'por_verificar' | 'pagado' | 'vencido' | 'todos';
type Concepto = 'todos' | 'matricula' | 'pension' | 'otros';
type SortKey = 'alumno' | 'vencimiento' | 'monto';
type SortDir = 'asc' | 'desc';

const TABS: { key: Tab; label: string }[] = [
  { key: 'por_verificar', label: 'Por verificar' },
  { key: 'pagado',        label: 'Pagados' },
  { key: 'vencido',       label: 'Vencidos' },
  { key: 'todos',         label: 'Todos' },
];

const CONCEPTOS: { key: Concepto; label: string }[] = [
  { key: 'todos',     label: 'Todos' },
  { key: 'matricula', label: 'Matrícula' },
  { key: 'pension',   label: 'Pensión' },
  { key: 'otros',     label: 'Otros' },
];

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES_LARGOS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/** Mes (1-12) de un pago, derivado de su fecha de vencimiento. */
function mesDe(p: PagoListItem): number {
  return Number(p.fecha_vencimiento.split('T')[0].split('-')[1]) || 0;
}

export default function PagosAdminPage() {
  const { token } = useAuth();
  const confirm = useConfirm();
  const [tab, setTab] = useState<Tab>('por_verificar');
  const [concepto, setConcepto] = useState<Concepto>('todos');
  const [mes, setMes] = useState<number | null>(null); // null = todos los meses
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('vencimiento');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // El backend filtra por estado; "por_verificar" lo aplicamos en frontend.
  const filtroBackend =
    tab === 'pagado'  ? { estado: 'pagado' } :
    tab === 'vencido' ? { estado: 'vencido' } :
    tab === 'por_verificar' ? { estado: 'pendiente' } :
    undefined;
  const { data: pagos, isLoading, reload } = usePagosAdmin(filtroBackend);

  const [verComprobante, setVerComprobante] = useState<PagoListItem | null>(null);
  const [aprobando, setAprobando] = useState<number | null>(null);

  // Meses presentes en los datos (para no mostrar chips de meses sin pagos)
  const mesesConDatos = useMemo(() => {
    const set = new Set<number>();
    pagos.forEach((p) => { const m = mesDe(p); if (m) set.add(m); });
    return set;
  }, [pagos]);

  // Datos del mini-gráfico: recaudado por mes (solo pagados)
  const chartData = useMemo<BarDatum[]>(() => {
    const porMes = new Map<number, number>();
    pagos.filter((p) => p.estado === 'pagado').forEach((p) => {
      const m = mesDe(p);
      if (m) porMes.set(m, (porMes.get(m) ?? 0) + p.monto);
    });
    return Array.from(mesesConDatos)
      .sort((a, b) => a - b)
      .map((m) => ({
        label: MESES[m - 1],
        value: porMes.get(m) ?? 0,
        caption: fmtSoles(porMes.get(m) ?? 0),
      }));
  }, [pagos, mesesConDatos]);

  const filtered = useMemo(() => {
    let out = pagos;

    if (tab === 'por_verificar') {
      out = out.filter((p) => p.estado === 'pendiente' && !!p.comprobante_url);
    }
    if (concepto !== 'todos') {
      out = out.filter((p) => p.concepto === concepto);
    }
    if (mes !== null) {
      out = out.filter((p) => mesDe(p) === mes);
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

    // Orden
    const dir = sortDir === 'asc' ? 1 : -1;
    out = [...out].sort((a, b) => {
      if (sortKey === 'monto') return (a.monto - b.monto) * dir;
      if (sortKey === 'vencimiento') return a.fecha_vencimiento.localeCompare(b.fecha_vencimiento) * dir;
      const na = a.alumno ? `${a.alumno.apellidos} ${a.alumno.nombres}` : '';
      const nb = b.alumno ? `${b.alumno.apellidos} ${b.alumno.nombres}` : '';
      return na.localeCompare(nb) * dir;
    });
    return out;
  }, [pagos, search, tab, concepto, mes, sortKey, sortDir]);

  // Stats globales (todos los pagos del estado actual)
  const stats = useMemo(() => ({
    recaudado: pagos.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0),
    pendiente: pagos.filter(p => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0),
    vencido:   pagos.filter(p => p.estado === 'vencido').reduce((s, p) => s + p.monto, 0),
    cntPend:   pagos.filter(p => p.estado === 'pendiente').length,
    cntVenc:   pagos.filter(p => p.estado === 'vencido').length,
    cntPorVerif: pagos.filter(p => p.estado === 'pendiente' && p.comprobante_url).length,
  }), [pagos]);

  // Resumen de la selección filtrada (lo que se ve en la tabla)
  const resumen = useMemo(() => ({
    total: filtered.reduce((s, p) => s + p.monto, 0),
    count: filtered.length,
  }), [filtered]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'alumno' ? 'asc' : 'desc');
    }
  }

  const hayFiltros = concepto !== 'todos' || mes !== null || search.trim() !== '';
  function limpiarFiltros() {
    setConcepto('todos');
    setMes(null);
    setSearch('');
  }

  async function aprobar(p: PagoListItem) {
    if (!token) return;
    const alumno = p.alumno ? `${p.alumno.nombres} ${p.alumno.apellidos}` : `Pago #${p.id}`;
    const ok = await confirm({
      title: '¿Aprobar este pago?',
      description: `Se marcará como PAGADO el ${fmtSoles(p.monto)} de ${alumno} (${p.descripcion}).`,
      confirmText: 'Aprobar pago',
      cancelText: 'Cancelar',
      icon: 'CircleCheck',
    });
    if (!ok) return;

    setAprobando(p.id);
    const tid = notify.loading('Aprobando pago…');
    try {
      await registrarPago(token, p.id, {
        metodo: (p.metodo ?? 'transferencia') as never,
        monto: p.monto,
        observaciones: 'Pago verificado y aprobado por admin.',
        comprobante: null,
      });
      notify.dismiss(tid);
      notify.success({ title: 'Pago aprobado', description: `${alumno} · ${fmtSoles(p.monto)}` });
      reload();
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudo aprobar el pago.');
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="Recaudado" value={fmtSoles(stats.recaudado)} icon="Wallet" iconColor="text-success" />
        <KpiCard label="Pendiente" value={fmtSoles(stats.pendiente)} icon="Hourglass" iconColor="text-warning" hint={`${stats.cntPend} pendientes`} />
        <KpiCard label="Vencidos" value={fmtSoles(stats.vencido)} icon="TriangleAlert" iconColor="text-danger" hint={`${stats.cntVenc} con mora`} />
        <KpiCard label="Por verificar" value={String(stats.cntPorVerif)} icon="Mail" iconColor="text-info" hint="Comprobantes a revisar" />
      </div>

      {/* Mini-gráfico: recaudación por mes (clic en barra filtra) */}
      {chartData.length > 0 && (
        <div className="bg-bg-card border border-border rounded-md p-4 sm:p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Icon name="Wallet" size={15} className="text-trilce-primary" />
              Recaudación por mes
            </h3>
            {mes !== null && (
              <button
                onClick={() => setMes(null)}
                className="text-[11px] text-trilce-primary font-semibold hover:underline cursor-pointer"
              >
                Ver todos los meses
              </button>
            )}
          </div>
          <p className="text-[11px] text-text-muted mb-2">Haz clic en un mes para filtrar la tabla.</p>
          <BarChartReport
            data={chartData}
            height={180}
            formatValue={fmtSoles}
            highlightMax={false}
            onBarClick={(d) => {
              const idx = MESES.indexOf(d.label);
              if (idx >= 0) setMes(mes === idx + 1 ? null : idx + 1);
            }}
            activeLabel={mes !== null ? MESES[mes - 1] : undefined}
          />
        </div>
      )}

      {/* Panel unificado de filtros */}
      <div className="bg-bg-card border border-border rounded-md overflow-hidden">
        {/* Header del panel */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-bg-muted/60 border-b border-border">
          <span className="text-[11px] font-bold tracking-widest text-text-muted inline-flex items-center gap-1.5">
            <Icon name="List" size={13} /> FILTROS
          </span>
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="text-[12px] text-text-secondary hover:text-danger font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors duration-200"
            >
              <Icon name="X" size={13} /> Limpiar
            </button>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3.5">
          {/* Fila: Estado + Buscar */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <FilterGroup label="Estado" tight>
              <div className="flex items-center gap-1 p-1 bg-bg-muted rounded-md overflow-x-auto w-fit">
                {TABS.map((t) => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`px-3 py-1.5 rounded-sm text-[13px] whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                      tab === t.key ? 'bg-trilce-primary text-text-on-primary font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </FilterGroup>
            <label className="flex items-center gap-2 px-3.5 py-2 bg-bg-muted rounded-md border border-transparent focus-within:border-trilce-primary/50 transition-colors lg:ml-auto lg:w-72">
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

          {/* Fila: Mes + Concepto como dropdowns */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {mesesConDatos.size > 0 && (
              <FilterGroup label="Mes" tight>
                <FilterSelect
                  value={mes === null ? '' : String(mes)}
                  onChange={(v) => setMes(v === '' ? null : Number(v))}
                >
                  <option value="">Todos los meses</option>
                  {MESES.map((m, i) => {
                    const num = i + 1;
                    if (!mesesConDatos.has(num)) return null;
                    return <option key={m} value={num}>{MESES_LARGOS[i]}</option>;
                  })}
                </FilterSelect>
              </FilterGroup>
            )}

            <FilterGroup label="Concepto" tight>
              <FilterSelect
                value={concepto}
                onChange={(v) => setConcepto(v as Concepto)}
              >
                {CONCEPTOS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </FilterSelect>
            </FilterGroup>
          </div>
        </div>
      </div>

      {/* Barra resumen de la selección */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 bg-trilce-primary-soft/50 border border-trilce-primary-light rounded-md px-4 py-2.5 text-[13px]">
          <span className="font-bold text-trilce-primary-dark">
            {mes !== null ? `${MESES[mes - 1]} · ` : ''}{resumen.count} {resumen.count === 1 ? 'pago' : 'pagos'}
          </span>
          <span className="text-text-secondary">
            Total mostrado: <b className="text-text-primary">{fmtSoles(resumen.total)}</b>
          </span>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-md p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-bg-muted flex items-center justify-center mb-3">
            <Icon name={tab === 'por_verificar' ? 'CircleCheck' : 'CreditCard'} size={24} className="text-text-muted" />
          </div>
          <p className="font-semibold text-text-primary">
            {hayFiltros
              ? 'Sin resultados para los filtros aplicados'
              : tab === 'por_verificar' ? 'No hay pagos por verificar'
              : tab === 'pagado'        ? 'Aún no hay pagos confirmados'
              : tab === 'vencido'       ? 'Sin pagos vencidos'
              : 'No hay pagos registrados'}
          </p>
          <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
            {hayFiltros
              ? 'Prueba cambiar el mes, el concepto o limpiar los filtros.'
              : tab === 'por_verificar'
              ? 'Cuando un apoderado suba el comprobante de un pago, aparecerá aquí para que lo apruebes.'
              : 'Los pagos se generan automáticamente al aprobar una matrícula.'}
          </p>
          {hayFiltros && (
            <button onClick={limpiarFiltros} className="mt-4 text-sm text-trilce-primary font-semibold hover:underline cursor-pointer">
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-md overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_140px_120px_140px_220px] gap-4 px-5 py-3 bg-bg-muted border-b border-border text-[11px] font-bold tracking-widest text-text-muted">
            <SortHeader label="ALUMNO / CONCEPTO" col="alumno" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            <SortHeader label="VENCIMIENTO" col="vencimiento" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            <SortHeader label="MONTO" col="monto" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
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

/* ─── Grupo de filtro: etiqueta + control ─── */
function FilterGroup({ label, children, tight }: { label: string; children: React.ReactNode; tight?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="text-[11px] font-bold tracking-wider text-text-muted w-[68px] shrink-0">
        {label.toUpperCase()}
      </span>
      <div className={`min-w-0 ${tight ? '' : 'flex-1'}`}>{children}</div>
    </div>
  );
}

/* ─── Select estilizado para filtros ─── */
function FilterSelect({
  value, onChange, children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const active = value !== '' && value !== 'todos';
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none cursor-pointer pl-3.5 pr-9 py-2 rounded-md text-[13px] font-semibold border transition-colors duration-200 outline-none focus:border-trilce-primary ${
          active
            ? 'bg-trilce-primary-soft border-trilce-primary-light text-trilce-primary-dark'
            : 'bg-bg-muted border-border text-text-secondary hover:border-trilce-primary/40'
        }`}
      >
        {children}
      </select>
      <Icon
        name="ChevronDown"
        size={15}
        className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${active ? 'text-trilce-primary' : 'text-text-muted'}`}
      />
    </div>
  );
}

/* ─── Encabezado ordenable ─── */
function SortHeader({
  label, col, sortKey, sortDir, onSort,
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === col;
  return (
    <button
      onClick={() => onSort(col)}
      className={`flex items-center gap-1 text-left cursor-pointer transition-colors duration-200 ${
        active ? 'text-trilce-primary' : 'hover:text-text-secondary'
      }`}
    >
      {label}
      <Icon
        name={active ? (sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
        size={12}
        className={active ? 'opacity-100' : 'opacity-40'}
      />
    </button>
  );
}

/* ─── Skeleton de carga ─── */
function TableSkeleton() {
  return (
    <div className="bg-bg-card border border-border rounded-md overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3.5 w-1/3 bg-bg-muted rounded animate-pulse" />
            <div className="h-2.5 w-1/4 bg-bg-muted rounded animate-pulse" />
          </div>
          <div className="h-3 w-20 bg-bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-bg-muted rounded animate-pulse" />
          <div className="h-5 w-16 bg-bg-muted rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function conceptoBadge(concepto: string) {
  if (concepto === 'matricula') return <Badge variant="info">Matrícula</Badge>;
  if (concepto === 'pension')   return <Badge variant="neutral">Pensión</Badge>;
  return <Badge variant="neutral">Otros</Badge>;
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
    <div className="grid grid-cols-2 md:grid-cols-[1fr_140px_120px_140px_220px] gap-x-3 gap-y-2 md:gap-4 px-4 sm:px-5 py-3 border-b border-border last:border-0 md:items-center text-sm hover:bg-bg-muted/40 transition-colors duration-150">
      <div className="col-span-2 md:col-span-1 flex flex-col gap-0.5 min-w-0">
        <span className="font-semibold text-text-primary truncate">
          {pago.alumno
            ? `${pago.alumno.nombres} ${pago.alumno.apellidos} · ${pago.alumno.grado} — ${pago.alumno.seccion}`
            : `Pago #${pago.id}`}
        </span>
        <span className="flex items-center gap-1.5 min-w-0">
          {conceptoBadge(pago.concepto)}
          <span className={`text-[11px] truncate ${pago.estado === 'vencido' ? 'text-danger' : 'text-text-muted'}`}>
            {pago.descripcion}
          </span>
        </span>
      </div>
      <span className={`text-[13px] order-2 md:order-none ${pago.estado === 'vencido' ? 'text-danger font-medium' : 'text-text-secondary'}`}>
        <span className="md:hidden text-[11px] text-text-muted mr-1">Vence:</span>
        {fmtFecha(pago.fecha_vencimiento)}
      </span>
      <span className="font-bold text-text-primary text-right md:text-left order-1 md:order-none">
        <span className="md:hidden text-[11px] text-text-muted mr-1 font-normal">Monto:</span>
        {fmtSoles(pago.monto)}
      </span>
      <span className="order-3 md:order-none">{estadoBadge}</span>
      <div className="flex flex-wrap justify-end md:justify-start gap-2 order-4 md:order-none">
        {pago.comprobante_url && (
          <button
            onClick={onVer}
            className="text-trilce-primary font-semibold hover:underline whitespace-nowrap text-xs flex items-center gap-1 cursor-pointer"
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
