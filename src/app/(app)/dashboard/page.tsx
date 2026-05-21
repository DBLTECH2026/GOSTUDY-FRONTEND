'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useDashboardStats } from '@/modules/reportes/api';
import { Icon } from '@/shared/components/Icon';
import { KpiCard } from '@/shared/components/KpiCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: stats, isLoading } = useDashboardStats();
  const saludo = user ? `Buenos días, ${user.nombres.split(' ')[0]}` : 'Buenos días';

  // Los docentes no tienen dashboard administrativo — van a sus clases.
  useEffect(() => {
    if (user?.rol === 'docente') {
      router.replace('/mis-clases');
    }
  }, [user, router]);

  const fmtSoles = (n: number) => `S/ ${n.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
  const sinDatos = (n: number, hint: string) => (n === 0 ? 'Sin datos aún' : hint);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero saludo */}
      <div className="bg-trilce-accent text-white rounded-lg p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{saludo}</h1>
          <p className="text-white/80 text-sm mt-1">
            {new Date().toLocaleDateString('es-PE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="/inscripciones"
          className="bg-trilce-primary hover:bg-trilce-primary-dark text-white font-semibold px-5 py-2.5 rounded-sm flex items-center gap-2 self-start md:self-auto"
        >
          {stats && stats.inscripciones_pendientes > 0
            ? `Revisar ${stats.inscripciones_pendientes} pendiente${stats.inscripciones_pendientes !== 1 ? 's' : ''}`
            : 'Revisar inscripciones'}{' '}
          <Icon name="ArrowRight" size={16} />
        </Link>
      </div>

      {/* KPIs reales del backend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="INSCRIPCIONES PENDIENTES"
          value={isLoading ? '…' : String(stats?.inscripciones_pendientes ?? 0)}
          icon="Hourglass"
          iconColor="text-warning"
          hint={isLoading ? 'Cargando…' : sinDatos(stats?.inscripciones_pendientes ?? 0, 'Por aprobar')}
        />
        <KpiCard
          label="MATRÍCULAS DEL MES"
          value={isLoading ? '…' : String(stats?.matriculas_del_mes ?? 0)}
          icon="GraduationCap"
          iconColor="text-trilce-primary"
          hint={isLoading ? 'Cargando…' : sinDatos(stats?.matriculas_del_mes ?? 0, 'Activadas este mes')}
        />
        <KpiCard
          label="PAGOS DEL MES"
          value={isLoading ? '…' : fmtSoles(stats?.pagos_del_mes ?? 0)}
          icon="Banknote"
          iconColor="text-success"
          hint={isLoading ? 'Cargando…' : sinDatos(stats?.pagos_del_mes ?? 0, 'Cobrado')}
        />
        <KpiCard
          label="PAGOS VENCIDOS"
          value={isLoading ? '…' : String(stats?.pagos_vencidos ?? 0)}
          icon="TriangleAlert"
          iconColor="text-danger"
          hint={isLoading ? 'Cargando…' : sinDatos(stats?.pagos_vencidos ?? 0, 'Con mora')}
        />
      </div>

      {/* Resumen secundario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Link
          href="/estudiantes"
          className="bg-bg-card border border-border rounded-md p-5 hover:border-trilce-primary transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-trilce-primary-soft flex items-center justify-center">
              <Icon name="GraduationCap" size={24} className="text-trilce-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.total_estudiantes ?? 0}</div>
              <div className="text-xs text-text-secondary">Estudiantes registrados</div>
            </div>
          </div>
          <Icon name="ArrowRight" size={18} className="text-text-muted" />
        </Link>
        <Link
          href="/docentes"
          className="bg-bg-card border border-border rounded-md p-5 hover:border-trilce-primary transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-trilce-primary-soft flex items-center justify-center">
              <Icon name="Users" size={24} className="text-trilce-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.total_docentes ?? 0}</div>
              <div className="text-xs text-text-secondary">Docentes registrados</div>
            </div>
          </div>
          <Icon name="ArrowRight" size={18} className="text-text-muted" />
        </Link>
      </div>
    </div>
  );
}
