'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { apiFetch } from '@/shared/lib/api';
import type { CursoEnPortal, MiMatriculaResponse, MiPerfilResponse } from './types';

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
