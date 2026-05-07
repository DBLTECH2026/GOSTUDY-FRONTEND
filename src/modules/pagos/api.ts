'use client';

import { useEffect, useState } from 'react';
// import { apiFetch } from '@/shared/lib/api';
import { ESTADO_CUENTA_MOCK, MIS_PAGOS_MOCK, PAGOS_ADMIN_MOCK } from './mocks';
import type { EstadoCuenta, Pago, PagoListItem, RegistrarPagoInput } from './types';

// MODO MOCK: hasta que A y B integren auth + matrícula.
// Cuando llegue ese momento, reemplazar el cuerpo de cada hook por:
//   const data = await apiFetch<{data: T}>('/pagos', { token })
const MOCK_DELAY_MS = 250;

function fakeFetch<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export function usePagosAdmin(filters?: { estado?: string; matricula_id?: number; mes?: number }) {
  const [data, setData] = useState<PagoListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fakeFetch(PAGOS_ADMIN_MOCK).then((d) => {
      const filtered = filters?.estado
        ? d.filter((p) => p.estado === filters.estado)
        : d;
      setData(filtered);
      setIsLoading(false);
    });
  }, [filters?.estado, filters?.matricula_id, filters?.mes]);

  return { data, isLoading };
}

export function useMisPagos() {
  const [data, setData] = useState<Pago[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fakeFetch(MIS_PAGOS_MOCK).then((d) => {
      setData(d);
      setIsLoading(false);
    });
  }, []);

  /**
   * DEMO: marca un pago como pagado en el estado local. En producción
   * (cuando A integre auth y se exponga un endpoint de pago en línea
   * para estudiantes) esto haría POST al backend y refrescaría.
   */
  const marcarPagado = (pagoId: number, metodo: import('./types').PagoMetodo) => {
    setData((prev) =>
      prev.map((p) =>
        p.id === pagoId
          ? {
              ...p,
              estado: 'pagado' as const,
              metodo,
              fecha_pago: new Date().toISOString().slice(0, 10),
            }
          : p,
      ),
    );
  };

  return { data, isLoading, marcarPagado };
}

export function useEstadoCuenta(_estudianteId: number) {
  const [data, setData] = useState<EstadoCuenta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fakeFetch(ESTADO_CUENTA_MOCK).then((d) => {
      setData(d);
      setIsLoading(false);
    });
  }, [_estudianteId]);

  return { data, isLoading };
}

export async function registrarPago(_pagoId: number, input: RegistrarPagoInput): Promise<Pago> {
  // TODO: cuando auth esté listo:
  // const fd = new FormData();
  // fd.append('metodo', input.metodo);
  // fd.append('monto', String(input.monto));
  // if (input.observaciones) fd.append('observaciones', input.observaciones);
  // if (input.comprobante) fd.append('comprobante', input.comprobante);
  // return apiFetch<{data: Pago}>(`/pagos/${pagoId}/registrar`, { method: 'POST', body: fd, formData: true, token })
  //   .then(r => r.data);
  await new Promise((r) => setTimeout(r, 600));
  return { ...MIS_PAGOS_MOCK[3], estado: 'pagado', metodo: input.metodo, monto: input.monto };
}
