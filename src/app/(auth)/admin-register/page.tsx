'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '@/shared/lib/api';
import { authApi } from '@/modules/auth/api';
import { useAuth } from '@/modules/auth/AuthProvider';
import { Icon } from '@/shared/components/Icon';
import { notify } from '@/shared/lib/notify';

export default function AdminRegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    password_confirmation: '',
    dni: '',
    telefono: '',
    rol: 'admin' as 'admin' | 'docente',
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    if (form.password !== form.password_confirmation) {
      notify.warning('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const tid = notify.loading('Creando cuenta…');
    try {
      const session = await authApi.registerAdmin({
        ...form,
        dni: form.dni || undefined,
        telefono: form.telefono || undefined,
      });
      setSession(session);
      notify.dismiss(tid);
      notify.success({ title: 'Cuenta creada', description: 'Bienvenido al panel administrativo.' });
      router.replace('/dashboard');
    } catch (err) {
      notify.dismiss(tid);
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
      }
      notify.apiError(err, 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-page p-6">
      <div className="w-full max-w-2xl bg-bg-card rounded-lg shadow-lg border border-border p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-trilce-accent rounded-md flex items-center justify-center mb-3">
            <Icon name="KeyRound" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Crear cuenta — Staff</h1>
          <p className="text-sm text-text-secondary mt-1 text-center">
            Solo para personal autorizado del Colegio Trilce.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nombres" name="nombres" errors={fieldErrors}>
              <input
                type="text"
                required
                value={form.nombres}
                onChange={(e) => update('nombres', e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-sm focus:outline-none focus:border-trilce-primary"
              />
            </Field>
            <Field label="Apellidos" name="apellidos" errors={fieldErrors}>
              <input
                type="text"
                required
                value={form.apellidos}
                onChange={(e) => update('apellidos', e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-sm focus:outline-none focus:border-trilce-primary"
              />
            </Field>
          </div>

          <Field label="Correo institucional" name="email" errors={fieldErrors}>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-sm focus:outline-none focus:border-trilce-primary"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="DNI" name="dni" errors={fieldErrors}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={form.dni}
                onChange={(e) => update('dni', e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 border border-border rounded-sm focus:outline-none focus:border-trilce-primary"
              />
            </Field>
            <Field label="Teléfono" name="telefono" errors={fieldErrors}>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => update('telefono', e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-sm focus:outline-none focus:border-trilce-primary"
              />
            </Field>
          </div>

          <Field label="Rol" name="rol" errors={fieldErrors}>
            <select
              value={form.rol}
              onChange={(e) => update('rol', e.target.value as 'admin' | 'docente')}
              className="w-full px-4 py-2.5 border border-border rounded-sm focus:outline-none focus:border-trilce-primary bg-bg-card"
            >
              <option value="admin">Administrador</option>
              <option value="docente">Docente</option>
            </select>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Contraseña" name="password" errors={fieldErrors}>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-sm focus:outline-none focus:border-trilce-primary"
              />
            </Field>
            <Field label="Confirmar contraseña" name="password_confirmation" errors={fieldErrors}>
              <input
                type="password"
                required
                minLength={6}
                value={form.password_confirmation}
                onChange={(e) => update('password_confirmation', e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-sm focus:outline-none focus:border-trilce-primary"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-trilce-accent hover:bg-trilce-accent/90 disabled:opacity-60 text-white font-semibold py-3 rounded-sm transition-colors"
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/admin-login" className="text-trilce-primary font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
        <p className="text-center text-xs text-text-muted mt-3">
          <Link href="/" className="hover:underline">← Volver al inicio</Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  errors,
  children,
}: {
  label: string;
  name: string;
  errors: Record<string, string[]>;
  children: React.ReactNode;
}) {
  const err = errors[name]?.[0];
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1.5">{label}</span>
      {children}
      {err && <span className="block text-xs text-red-600 mt-1">{err}</span>}
    </label>
  );
}
