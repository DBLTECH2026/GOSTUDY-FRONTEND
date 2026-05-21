'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { apiFetch } from '@/shared/lib/api';

export type SeccionRow = {
  id: number;
  nombre: string;
  grado: string;
  nivel: string;
  periodo: string;
  capacidad: number;
  matriculados: number;
  docente_tutor: string | null;
  cursos_asignados: number;
  cursos_total: number;
  label: string;
};

export type AsignacionItem = {
  curso_id: number;
  curso_nombre: string;
  curso_codigo: string;
  horas_semana: number;
  docente_id: number | null;
  asignado: boolean;
};

export type DocenteOpcion = {
  id: number;
  codigo_docente: string;
  nombre_completo: string;
  especialidad: string | null;
};

export type SeccionDetalle = {
  id: number;
  nombre: string;
  grado: string;
  nivel: string;
  periodo: string;
  capacidad: number;
  label: string;
};

export type AsignacionesResponse = {
  seccion: SeccionDetalle;
  asignaciones: AsignacionItem[];
  docentes: DocenteOpcion[];
};

/* ─── Listado de secciones ─── */

export function useSecciones() {
  const { token } = useAuth();
  const [data, setData] = useState<SeccionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    setIsLoading(true);
    apiFetch<{ data: SeccionRow[] }>('/secciones', { token })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [token, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { data, isLoading, reload };
}

/* ─── Asignaciones de una sección ─── */

export async function obtenerAsignaciones(token: string, seccionId: number) {
  return apiFetch<{ data: AsignacionesResponse }>(`/secciones/${seccionId}/asignaciones`, { token });
}

export async function guardarAsignaciones(
  token: string,
  seccionId: number,
  asignaciones: { curso_id: number; docente_id: number | null }[],
) {
  return apiFetch<{ message: string; data: { asignadas: number; total: number } }>(
    `/secciones/${seccionId}/asignaciones`,
    {
      method: 'PUT',
      token,
      body: JSON.stringify({ asignaciones }),
    },
  );
}

/* ─── Tutor de sección ─── */

export async function asignarTutor(token: string, seccionId: number, docenteId: number | null) {
  return apiFetch<{ message: string }>(`/secciones/${seccionId}/tutor`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ docente_id: docenteId }),
  });
}

/* ─── CRUD Cursos ─── */

export type CursoRow = {
  id: number;
  nombre: string;
  codigo: string;
  horas_semana: number;
  descripcion: string | null;
  grado_id: number;
  grado: string;
  nivel_id: number | null;
  nivel: string;
  secciones_asignadas: number;
};

export type CursoUnicoPayload = {
  grado_id: number;
  nombre: string;
  codigo?: string;
  horas_semana: number;
  descripcion?: string;
};

export type CursoLotePayload = {
  modo_lote: true;
  nivel_id: number;
  nombre: string;
  horas_semana: number;
  descripcion?: string;
};

export type ActualizarCursoPayload = {
  grado_id: number;
  nombre: string;
  codigo: string;
  horas_semana: number;
  descripcion?: string;
};

export type CursosFiltros = { nivel_id?: number; grado_id?: number; q?: string };

