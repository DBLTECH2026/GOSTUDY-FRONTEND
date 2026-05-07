'use client';

import { useMiPerfil } from '@/modules/portal/api';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';

export default function MiPerfilPage() {
  const { data, isLoading } = useMiPerfil();
  if (isLoading || !data) return <p className="text-text-secondary">Cargando perfil…</p>;
  const { estudiante, apoderados } = data;

  const titularInitials =
    `${estudiante.nombres.split(' ')[0][0]}${estudiante.apellidos.split(' ')[0][0]}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Hero perfil */}
      <div className="bg-trilce-primary text-text-on-primary rounded-lg p-8 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-trilce-primary-dark flex items-center justify-center text-4xl font-bold">
          {titularInitials}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{estudiante.nombres} {estudiante.apellidos}</h1>
          <p className="text-sm text-trilce-primary-light mt-1">
            Código {estudiante.codigo_estudiante}
          </p>
        </div>
      </div>

      {/* Datos personales */}
      <div className="bg-bg-card border border-border rounded-md p-6 flex flex-col gap-4">
        <header className="flex items-center gap-2.5">
          <Icon name="User" className="text-trilce-primary" />
          <h2 className="text-base font-bold text-text-primary">Datos personales</h2>
        </header>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="DNI" value={estudiante.dni} />
          <Field label="Fecha de nacimiento" value={estudiante.fecha_nacimiento} />
          <Field label="Sexo" value={estudiante.sexo === 'M' ? 'Masculino' : 'Femenino'} />
          <Field label="I.E. de procedencia" value={estudiante.ie_procedencia ?? '—'} />
          <Field label="Dirección" value={estudiante.direccion ?? '—'} />
          <Field label="Departamento" value={estudiante.departamento ?? '—'} />
          <Field label="Provincia" value={estudiante.provincia ?? '—'} />
          <Field label="Distrito" value={estudiante.distrito ?? '—'} />
        </div>
      </div>

      {/* Apoderados */}
      <div className="bg-bg-card border border-border rounded-md p-6 flex flex-col gap-3">
        <header className="flex items-center gap-2.5">
          <Icon name="Users" className="text-trilce-primary" />
          <h2 className="text-base font-bold text-text-primary">Apoderados</h2>
        </header>
        <div className="grid grid-cols-3 gap-4">
          {apoderados.map((a) => (
            <article key={a.id} className="bg-bg-muted rounded-sm p-4 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold tracking-widest text-trilce-primary">
                {a.tipo.toUpperCase()}
              </span>
              <span className="text-sm font-semibold text-text-primary">
                {a.nombres} {a.apellidos ? a.apellidos : a.parentesco ? `(${a.parentesco})` : ''}
              </span>
              <span className="text-xs text-text-secondary">DNI {a.dni}</span>
              <span className="text-xs text-text-secondary">{a.telefono ?? '—'}</span>
            </article>
          ))}
        </div>
      </div>

      {/* Cambiar PIN */}
      <div className="bg-bg-card border border-border rounded-md p-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Cambiar PIN de acceso</h3>
          <p className="text-xs text-text-secondary mt-1">
            Modifica tu PIN de 6 dígitos para entrar al portal.
          </p>
        </div>
        <Button variant="primary">
          <Icon name="KeyRound" size={16} /> Cambiar PIN
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold tracking-wide text-text-muted">
        {label.toUpperCase()}
      </span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}
