'use client';

import { useState } from 'react';
import { useMatriculas } from '@/modules/matricula/api';
import { NuevaMatriculaModal } from '@/modules/matricula/components/NuevaMatriculaModal';
import { Badge } from '@/shared/components/Badge';
import { Icon } from '@/shared/components/Icon';
import { fmtFecha } from '@/shared/lib/format';

export default function MatriculaPage() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const { data: matriculas, isLoading, reload } = useMatriculas(q);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Matrícula</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Matrículas activas del periodo ({matriculas.length})
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-trilce-primary hover:bg-trilce-primary-dark text-white font-semibold px-4 py-2 rounded-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Icon name="Plus" size={16} /> Generar matrícula
        </button>
      </header>

      <div className="bg-bg-card border border-border rounded-md">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por estudiante, DNI o código…"
              className="w-full pl-9 pr-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-text-muted text-sm">Cargando…</p>
        ) : matriculas.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-bg-muted flex items-center justify-center mb-3">
              <Icon name="Folder" size={24} className="text-text-muted" />
            </div>
            <p className="font-semibold text-text-primary">
              {q ? 'Sin resultados' : 'No hay matrículas registradas'}
            </p>
            <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
              {q
                ? `Ninguna matrícula coincide con "${q}".`
                : 'Las matrículas se crean al aprobar inscripciones o manualmente con el botón superior.'}
            </p>
          </div>
        ) : (
          <div className="hidden md:grid grid-cols-[1fr_140px_180px_140px_110px] gap-4 px-5 py-3 bg-bg-muted border-b border-border text-[11px] font-bold tracking-widest text-text-muted">
            <span>ESTUDIANTE</span><span>NIVEL / GRADO</span><span>SECCIÓN</span><span>FECHA</span><span>ESTADO</span>
          </div>
        )}
        {matriculas.map((m) => (
          <div
            key={m.id}
            className="grid grid-cols-2 md:grid-cols-[1fr_140px_180px_140px_110px] gap-x-3 gap-y-1 md:gap-4 px-5 py-3 border-b border-border last:border-0 text-sm items-center"
          >
            <div className="col-span-2 md:col-span-1">
              <div className="font-semibold text-text-primary">{m.estudiante.nombre_completo}</div>
              <div className="text-[11px] text-text-muted">DNI {m.estudiante.dni} · {m.estudiante.codigo_estudiante}</div>
            </div>
            <span className="text-text-secondary">{m.nivel} · {m.grado}</span>
            <span className="text-text-secondary">{m.seccion} · {m.periodo}</span>
            <span className="text-text-secondary text-xs">{fmtFecha(m.fecha_matricula)}</span>
            <span>
              <Badge variant={m.estado === 'activa' ? 'success' : m.estado === 'retirada' ? 'danger' : 'neutral'}>
                {m.estado.toUpperCase()}
              </Badge>
            </span>
          </div>
        ))}
      </div>

      <NuevaMatriculaModal open={open} onClose={() => setOpen(false)} onCreated={reload} />
    </div>
  );
}
