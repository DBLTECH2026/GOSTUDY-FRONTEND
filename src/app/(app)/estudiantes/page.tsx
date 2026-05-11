'use client';

import { useState } from 'react';
import { useEstudiantes } from '@/modules/personas/api';
import { NuevoEstudianteModal } from '@/modules/personas/components/NuevoEstudianteModal';
import { Badge } from '@/shared/components/Badge';
import { Icon } from '@/shared/components/Icon';

export default function EstudiantesPage() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const { data: estudiantes, isLoading, reload } = useEstudiantes(q);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Estudiantes</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Padrón de estudiantes registrados ({estudiantes.length})
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-trilce-primary hover:bg-trilce-primary-dark text-white font-semibold px-4 py-2 rounded-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Icon name="Plus" size={16} /> Nuevo estudiante
        </button>
      </header>

      <div className="bg-bg-card border border-border rounded-md">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, DNI o código…"
              className="w-full pl-9 pr-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-trilce-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-text-muted text-sm">Cargando…</p>
        ) : estudiantes.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-bg-muted flex items-center justify-center mb-3">
              <Icon name="GraduationCap" size={24} className="text-text-muted" />
            </div>
            <p className="font-semibold text-text-primary">
              {q ? 'Sin resultados' : 'No hay estudiantes registrados'}
            </p>
            <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
              {q
                ? `Ningún estudiante coincide con "${q}".`
                : 'Los estudiantes aparecen aquí cuando se aprueba una inscripción o cuando creas uno manualmente.'}
            </p>
          </div>
        ) : (
          <div className="hidden md:grid grid-cols-[1fr_120px_180px_100px_110px] gap-4 px-5 py-3 bg-bg-muted border-b border-border text-[11px] font-bold tracking-widest text-text-muted">
            <span>ESTUDIANTE</span><span>DNI</span><span>CÓDIGO</span><span>SEXO</span><span>ESTADO</span>
          </div>
        )}
        {estudiantes.map((e) => (
          <div
            key={e.id}
            className="grid grid-cols-2 md:grid-cols-[1fr_120px_180px_100px_110px] gap-x-3 gap-y-1 md:gap-4 px-5 py-3 border-b border-border last:border-0 text-sm items-center"
          >
            <span className="col-span-2 md:col-span-1 font-semibold text-text-primary">{e.nombre_completo}</span>
            <span className="text-text-secondary">
              <span className="md:hidden text-[11px] text-text-muted mr-1">DNI:</span>
              {e.dni}
            </span>
            <span className="text-text-muted text-xs font-mono">{e.codigo_estudiante}</span>
            <span className="text-text-secondary">{e.sexo === 'M' ? 'Masc.' : 'Fem.'}</span>
            <span>
              <Badge variant={e.estado === 'activo' ? 'success' : 'neutral'}>
                {e.estado.toUpperCase()}
              </Badge>
            </span>
          </div>
        ))}
      </div>

      <NuevoEstudianteModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={reload}
      />
    </div>
  );
}
