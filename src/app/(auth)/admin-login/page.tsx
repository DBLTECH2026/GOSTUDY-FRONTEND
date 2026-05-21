'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi } from '@/modules/auth/api';
import { useAuth } from '@/modules/auth/AuthProvider';
import { Icon } from '@/shared/components/Icon';
import { notify } from '@/shared/lib/notify';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setSession, user, hydrated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  // Si el usuario es docente, lo mandamos a /mis-clases (no tiene dashboard).
  function rutaInicial(rol: string, tipo: string): string {
    if (tipo !== 'admin') return '/inicio'; // estudiante -> portal
    return rol === 'docente' ? '/mis-clases' : '/dashboard';
  }

  useEffect(() => {
    if (hydrated && user) {
      router.replace(rutaInicial(user.rol, user.tipo));
    }
  }, [hydrated, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const tid = notify.loading('Validando credenciales…');
    try {
      const session = await authApi.loginAdmin({ email, password });
      setSession(session);
      notify.dismiss(tid);
      notify.success({ title: '¡Bienvenido!', description: 'Sesión iniciada correctamente.' });
      router.replace(rutaInicial(session.user.rol, session.user.tipo));
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-page p-6">
      <div className="w-full max-w-md bg-bg-card rounded-lg shadow-lg border border-border p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-trilce-accent rounded-md flex items-center justify-center mb-3">
            <Icon name="KeyRound" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Panel Administrativo</h1>
          <p className="text-sm text-text-secondary mt-1 text-center">
            Acceso restringido — solo personal autorizado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Correo institucional
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@trilce.edu.pe"
              className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-trilce-primary"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold">Contraseña</label>
              <Link
                href="#"
                className="text-xs text-trilce-primary font-semibold hover:underline"
              >
                Recuperar
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 border border-border rounded-sm focus:outline-none focus:border-trilce-primary"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary text-xs font-semibold"
              >
                {showPass ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-trilce-primary"
            />
            Mantener sesión iniciada
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-trilce-accent hover:bg-trilce-accent/90 disabled:opacity-60 text-white font-semibold py-3 rounded-sm transition-colors"
          >
            {loading ? 'Validando…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          ¿Sin cuenta?{' '}
          <Link
            href="/admin-register"
            className="text-trilce-primary font-semibold hover:underline"
          >
            Crear cuenta de staff
          </Link>
        </p>
        <p className="text-center text-xs text-text-muted mt-3">
          <Link href="/" className="hover:underline">← Volver al inicio</Link>
        </p>
      </div>
    </main>
  );
}
