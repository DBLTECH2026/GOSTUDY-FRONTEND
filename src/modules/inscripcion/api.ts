'use client';

import { apiFetch } from '@/shared/lib/api';

export type NivelCatalogo = {
  id: number;
  nombre: string;
  orden: number;
  grados: { id: number; nombre: string; orden: number }[];
};

export type Inscripcion = {
  id: number;
  codigo: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  periodo: string | null;
  nivel: string | null;
  grado: string | null;
  dni: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  sexo: 'M' | 'F';
  direccion: string;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  ie_procedencia: string | null;
  anio_procedencia: number | null;
  apoderado: {
    tipo: string;
    nombres: string;
    apellidos: string;
    dni: string;
    telefono: string | null;
    email: string | null;
  } | null;
  motivo_rechazo: string | null;
  fecha_inscripcion: string | null;
  aprobada_en: string | null;
  comprobante_pago_url: string | null;
  certificado_estudios_url: string | null;
};

export type StoreInscripcionPayload = {
  // estudiante
  dni_estudiante: string;
  nombres_estudiante: string;
  apellidos_estudiante: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F';
  direccion: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  ie_procedencia?: string;
  anio_procedencia?: number;
  // académico
  nivel_id: number;
  grado_id: number;
  // pin
  pin: string;
  pin_confirmation: string;
  // apoderado
  apoderado_nombres: string;
  apoderado_apellidos: string;
  apoderado_dni: string;
  apoderado_telefono?: string;
  apoderado_email?: string;
  apoderado_tipo?: 'padre' | 'madre' | 'apoderado';
  // documentos (archivos)
  comprobante_pago?: File | null;
  certificado_estudios?: File | null;
};

export const inscripcionApi = {
  catalogoNivelesGrados: () =>
    apiFetch<{ data: NivelCatalogo[] }>('/catalogos/niveles-grados'),

  store: (payload: StoreInscripcionPayload) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      if (v === undefined || v === null) continue;
      if (v instanceof File) fd.append(k, v);
      else fd.append(k, String(v));
    }
    return apiFetch<{ message: string; data: Inscripcion }>('/inscripciones', {
      method: 'POST',
      body: fd,
      formData: true,
    });
  },

  enviarFacturacion: (email: string, nombreAlumno: string) =>
    apiFetch<{ message: string }>('/inscripcion/enviar-facturacion', {
      method: 'POST',
      body: JSON.stringify({ email, nombre_alumno: nombreAlumno }),
    }),

  listar: (token: string, estado?: 'pendiente' | 'aprobada' | 'rechazada') => {
    const qs = estado ? `?estado=${estado}` : '';
    return apiFetch<{ data: Inscripcion[] }>(`/inscripciones${qs}`, { token });
  },

  detalle: (token: string, id: number) =>
    apiFetch<{ data: Inscripcion }>(`/inscripciones/${id}`, { token }),

  aprobar: (token: string, id: number) =>
    apiFetch<{ message: string; data: Inscripcion }>(`/inscripciones/${id}/aprobar`, {
      method: 'POST',
      token,
    }),

  rechazar: (token: string, id: number, motivo?: string) =>
    apiFetch<{ message: string; data: Inscripcion }>(`/inscripciones/${id}/rechazar`, {
      method: 'POST',
      token,
      body: JSON.stringify({ motivo }),
    }),
};
