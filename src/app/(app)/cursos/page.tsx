'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { CursoRow, eliminarCurso, useCursos } from '@/modules/academico/api';
import { EditarCursoModal } from '@/modules/academico/components/EditarCursoModal';
import { NuevoCursoModal } from '@/modules/academico/components/NuevoCursoModal';
import { inscripcionApi, type NivelCatalogo } from '@/modules/inscripcion/api';
import { Badge } from '@/shared/components/Badge';
import { useConfirm } from '@/shared/components/ConfirmProvider';
import { Icon } from '@/shared/components/Icon';
import { notify } from '@/shared/lib/notify';

type Grupo = {
  nombre: string;
  items: CursoRow[];
  totalGrados: number;
  totalSecciones: number;
  horasMin: number;
  horasMax: number;
};

export default function CursosPage() {
  const { token } = useAuth();
  const confirm = useConfirm();

  const [niveles, setNiveles] = useState<NivelCatalogo[]>([]);
  const [nivelId, setNivelId] = useState<number | null>(null);
  const [gradoId, setGradoId] = useState<number | null>(null);
  const [q, setQ] = useState('');

  const [openNuevo, setOpenNuevo] = useState(false);
  const [editando, setEditando] = useState<CursoRow | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  // Set de nombres expandidos manualmente. Se reinicia cuando cambian filtros
  // pesados (porque el auto-expand reemplaza la lógica del usuario).
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const filtros = useMemo(
    () => ({
      nivel_id: nivelId ?? undefined,
      grado_id: gradoId ?? undefined,
      q: q.trim() || undefined,
    }),
    [nivelId, gradoId, q],
  );
  const { data: cursos, isLoading, reload } = useCursos(filtros);

  useEffect(() => {
    inscripcionApi.catalogoNivelesGrados()
      .then((r) => setNiveles(r.data))
      .catch(() => setNiveles([]));
  }, []);

  const gradosDisponibles = useMemo(
    () => niveles.find((n) => n.id === nivelId)?.grados ?? [],
    [niveles, nivelId],
  );

  // Agrupar cursos por nombre
  const grupos = useMemo<Grupo[]>(() => {
    const mapa = new Map<string, CursoRow[]>();
    for (const c of cursos) {
      const key = c.nombre;
      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(c);
    }
    return Array.from(mapa.entries())
      .map(([nombre, items]) => {
        const horas = items.map((i) => i.horas_semana);
        return {
          nombre,
          items: items.sort((a, b) => (a.nivel_id ?? 0) - (b.nivel_id ?? 0) || a.grado.localeCompare(b.grado)),
          totalGrados: items.length,
          totalSecciones: items.reduce((s, i) => s + i.secciones_asignadas, 0),
          horasMin: Math.min(...horas),
          horasMax: Math.max(...horas),
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [cursos]);

  // Auto-expandir si hay filtro por grado (cada grupo tiene 1 item) o
  // si hay búsqueda activa.
  const autoExpand = gradoId !== null || q.trim().length > 0;

  function setNivelTab(id: number | null) {
    setNivelId(id);
    setGradoId(null);
    setExpandidos(new Set());
  }

  function toggleGrupo(nombre: string) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(nombre)) next.delete(nombre);
      else next.add(nombre);
      return next;
    });
  }

  function expandirTodos() {
    setExpandidos(new Set(grupos.map((g) => g.nombre)));
  }

  function colapsarTodos() {
    setExpandidos(new Set());
  }

  async function handleEliminar(c: CursoRow) {
    if (!token) return;
    const desc = c.secciones_asignadas > 0
      ? `${c.nombre} (${c.nivel} · ${c.grado}) está asignado en ${c.secciones_asignadas} sección(es). Al eliminar quedará oculto, pero las asignaciones existentes se conservan por historial.`
      : `Se eliminará el curso "${c.nombre}" del grado ${c.grado}.`;

    const ok = await confirm({
      title: '¿Eliminar este curso?',
      description: desc,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      icon: 'Trash2',
    });
    if (!ok) return;

    setEliminandoId(c.id);
    const tid = notify.loading('Eliminando curso…');
    try {
      const res = await eliminarCurso(token, c.id);
      notify.dismiss(tid);
      notify.success({ title: 'Curso eliminado', description: res.message });
      reload();
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudo eliminar el curso.');
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Cursos</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {grupos.length} cursos únicos · {cursos.length} instancias por grado
          </p>
        </div>
        <button
          onClick={() => setOpenNuevo(true)}
          className="bg-trilce-primary hover:bg-trilce-primary-dark text-white font-semibold px-4 py-2 rounded-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Icon name="Plus" size={16} /> Nuevo curso
        </button>
      </header>

      {/* Tabs por nivel */}
      <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 bg-bg-card rounded-md border border-border overflow-x-auto">
        <TabButton active={nivelId === null} onClick={() => setNivelTab(null)}>
          Todos
        </TabButton>
        {niveles.map((n) => (
          <TabButton key={n.id} active={nivelId === n.id} onClick={() => setNivelTab(n.id)}>
            {n.nombre}
          </TabButton>
        ))}
      </div>

      {/* Filtros secundarios */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          value={gradoId ?? ''}
          onChange={(e) => setGradoId(e.target.value ? Number(e.target.value) : null)}
          disabled={!nivelId}
          className="px-3 py-2 border border-border rounded-sm text-sm bg-bg-card disabled:opacity-50 focus:outline-none focus:border-trilce-primary min-w-[180px]"
        >
          <option value="">Todos los grados</option>
          {gradosDisponibles.map((g) => (
            <option key={g.id} value={g.id}>{g.nombre}</option>
          ))}
        </select>

        <label className="flex-1 max-w-md flex items-center gap-2 px-3 py-2 bg-bg-card rounded-sm border border-border">
          <Icon name="Search" size={16} className="text-text-muted flex-shrink-0" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o código…"
            className="flex-1 min-w-0 bg-transparent text-sm outline-none"
          />
        </label>

        {!autoExpand && grupos.length > 0 && (
          <div className="flex gap-1 sm:ml-auto">
            <button
              onClick={expandirTodos}
              className="text-xs text-text-secondary hover:text-trilce-primary font-semibold px-3 py-2"
            >
              Expandir todos
            </button>
            <button
              onClick={colapsarTodos}
              className="text-xs text-text-secondary hover:text-trilce-primary font-semibold px-3 py-2"
            >
              Colapsar todos
            </button>
          </div>
        )}
      </div>

      {/* Lista agrupada */}
      <div className="bg-bg-card border border-border rounded-md">
        {isLoading ? (
          <p className="p-8 text-center text-text-muted text-sm">Cargando cursos…</p>
        ) : grupos.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-bg-muted flex items-center justify-center mb-3">
              <Icon name="BookOpen" size={24} className="text-text-muted" />
            </div>
            <p className="font-semibold text-text-primary">
              {q ? `Sin resultados para "${q}"` : 'No hay cursos con estos filtros'}
            </p>
            <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
              Crea el primer curso con el botón superior o ajusta los filtros.
            </p>
          </div>
        ) : (
          grupos.map((g) => (
            <GrupoCurso
              key={g.nombre}
              grupo={g}
              expanded={autoExpand || expandidos.has(g.nombre)}
              forceExpanded={autoExpand}
              onToggle={() => toggleGrupo(g.nombre)}
              onEditar={setEditando}
              onEliminar={handleEliminar}
              eliminandoId={eliminandoId}
            />
          ))
        )}
      </div>

      <NuevoCursoModal open={openNuevo} onClose={() => setOpenNuevo(false)} onCreated={reload} />
      <EditarCursoModal
        open={editando !== null}
        curso={editando}
        onClose={() => setEditando(null)}
        onUpdated={reload}
      />
    </div>
  );
}

/* ──────────────────────────── subcomponentes ──────────────────────────── */

function TabButton({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 sm:px-4 py-2 rounded-sm text-[13px] whitespace-nowrap transition-colors ${
        active ? 'bg-trilce-primary text-text-on-primary font-semibold' : 'text-text-secondary hover:bg-bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

function GrupoCurso({
  grupo, expanded, forceExpanded, onToggle, onEditar, onEliminar, eliminandoId,
}: {
  grupo: Grupo;
  expanded: boolean;
  forceExpanded: boolean;
  onToggle: () => void;
  onEditar: (c: CursoRow) => void;
  onEliminar: (c: CursoRow) => void;
  eliminandoId: number | null;
}) {
  const horasLabel = grupo.horasMin === grupo.horasMax
    ? `${grupo.horasMin}h`
    : `${grupo.horasMin}–${grupo.horasMax}h`;

  return (
    <div className="border-b border-border last:border-0">
      {/* Header del grupo */}
      <button
        onClick={onToggle}
        disabled={forceExpanded}
        className="w-full text-left px-5 py-4 hover:bg-bg-muted flex items-center gap-3 disabled:cursor-default disabled:hover:bg-transparent"
      >
        <Icon
          name="ChevronDown"
          size={16}
          className={`text-text-muted flex-shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-text-primary">{grupo.nombre}</div>
          <div className="text-xs text-text-muted mt-0.5">
            {grupo.totalGrados} grado{grupo.totalGrados === 1 ? '' : 's'} · {horasLabel}/sem
            {grupo.totalSecciones > 0 && ` · ${grupo.totalSecciones} sección${grupo.totalSecciones === 1 ? '' : 'es'} lo dicta${grupo.totalSecciones === 1 ? '' : 'n'}`}
          </div>
        </div>
        {grupo.totalSecciones > 0 ? (
          <Badge variant="info">{grupo.totalSecciones} en uso</Badge>
        ) : (
          <Badge variant="neutral">Sin asignar</Badge>
        )}
      </button>

      {/* Filas hijas */}
      {expanded && (
        <div className="bg-bg-muted/40">
          <div className="hidden md:grid grid-cols-[1fr_180px_140px_70px_120px_110px] gap-4 px-5 pl-12 py-2 border-t border-border text-[10px] font-bold tracking-widest text-text-muted">
            <span>GRADO</span><span>CÓDIGO</span><span>NIVEL</span><span>HORAS</span><span>SECCIONES</span><span className="text-right">ACCIONES</span>
          </div>
          {grupo.items.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-2 md:grid-cols-[1fr_180px_140px_70px_120px_110px] gap-x-3 gap-y-1 md:gap-4 px-5 pl-12 py-2.5 border-t border-border text-sm items-center"
            >
              <span className="col-span-2 md:col-span-1 text-text-primary font-medium">
                {c.grado}
              </span>
              <span className="text-text-muted text-xs font-mono">
                <span className="md:hidden text-[10px] mr-1">Código:</span>{c.codigo}
              </span>
              <span className="text-text-secondary text-xs">{c.nivel}</span>
              <span className="text-text-secondary">{c.horas_semana}h</span>
              <span>
                {c.secciones_asignadas > 0 ? (
                  <Badge variant="info">{c.secciones_asignadas}</Badge>
                ) : (
                  <span className="text-text-muted text-xs">—</span>
                )}
              </span>
              <span className="col-span-2 md:col-span-1 flex gap-1 md:justify-end mt-2 md:mt-0">
                <button
                  onClick={() => onEditar(c)}
                  className="p-1.5 rounded-sm text-text-secondary hover:text-trilce-primary hover:bg-bg-card"
                  title="Editar"
                >
                  <Icon name="Pencil" size={14} />
                </button>
                <button
                  onClick={() => onEliminar(c)}
                  disabled={eliminandoId === c.id}
                  className="p-1.5 rounded-sm text-text-secondary hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                  title="Eliminar"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
