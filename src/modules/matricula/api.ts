'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { apiFetch } from '@/shared/lib/api';

export type MatriculaRow = {
  id: number;
  fecha_matricula: string;
  estado: 'activa' | 'retirada' | 'egresada';
  estudiante: {
    id: number;
    codigo_estudiante: string;
    nombre_completo: string;
    dni: string;
  };
  nivel: string;
  grado: string;
  seccion: string;
  periodo: string;
};

export type CatalogoMatricula = {
  periodo: { id: number; descripcion: string } | null;
  estudiantes: {
    id: number;
    codigo_estudiante: string;
    dni: string;
    nombre_completo: string;
  }[];
  secciones: {
    id: number;
    label: string;
    capacidad: number;
    matriculados: number;
    cupo: number;
  }[];
};

export type CrearMatriculaPayload = {
  estudiante_id: number;
  seccion_id: number;
  periodo_id?: number;
  observaciones?: string;
};

export function useMatriculas(q?: string) {
  const { token } = useAuth();
  const [data, setData] = useState<MatriculaRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    apiFetch<{ data: MatriculaRow[] }>(`/matriculas${qs}`, { token })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [token, q, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, isLoading, reload };
}

export function useCatalogoMatricula(enabled = true) {
  const { token } = useAuth();
  const [data, setData] = useState<CatalogoMatricula | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token || !enabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    apiFetch<{ data: CatalogoMatricula }>('/matriculas/catalogo', { token })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [token, enabled]);

  return { data, isLoading };
}

export async function crearMatricula(token: string, payload: CrearMatriculaPayload) {
  return apiFetch<{ message: string; data: { id: number; estudiante: string; seccion: string; fecha_matricula: string } }>(
    '/matriculas',
    {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    },
  );
}
