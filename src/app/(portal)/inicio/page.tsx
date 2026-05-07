'use client';

import Link from 'next/link';
import { useMisPagos } from '@/modules/pagos/api';
import { useMiMatricula, useMisCursos } from '@/modules/portal/api';
import { Icon } from '@/shared/components/Icon';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { fmtSoles, diasHasta } from '@/shared/lib/format';

export default function PortalInicioPage() {
  const { data: pagos } = useMisPagos();
  const { data: matricula } = useMiMatricula();
  const { data: cursos } = useMisCursos();

  const proximoPago = pagos?.find((p) => p.estado === 'pendiente');
  const cursosCompletados = cursos?.length ?? 0;
  const horasTotales = cursos?.reduce((s, c) => s + c.horas_semana, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero saludo */}
      <div className="bg-trilce-accent text-white rounded-lg p-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-md bg-trilce-primary flex items-center justify-center text-white font-bold text-2xl">
            JP
          </div>
          <div>
            <Badge variant="primary" className="mb-2">3RO PRIMARIA — SECCIÓN A</Badge>
            <h1 className="text-3xl font-bold">¡Hola, Juan! 👋</h1>
            <p className="text-white/70 text-sm mt-1">
              {proximoPago
                ? `Bienvenido a tu portal. Tu próxima cuota vence en ${diasHasta(proximoPago.fecha_vencimiento)} días.`
                : 'Bienvenido a tu portal.'}
            </p>
          </div>
        </div>
        <Link href="/mi-perfil">
          <Button variant="on-dark">
            Ver mi perfil <Icon name="ArrowRight" size={16} />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        <StatBlock icon="CircleCheck" label="Asistencia" value="96%" tone="success" />
        <StatBlock icon="BookOpen" label="Cursos" value={String(cursosCompletados)} />
        <StatBlock icon="GraduationCap" label="Horas/sem" value={String(horasTotales)} />
        <StatBlock icon="Wallet" label="Próximo pago" value={proximoPago ? fmtSoles(proximoPago.monto).replace(/\.00$/, '') : '—'} tone="primary" />
      </div>

      {/* 2 columnas: matrícula + próximo pago */}
      <div className="grid grid-cols-[2fr_1fr] gap-5">
        {/* Mi matrícula activa */}
        <div className="bg-bg-card border border-border rounded-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Mi matrícula activa</h2>
            <Badge variant="success">ACTIVA</Badge>
          </div>
          {matricula && (
            <div className="grid grid-cols-2 gap-4 mb-5">
              <Field label="Periodo" value={matricula.periodo_descripcion} />
              <Field label="Grado" value={`${matricula.grado} ${matricula.nivel}`} />
              <Field label="Sección" value={matricula.seccion} />
              <Field label="Tutor" value={`Prof. ${matricula.tutor_nombres ?? ''} ${matricula.tutor_apellidos ?? ''}`} />
            </div>
          )}
          {/* Mis cursos preview */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">Mis cursos</h3>
              <Link href="/mis-cursos" className="text-xs font-semibold text-trilce-primary hover:underline">Ver todos →</Link>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {cursos?.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href="/mis-cursos"
                  className="bg-bg-muted rounded-sm p-3 flex flex-col gap-1 hover:bg-trilce-primary-soft transition-colors"
                >
                  <div className="w-8 h-8 rounded-sm bg-trilce-primary-soft flex items-center justify-center mb-1">
                    <Icon name="BookOpen" size={16} className="text-trilce-primary" />
                  </div>
                  <span className="text-xs font-bold">{c.nombre}</span>
                  <span className="text-[10px] text-text-muted">{c.horas_semana}h · Prof. {c.docente_apellidos}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Próximo pago */}
        <div className="bg-bg-card border border-border rounded-md p-6 flex flex-col gap-4">
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
                <Button variant="primary" className="w-full">Ver detalle de pagos</Button>
              </Link>
            </>
          ) : (
            <p className="text-text-secondary text-sm">No tienes pagos próximos.</p>
          )}

          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-bold tracking-wide text-text-muted mb-3">AVISOS DEL COLEGIO</h3>
            <ul className="flex flex-col gap-3 text-xs">
              <li><b>Reunión APAFA</b> · Sábado 16 May</li>
              <li><b>Día del logro 2026</b> · ceremonia inauguración</li>
              <li><b>Vacuna escolar</b> · calendario disponible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold tracking-wide text-text-muted mb-1">{label.toUpperCase()}</div>
      <div className="text-sm font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function StatBlock({
  icon, label, value, tone = 'neutral',
}: {
  icon: 'CircleCheck' | 'BookOpen' | 'GraduationCap' | 'Wallet';
  label: string;
  value: string;
  tone?: 'success' | 'primary' | 'neutral';
}) {
  const toneCls = tone === 'success' ? 'text-success'
    : tone === 'primary' ? 'text-trilce-primary'
    : 'text-text-secondary';
  return (
    <div className="flex-1 bg-bg-card border border-border rounded-md p-4 flex items-center gap-4 min-w-[200px]">
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
