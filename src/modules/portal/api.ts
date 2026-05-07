'use client';

import { useEffect, useState } from 'react';
import { MI_MATRICULA_MOCK, MI_PERFIL_MOCK, MIS_CURSOS_MOCK } from './mocks';
import type { CursoEnPortal, MiMatriculaResponse, MiPerfilResponse } from './types';

const MOCK_DELAY_MS = 250;

function fakeFetch<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export function useMiPerfil() {
  const [data, setData] = useState<MiPerfilResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fakeFetch(MI_PERFIL_MOCK).then((d) => {
      setData(d);
      setIsLoading(false);
    });
  }, []);

  return { data, isLoading };
}

export function useMiMatricula() {
  const [data, setData] = useState<MiMatriculaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fakeFetch(MI_MATRICULA_MOCK).then((d) => {
      setData(d);
      setIsLoading(false);
    });
  }, []);

  return { data, isLoading };
}

export function useMisCursos() {
  const [data, setData] = useState<CursoEnPortal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fakeFetch(MIS_CURSOS_MOCK).then((d) => {
      setData(d);
      setIsLoading(false);
    });
  }, []);

  return { data, isLoading };
}
