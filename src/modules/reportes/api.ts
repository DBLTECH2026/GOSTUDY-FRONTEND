'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { apiFetch } from '@/shared/lib/api';
import type {
  ReporteInscripciones,
  ReporteMatriculasPorSeccion,
  ReportePagos,
} from './types';

export type DashboardStats = {
  inscripciones_pendientes: number;
  matriculas_del_mes: number;
  pagos_del_mes: number;
  pagos_vencidos: number;
  total_estudiantes: number;
  total_docentes: number;
};

export function useDashboardStats() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiFetch<{ data: DashboardStats }>('/reportes/dashboard', { token })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [token]);

  return { data, isLoading };
}

export function useReporteInscripciones(periodoId?: number) {
  const { token } = useAuth();
  const [data, setData] = useState<ReporteInscripciones | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const qs = periodoId ? `?periodo_id=${periodoId}` : '';
    apiFetch<{ data: ReporteInscripciones }>(`/reportes/inscripciones${qs}`, { token })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [token, periodoId]);

  return { data, isLoading };
}

export function useReporteMatriculasPorSeccion(periodoId?: number) {
  const { token } = useAuth();
  const [data, setData] = useState<ReporteMatriculasPorSeccion>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const qs = periodoId ? `?periodo_id=${periodoId}` : '';
    apiFetch<{ data: ReporteMatriculasPorSeccion }>(`/reportes/matriculas-por-seccion${qs}`, { token })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [token, periodoId]);

  return { data, isLoading };
}

export function useReportePagos(periodoId?: number) {
  const { token } = useAuth();
  const [data, setData] = useState<ReportePagos | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const qs = periodoId ? `?periodo_id=${periodoId}` : '';
    apiFetch<{ data: ReportePagos }>(`/reportes/pagos-por-periodo${qs}`, { token })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [token, periodoId]);

  return { data, isLoading };
}
