'use client';

import { useEffect, useState } from 'react';
import {
  REPORTE_INSCRIPCIONES_MOCK,
  REPORTE_MATRICULAS_POR_SECCION_MOCK,
  REPORTE_PAGOS_MOCK,
} from './mocks';
import type {
  ReporteInscripciones,
  ReporteMatriculasPorSeccion,
  ReportePagos,
} from './types';

const MOCK_DELAY_MS = 250;

function fakeFetch<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export function useReporteInscripciones() {
  const [data, setData] = useState<ReporteInscripciones | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fakeFetch(REPORTE_INSCRIPCIONES_MOCK).then((d) => { setData(d); setIsLoading(false); });
  }, []);
  return { data, isLoading };
}

export function useReporteMatriculasPorSeccion() {
  const [data, setData] = useState<ReporteMatriculasPorSeccion>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fakeFetch(REPORTE_MATRICULAS_POR_SECCION_MOCK).then((d) => { setData(d); setIsLoading(false); });
  }, []);
  return { data, isLoading };
}

export function useReportePagos() {
  const [data, setData] = useState<ReportePagos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fakeFetch(REPORTE_PAGOS_MOCK).then((d) => { setData(d); setIsLoading(false); });
  }, []);
  return { data, isLoading };
}