export function useCursos(filtros: CursosFiltros = {}) {
  const { token } = useAuth();
  const [data, setData] = useState<CursoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Memoize la querystring para no re-disparar inutilmente
  const qs = (() => {
    const params = new URLSearchParams();
    if (filtros.nivel_id) params.set('nivel_id', String(filtros.nivel_id));
    if (filtros.grado_id) params.set('grado_id', String(filtros.grado_id));
    if (filtros.q) params.set('q', filtros.q);
    const s = params.toString();
    return s ? `?${s}` : '';
  })();

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    setIsLoading(true);
    apiFetch<{ data: CursoRow[] }>(`/cursos${qs}`, { token })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [token, qs, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { data, isLoading, reload };
}

export async function crearCurso(token: string, payload: CursoUnicoPayload | CursoLotePayload) {
  return apiFetch<{
    message: string;
    data: CursoRow | { creados: number; cursos: CursoRow[] };
  }>('/cursos', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function actualizarCurso(token: string, id: number, payload: ActualizarCursoPayload) {
  return apiFetch<{ message: string; data: CursoRow }>(`/cursos/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

export async function eliminarCurso(token: string, id: number) {
  return apiFetch<{ message: string }>(`/cursos/${id}`, {
    method: 'DELETE',
    token,
  });
}

/* ─── Panel del docente ─── */

export type MiClaseRow = {
  seccion_curso_id: number;
  curso_id: number;
  curso: string;
  codigo: string;
  horas_semana: number;
  grado: string;
  nivel: string;
  seccion: string;
  periodo: string;
  label: string;
  estudiantes: number;
};

export type ContenidoSemanaPayload = {
  titulo: string | null;
  descripcion: string | null;
  recursos_url: string | null;
  tarea: string | null;
};

export type MaterialSemana = {
  id: number;
  nombre: string;
  url: string | null;
  tipo: string | null;
  tamano: number;
  tamano_legible: string;
  subido_en?: string;
};

export type SemanaDocente = {
  id: number;
  numero: number;
  fecha_inicio: string;
  fecha_fin: string;
  es_actual: boolean;
  contenido: ContenidoSemanaPayload | null;
  materiales: MaterialSemana[];
};

export type BimestreDocente = {
  id: number;
  nombre: string;
  orden: number;
  fecha_inicio: string;
  fecha_fin: string;
  es_actual: boolean;
  semanas: SemanaDocente[];
};

export type DetalleClaseDocente = {
  clase: MiClaseRow & { descripcion: string | null };
  bimestres: BimestreDocente[];
};

export function useMisClasesDocente() {
  const { token } = useAuth();
  const [data, setData] = useState<MiClaseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    setIsLoading(true);
    apiFetch<{ data: MiClaseRow[] }>('/docente/mis-clases', { token })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [token, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { data, isLoading, reload };
}

export function useDetalleClaseDocente(seccionCursoId: number | null) {
  const { token } = useAuth();
  const [data, setData] = useState<DetalleClaseDocente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token || seccionCursoId === null) { setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    apiFetch<{ data: DetalleClaseDocente }>(`/docente/mis-clases/${seccionCursoId}`, { token })
      .then((r) => setData(r.data))
      .catch((e) => {
        setData(null);
        setError(e?.message ?? 'No se pudo cargar la clase.');
      })
      .finally(() => setIsLoading(false));
  }, [token, seccionCursoId, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { data, isLoading, error, reload };
}

export async function guardarContenidoSemana(
  token: string,
  seccionCursoId: number,
  semanaId: number,
  payload: ContenidoSemanaPayload,
) {
  return apiFetch<{ message: string; data: ContenidoSemanaPayload | null }>(
    `/docente/mis-clases/${seccionCursoId}/semanas/${semanaId}`,
    {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    },
  );
}

export async function subirMaterialSemana(
  token: string,
  seccionCursoId: number,
  semanaId: number,
  archivo: File,
) {
  const fd = new FormData();
  fd.append('archivo', archivo);
  return apiFetch<{ message: string; data: MaterialSemana }>(
    `/docente/mis-clases/${seccionCursoId}/semanas/${semanaId}/materiales`,
    {
      method: 'POST',
      token,
      body: fd,
      formData: true,
    },
  );
}

export async function eliminarMaterialSemana(
  token: string,
  seccionCursoId: number,
  semanaId: number,
  materialId: number,
) {
  return apiFetch<{ message: string }>(
    `/docente/mis-clases/${seccionCursoId}/semanas/${semanaId}/materiales/${materialId}`,
    {
      method: 'DELETE',
      token,
    },
  );
}

/* ─── Admin: horarios por sección ─── */

export type HorarioRow = {
  id: number;
  seccion_curso_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  aula: string | null;
};

export type CursoAsignadoConHorario = {
  seccion_curso_id: number;
  curso_id: number;
  curso: string;
  codigo: string;
  horas_semana: number;
  docente_nombres: string | null;
  docente_apellidos: string | null;
};

export type HorariosSeccionResponse = {
  seccion: {
    id: number;
    nombre: string;
    grado: string;
    nivel: string;
    periodo: string;
    label: string;
  };
  cursos: CursoAsignadoConHorario[];
  horarios: HorarioRow[];
};

export async function obtenerHorariosSeccion(token: string, seccionId: number) {
  return apiFetch<{ data: HorariosSeccionResponse }>(`/secciones/${seccionId}/horarios`, { token });
}

export type SlotPayload = {
  seccion_curso_id: number;
  dia_semana: number;
  hora_inicio: string; // 'HH:MM'
  hora_fin: string;    // 'HH:MM'
  aula?: string | null;
};

export async function guardarHorariosSeccion(token: string, seccionId: number, horarios: SlotPayload[]) {
  return apiFetch<{ message: string }>(`/secciones/${seccionId}/horarios`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ horarios }),
  });
}
