import { apiFetch } from '@/shared/lib/api';
import type { AuthSession, AuthUser } from './types';

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminRegisterPayload = {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  password_confirmation: string;
  dni?: string;
  telefono?: string;
  rol?: 'admin' | 'docente';
};

export type PortalLoginPayload = {
  dni: string;
  pin: string;
};

export type PortalRegisterPayload = {
  dni: string;
  pin: string;
  pin_confirmation: string;
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

export const authApi = {
  loginAdmin: (data: AdminLoginPayload) =>
    apiFetch<AuthSession>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerAdmin: (data: AdminRegisterPayload) =>
    apiFetch<AuthSession>('/auth/admin/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  loginPortal: (data: PortalLoginPayload) =>
    apiFetch<AuthSession>('/auth/portal/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerPortal: (data: PortalRegisterPayload) =>
    apiFetch<AuthSession>('/auth/portal/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: (token: string) =>
    apiFetch<{ user: AuthUser }>('/auth/me', { token }),

  logout: (token: string) =>
    apiFetch<{ message: string }>('/auth/logout', {
      method: 'POST',
      token,
    }),
};
