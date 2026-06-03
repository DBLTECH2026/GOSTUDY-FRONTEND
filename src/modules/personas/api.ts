'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { apiFetch } from '@/shared/lib/api';

export type EstudianteRow = {
  id: number;
  codigo_estudiante: string;
  dni: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  sexo: 'M' | 'F';
  direccion: string;
  distrito: string | null;
  estado: 'activo' | 'retirado' | 'egresado';
};

export type CrearEstudiantePayload = {
  dni: string;
  pin: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F';
  direccion: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  ie_procedencia?: string;
  anio_procedencia?: number;
};

export type DocenteRow = {
  id: number;
  codigo_docente: string;
  nombre_completo: string;
  nombres?: string;
  apellidos?: string;
  email: string;
  dni: string | null;
  telefono: string | null;
  especialidad: string | null;
  grado_academico: string | null;
  estado: 'activo' | 'inactivo';
};

export type CrearDocentePayload = {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  dni?: string;
  telefono?: string;
  especialidad?: string;
  grado_academico?: string;
};

export type ActualizarDocentePayload = {
  nombres: string;
  apellidos: string;
  email: string;
  password?: string;
  dni?: string;
  telefono?: string;
  especialidad?: string;
  grado_academico?: string;
  estado?: 'activo' | 'inactivo';
};

/* ─── Consulta de identidad (APIsPERU vía backend) ─── */

export type ConsultaDni = {
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  apellidos: string;
  nombre_completo: string;
};

export type ConsultaRuc = {
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  estado: string;
  condicion: string;
};

export async function consultarDni(token: string, dni: string) {
  return apiFetch<{ data: ConsultaDni }>(`/consulta/dni/${dni}`, { token });
}

export async function consultarRuc(token: string, ruc: string) {
  return apiFetch<{ data: ConsultaRuc }>(`/consulta/ruc/${ruc}`, { token });
}

/* ─── Estudiantes ─── */

export function useEstudiantes(q?: string) {
  const { token } = useAuth();
  const [data, setData] = useState<EstudianteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    apiFetch<{ data: EstudianteRow[] }>(`/estudiantes${qs}`, { token })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [token, q, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, isLoading, reload };
}

export async function crearEstudiante(token: string, payload: CrearEstudiantePayload) {
  return apiFetch<{ message: string; data: EstudianteRow }>('/estudiantes', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

/* ─── Docentes ─── */

export function useDocentes(q?: string) {
  const { token } = useAuth();
  const [data, setData] = useState<DocenteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    apiFetch<{ data: DocenteRow[] }>(`/docentes${qs}`, { token })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [token, q, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, isLoading, reload };
}

export async function crearDocente(token: string, payload: CrearDocentePayload) {
  return apiFetch<{ message: string; data: DocenteRow }>('/docentes', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function obtenerDocente(token: string, id: number) {
  return apiFetch<{ data: DocenteRow }>(`/docentes/${id}`, { token });
}

export async function actualizarDocente(token: string, id: number, payload: ActualizarDocentePayload) {
  return apiFetch<{ message: string; data: DocenteRow }>(`/docentes/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

export async function eliminarDocente(token: string, id: number) {
  return apiFetch<{ message: string }>(`/docentes/${id}`, {
    method: 'DELETE',
    token,
  });
}
