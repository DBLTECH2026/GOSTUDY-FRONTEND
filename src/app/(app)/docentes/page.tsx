'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { DocenteRow, eliminarDocente, useDocentes } from '@/modules/personas/api';
import { EditarDocenteModal } from '@/modules/personas/components/EditarDocenteModal';
import { NuevoDocenteModal } from '@/modules/personas/components/NuevoDocenteModal';
import { Badge } from '@/shared/components/Badge';
import { useConfirm } from '@/shared/components/ConfirmProvider';
import { Icon } from '@/shared/components/Icon';
import { notify } from '@/shared/lib/notify';

export default function DocentesPage() {
  const { token } = useAuth();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const [openNuevo, setOpenNuevo] = useState(false);
  const [editando, setEditando] = useState<DocenteRow | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const { data: docentes, isLoading, reload } = useDocentes(q);

  async function handleEliminar(d: DocenteRow) {
    if (!token) return;
    const ok = await confirm({
      title: '¿Eliminar este docente?',
      description: `${d.nombre_completo} no podrá iniciar sesión. Esta acción solo es reversible desde la base de datos.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      icon: 'Trash2',
    });
    if (!ok) return;

    setEliminandoId(d.id);
    const tid = notify.loading('Eliminando docente…');
    try {
      await eliminarDocente(token, d.id);
      notify.dismiss(tid);
      notify.success({ title: 'Docente eliminado', description: d.nombre_completo });
      reload();
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudo eliminar el docente.');
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Docentes</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Personal docente del Colegio Trilce ({docentes.length})
          </p>
        </div>
        <button
          onClick={() => setOpenNuevo(true)}
          className="bg-trilce-primary hover:bg-trilce-primary-dark text-white font-semibold px-4 py-2 rounded-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Icon name="Plus" size={16} /> Nuevo docente
        </button>
      </header>

      <div className="bg-bg-card border border-border rounded-md">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar docente…"
              className="w-full pl-9 pr-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-text-muted text-sm">Cargando…</p>
        ) : docentes.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-bg-muted flex items-center justify-center mb-3">
              <Icon name="Users" size={24} className="text-text-muted" />
            </div>
            <p className="font-semibold text-text-primary">
              {q ? 'Sin resultados' : 'No hay docentes registrados'}
            </p>
            <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
              {q ? `Ningún docente coincide con "${q}".` : 'Crea el primer docente con el botón superior.'}
            </p>
          </div>
        ) : (
          <div className="hidden md:grid grid-cols-[1fr_220px_140px_120px_110px_120px] gap-4 px-5 py-3 bg-bg-muted border-b border-border text-[11px] font-bold tracking-widest text-text-muted">
            <span>DOCENTE</span><span>EMAIL</span><span>ESPECIALIDAD</span><span>CÓDIGO</span><span>ESTADO</span><span className="text-right">ACCIONES</span>
          </div>
        )}
        {docentes.map((d) => (
          <div
            key={d.id}
            className="grid grid-cols-2 md:grid-cols-[1fr_220px_140px_120px_110px_120px] gap-x-3 gap-y-1 md:gap-4 px-5 py-3 border-b border-border last:border-0 text-sm items-center"
          >
            <span className="col-span-2 md:col-span-1 font-semibold text-text-primary">{d.nombre_completo}</span>
            <span className="text-text-secondary truncate">
              <span className="md:hidden text-[11px] text-text-muted mr-1">Email:</span>
              {d.email}
            </span>
            <span className="text-text-secondary text-xs">{d.especialidad ?? '—'}</span>
            <span className="text-text-muted text-xs font-mono">{d.codigo_docente}</span>
            <span>
              <Badge variant={d.estado === 'activo' ? 'success' : 'neutral'}>
                {d.estado.toUpperCase()}
              </Badge>
            </span>
            <span className="col-span-2 md:col-span-1 flex gap-1 md:justify-end mt-2 md:mt-0">
              <button
                onClick={() => setEditando(d)}
                className="p-2 rounded-sm text-text-secondary hover:text-trilce-primary hover:bg-bg-muted"
                title="Editar"
              >
                <Icon name="Pencil" size={16} />
              </button>
              <button
                onClick={() => handleEliminar(d)}
                disabled={eliminandoId === d.id}
                className="p-2 rounded-sm text-text-secondary hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                title="Eliminar"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </span>
          </div>
        ))}
      </div>

      <NuevoDocenteModal open={openNuevo} onClose={() => setOpenNuevo(false)} onCreated={reload} />
      <EditarDocenteModal
        open={editando !== null}
        docente={editando}
        onClose={() => setEditando(null)}
        onUpdated={reload}
      />
    </div>
  );
}
