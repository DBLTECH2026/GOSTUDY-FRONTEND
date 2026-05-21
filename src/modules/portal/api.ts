'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { apiFetch } from '@/shared/lib/api';
import type {
  CursoDetalleResponse,
  CursoEnPortal,
  MiHorarioResponse,
  MiMatriculaResponse,
  MiPerfilResponse,
} from './types';

export function useMiPerfil() {
  const { token } = useAuth();
  const [data, setData] = useState<MiPerfilResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    apiFetch<{ data: MiPerfilResponse }>('/portal/mi-perfil', { token })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [token]);

  return { data, isLoading };
}

export function useMiMatricula() {
  const { token } = useAuth();
  const [data, setData] = useState<MiMatriculaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    apiFetch<{ data: MiMatriculaResponse }>('/portal/mi-matricula', { token })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [token]);

  return { data, isLoading };
}

export function useMisCursos() {
  const { token } = useAuth();
  const [data, setData] = useState<CursoEnPortal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    apiFetch<{ data: CursoEnPortal[] }>('/portal/mis-cursos', { token })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [token]);

  return { data, isLoading };
}

export function useMiHorario() {
  const { token } = useAuth();
  const [data, setData] = useState<MiHorarioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    setIsLoading(true);
    apiFetch<{ data: MiHorarioResponse }>('/portal/mi-horario', { token })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [token]);

  return { data, isLoading };
}

export function useDetalleCurso(seccionCursoId: number | null) {
  const { token } = useAuth();
  const [data, setData] = useState<CursoDetalleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || seccionCursoId === null) { setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    apiFetch<{ data: CursoDetalleResponse }>(`/portal/cursos/${seccionCursoId}`, { token })
      .then((r) => setData(r.data))
      .catch((e) => {
        setData(null);
        setError(e?.message ?? 'No se pudo cargar el curso.');
      })
      .finally(() => setIsLoading(false));
  }, [token, seccionCursoId]);

  return { data, isLoading, error };
}
