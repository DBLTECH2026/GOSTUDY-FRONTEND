/**
 * Cliente API base para GOSTUDY Backend.
 *
 * Usa fetch nativo + Bearer token de Sanctum.
 * El token se guarda en cookie `gostudy_token` (vía hooks de auth).
 *
 * NO importar directamente desde componentes UI — usar los hooks
 * de cada módulo (`src/modules/<modulo>/api.ts`) que envuelven este cliente.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export type ApiOptions = RequestInit & {
  token?: string | null;
  /** Si true, no setea Content-Type (para FormData) */
  formData?: boolean;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, formData, headers, ...rest } = options;
  const finalHeaders: HeadersInit = {
    Accept: 'application/json',
    ...(formData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (!res.ok) {
    let body: { message?: string; errors?: Record<string, string[]> } = {};
    try {
      body = await res.json();
    } catch {
      // not json
    }
    throw new ApiError(res.status, body.message ?? res.statusText, body.errors);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
