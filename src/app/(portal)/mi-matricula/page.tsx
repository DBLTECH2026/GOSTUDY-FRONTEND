'use client';

import { useMiMatricula, useMiPerfil } from '@/modules/portal/api';
import { Badge } from '@/shared/components/Badge';
import { Icon } from '@/shared/components/Icon';
import { fmtFecha } from '@/shared/lib/format';

export default function MiMatriculaPage() {
  const { data: matricula, isLoading } = useMiMatricula();
  const { data: perfil } = useMiPerfil();

  if (isLoading || !matricula) return <p className="text-text-secondary">Cargando matrícula…</p>;

  const titular = perfil?.apoderados.find((a) => a.es_titular) ?? perfil?.apoderados[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <div className="bg-trilce-primary text-text-on-primary rounded-lg p-5 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-[11px] font-bold tracking-widest bg-trilce-primary-dark px-2.5 py-1 rounded-sm self-start">
            MATRÍCULA ACTIVA
          </span>
          <h2 className="text-xl sm:text-2xl font-bold">
            Estás matriculado en {matricula.grado} {matricula.nivel} — {matricula.seccion}
          </h2>
          <p className="text-xs sm:text-sm text-trilce-primary-light">
            {matricula.periodo_descripcion} — desde el {fmtFecha(matricula.fecha_matricula)}
          </p>
        </div>
        <div className="text-left md:text-right flex-shrink-0">
          <div className="text-lg sm:text-xl font-bold">INS-{String(matricula.id).padStart(8, '0')}</div>
          <div className="text-[11px] text-trilce-primary-light">Código de matrícula</div>
        </div>
      </div>

      {/* 2 columnas: datos académicos + apoderado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <SectionHeader icon="GraduationCap" title="Datos académicos" />
          <DataRow label="Periodo" value={matricula.periodo_descripcion} />
          <DataRow label="Nivel y grado" value={`${matricula.nivel} — ${matricula.grado}`} />
          <DataRow label="Sección" value={matricula.seccion} />
          <DataRow label="Tutor" value={`Prof. ${matricula.tutor_nombres ?? ''} ${matricula.tutor_apellidos ?? ''}`} />
          <DataRow label="Fecha matrícula" value={fmtFecha(matricula.fecha_matricula)} />
          <div className="flex justify-between pt-1">
            <span className="text-sm text-text-secondary">Estado</span>
            <Badge variant="success">Activa</Badge>
          </div>
        </Card>

        <Card>
          <SectionHeader icon="Users" title="Apoderado principal" />
          {titular && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-trilce-primary-soft flex items-center justify-center text-trilce-primary font-bold text-sm">
                  {(titular.nombres[0] ?? '') + (titular.apellidos?.[0] ?? '')}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">
                    {titular.nombres} {titular.apellidos ?? ''}
                  </div>
                  <div className="text-[11px] text-text-muted capitalize">{titular.tipo}</div>
                </div>
              </div>
              <DataRow label="DNI" value={titular.dni} />
              <DataRow label="Teléfono" value={titular.telefono ?? '—'} />
              {titular.parentesco && <DataRow label="Parentesco" value={titular.parentesco} />}
            </>
          )}
        </Card>
      </div>

      {/* Documentos */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader icon="Folder" title="Documentos cargados" />
          <span className="text-xs text-text-muted">3 documentos</span>
        </div>
        <DocRow nombre="Partida de nacimiento.pdf" />
        <DocRow nombre="DNI escaneado.pdf" />
        <DocRow nombre="Certificado de estudios.pdf" />
      </Card>
    </div>
  );
}

/* ─── locales ─── */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6 flex flex-col gap-3">
      {children}
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: 'GraduationCap' | 'Users' | 'Folder'; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-1">
      <Icon name={icon} className="text-trilce-primary" />
      <h2 className="text-base font-bold text-text-primary">{title}</h2>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function DocRow({ nombre }: { nombre: string }) {
  return (
    <div className="flex items-center justify-between bg-bg-muted rounded-sm px-3 sm:px-4 py-3 mt-1 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Icon name="FileText" size={20} className="text-trilce-primary flex-shrink-0" />
        <span className="text-sm font-semibold text-text-primary truncate">{nombre}</span>
      </div>
      <button className="text-xs font-semibold text-trilce-primary hover:underline whitespace-nowrap flex-shrink-0">Descargar</button>
    </div>
  );
}

