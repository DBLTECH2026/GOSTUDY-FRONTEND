'use client';

import Link from 'next/link';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useMisPagos } from '@/modules/pagos/api';
import { useMiMatricula, useMisCursos } from '@/modules/portal/api';
import { Icon } from '@/shared/components/Icon';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { fmtSoles, diasHasta } from '@/shared/lib/format';

export default function PortalInicioPage() {
  const { user } = useAuth();
  const { data: pagos } = useMisPagos();
  const { data: matricula } = useMiMatricula();
  const { data: cursos } = useMisCursos();

  const proximoPago = pagos?.find((p) => p.estado === 'pendiente');
  const cursosCount = cursos?.length ?? 0;
  const horasTotales = cursos?.reduce((s, c) => s + c.horas_semana, 0) ?? 0;

  const firstName = user?.nombres.split(' ')[0] ?? '';
  const initials = user
    ? `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase()
    : '··';

  return (
    <div className="flex flex-col gap-6">
      {/* Hero saludo */}
      <div className="bg-trilce-accent text-white rounded-lg p-5 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-trilce-primary flex items-center justify-center text-white font-bold text-xl sm:text-2xl flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            {user?.codigo_estudiante && (
              <Badge variant="primary" className="mb-2">
                {user.codigo_estudiante}
              </Badge>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold">
              ¡Hola{firstName ? `, ${firstName}` : ''}! 👋
            </h1>
            <p className="text-white/70 text-xs sm:text-sm mt-1">
              Bienvenido a tu portal estudiantil.
            </p>
          </div>
        </div>
        <Link href="/mi-perfil" className="self-start md:self-auto">
          <Button variant="on-dark">
            Ver mi perfil <Icon name="ArrowRight" size={16} />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatBlock icon="CircleCheck" label="Asistencia" value="—" />
        <StatBlock icon="BookOpen" label="Cursos" value={cursosCount > 0 ? String(cursosCount) : '—'} />
        <StatBlock icon="GraduationCap" label="Horas/sem" value={horasTotales > 0 ? String(horasTotales) : '—'} />
        <StatBlock
          icon="Wallet"
          label="Próximo pago"
          value={proximoPago ? fmtSoles(proximoPago.monto).replace(/\.00$/, '') : '—'}
          tone="primary"
        />
      </div>

      {/* 2 columnas: matrícula + próximo pago */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        {/* Mi matrícula activa */}
        <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Mi matrícula</h2>
            {matricula && <Badge variant="success">ACTIVA</Badge>}
          </div>
          {matricula ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Periodo" value={matricula.periodo_descripcion} />
              <Field label="Grado" value={`${matricula.grado} ${matricula.nivel}`} />
              <Field label="Sección" value={matricula.seccion} />
              <Field
                label="Tutor"
                value={`Prof. ${matricula.tutor_nombres ?? ''} ${matricula.tutor_apellidos ?? ''}`}
              />
            </div>
          ) : (
            <EmptyMsg
              icon="FileText"
              title="Aún no tienes matrícula activa"
              text="Cuando un administrador apruebe tu inscripción y genere tu matrícula, los datos aparecerán aquí."
            />
          )}
        </div>

        {/* Próximo pago */}
        <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold">Próximo pago</h2>
          {proximoPago ? (
            <>
              <div>
                <div className="text-3xl font-bold text-text-primary">{fmtSoles(proximoPago.monto)}</div>
                <div className="text-xs text-text-secondary mt-1">
                  {proximoPago.descripcion} — vence en {diasHasta(proximoPago.fecha_vencimiento)} días
                </div>
              </div>
              <Link href="/mis-pagos">
                <Button variant="primary" className="w-full">
                  Ver detalle de pagos
                </Button>
              </Link>
            </>
          ) : (
            <EmptyMsg
              icon="Wallet"
              title="Sin pagos pendientes"
              text="Cuando se generen tus pagos, los verás aquí."
            />
          )}
        </div>
      </div>

      {/* Mis cursos */}
      <div className="bg-bg-card border border-border rounded-md p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Mis cursos</h2>
          {cursos.length > 0 && (
            <Link href="/mis-cursos" className="text-xs font-semibold text-trilce-primary hover:underline">
              Ver todos →
            </Link>
          )}
        </div>
        {cursos.length === 0 ? (
          <EmptyMsg
            icon="BookOpen"
            title="Aún no tienes cursos asignados"
            text="Los cursos aparecerán cuando se genere tu matrícula del periodo."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cursos.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href="/mis-cursos"
                className="bg-bg-muted rounded-sm p-3 flex flex-col gap-1 hover:bg-trilce-primary-soft transition-colors"
              >
                <div className="w-8 h-8 rounded-sm bg-trilce-primary-soft flex items-center justify-center mb-1">
                  <Icon name="BookOpen" size={16} className="text-trilce-primary" />
                </div>
                <span className="text-xs font-bold">{c.nombre}</span>
                <span className="text-[10px] text-text-muted">
                  {c.horas_semana}h · Prof. {c.docente_apellidos}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold tracking-wide text-text-muted mb-1">
        {label.toUpperCase()}
      </div>
      <div className="text-sm font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: 'CircleCheck' | 'BookOpen' | 'GraduationCap' | 'Wallet';
  label: string;
  value: string;
  tone?: 'success' | 'primary' | 'neutral';
}) {
  const toneCls =
    tone === 'success'
      ? 'text-success'
      : tone === 'primary'
      ? 'text-trilce-primary'
      : 'text-text-secondary';
  return (
    <div className="bg-bg-card border border-border rounded-md p-4 flex items-center gap-3 sm:gap-4 min-w-0">
      <div className="w-10 h-10 rounded-sm bg-bg-muted flex items-center justify-center">
        <Icon name={icon} className={toneCls} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="text-lg font-bold text-text-primary">{value}</span>
      </div>
    </div>
  );
}

function EmptyMsg({
  icon,
  title,
  text,
}: {
  icon: 'FileText' | 'Wallet' | 'BookOpen';
  title: string;
  text: string;
}) {
  return (
    <div className="text-center py-6">
      <div className="w-12 h-12 mx-auto rounded-full bg-bg-muted flex items-center justify-center mb-3">
        <Icon name={icon} size={22} className="text-text-muted" />
      </div>
      <p className="font-semibold text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">{text}</p>
    </div>
  );
}
