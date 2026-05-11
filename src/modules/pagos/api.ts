'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { apiFetch, ApiError } from '@/shared/lib/api';
import type {
  EstadoCuenta,
  Pago,
  PagoListItem,
  PagoMetodo,
  RegistrarPagoInput,
} from './types';

type Filters = { estado?: string; matricula_id?: number; mes?: number };

/* ─── Admin: listado global de pagos ─── */

export function usePagosAdmin(filters?: Filters) {
  const { token } = useAuth();
  const [data, setData] = useState<PagoListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const qs = new URLSearchParams();
    if (filters?.estado) qs.set('estado', filters.estado);
    if (filters?.matricula_id) qs.set('matricula_id', String(filters.matricula_id));
    if (filters?.mes) qs.set('mes', String(filters.mes));
    const url = `/pagos${qs.toString() ? `?${qs}` : ''}`;
    apiFetch<{ data: PagoListItem[] }>(url, { token })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [token, filters?.estado, filters?.matricula_id, filters?.mes, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { data, isLoading, reload };
}

/* ─── Portal estudiante: mis pagos ─── */

export function useMisPagos() {
  const { token } = useAuth();
  const [data, setData] = useState<Pago[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    apiFetch<{ data: Pago[] }>('/portal/mis-pagos', { token })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [token, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const marcarPagado = (pagoId: number, metodo: PagoMetodo) => {
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

  return { data, isLoading, marcarPagado, reload };
}

/* ─── Admin: estado de cuenta de un estudiante ─── */

export function useEstadoCuenta(estudianteId: number) {
  const { token } = useAuth();
  const [data, setData] = useState<EstadoCuenta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    apiFetch<{ data: EstadoCuenta }>(`/estudiantes/${estudianteId}/estado-cuenta`, { token })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [token, estudianteId]);

  return { data, isLoading };
}

/* ─── Admin: registrar pago (marca como pagado) ─── */

export async function registrarPago(
  token: string,
  pagoId: number,
  input: RegistrarPagoInput,
): Promise<Pago> {
  const fd = new FormData();
  fd.append('metodo', input.metodo);
  fd.append('monto', String(input.monto));
  if (input.observaciones) fd.append('observaciones', input.observaciones);
  if (input.comprobante) fd.append('comprobante', input.comprobante);

  const res = await apiFetch<{ message: string; data: Pago }>(
    `/pagos/${pagoId}/registrar`,
    {
      method: 'POST',
      token,
      body: fd,
      formData: true,
    },
  );
  return res.data;
}

/* ─── Portal estudiante: subir comprobante de pago ─── */

export async function subirComprobantePago(
  token: string,
  pagoId: number,
  comprobante: File,
  metodo: PagoMetodo,
  observaciones?: string,
): Promise<Pago> {
  const fd = new FormData();
  fd.append('comprobante', comprobante);
  fd.append('metodo', metodo);
  if (observaciones) fd.append('observaciones', observaciones);

  const res = await apiFetch<{ message: string; data: Pago }>(
    `/portal/pagos/${pagoId}/subir-comprobante`,
    {
      method: 'POST',
      token,
      body: fd,
      formData: true,
    },
  );
  return res.data;
}

export { ApiError };
