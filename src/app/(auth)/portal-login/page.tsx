'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { authApi } from '@/modules/auth/api';
import { useAuth } from '@/modules/auth/AuthProvider';
import { Icon } from '@/shared/components/Icon';
import { notify } from '@/shared/lib/notify';

const PIN_LEN = 6;

export default function PortalLoginPage() {
  const router = useRouter();
  const { setSession, user, hydrated } = useAuth();

  const [dni, setDni] = useState('');
  const [pin, setPin] = useState<string[]>(Array(PIN_LEN).fill(''));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (hydrated && user) {
      router.replace(user.tipo === 'admin' ? '/dashboard' : '/inicio');
    }
  }, [hydrated, user, router]);

  function handlePinChange(i: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...pin];
    next[i] = digit;
    setPin(next);
    if (digit && i < PIN_LEN - 1) inputsRef.current[i + 1]?.focus();
  }

  function handlePinKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !pin[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  function handlePinPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LEN);
    if (!text) return;
    e.preventDefault();
    const next = Array(PIN_LEN).fill('');
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setPin(next);
    inputsRef.current[Math.min(text.length, PIN_LEN - 1)]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const pinStr = pin.join('');
    if (!/^\d{8}$/.test(dni)) {
      notify.warning('El DNI debe tener 8 dígitos.');
      return;
    }
    if (pinStr.length !== PIN_LEN) {
      notify.warning('Ingresa los 6 dígitos del PIN.');
      return;
    }

    setLoading(true);
    const tid = notify.loading('Validando acceso…');
    try {
      const session = await authApi.loginPortal({ dni, pin: pinStr });
      setSession(session);
      notify.dismiss(tid);
      notify.success({ title: '¡Bienvenido!', description: 'Accediendo al portal del estudiante.' });
      router.replace('/inicio');
    } catch (err) {
      notify.dismiss(tid);
      notify.apiError(err, 'DNI o PIN incorrecto.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex bg-bg-page">
      {/* Lado decorativo */}
      <aside className="hidden md:flex w-1/2 bg-trilce-primary text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-md bg-white text-trilce-primary flex items-center justify-center font-bold text-lg">
            T
          </div>
          <span className="text-lg font-bold">Trilce · GOSTUDY</span>
        </div>
        <div>
          <h1 className="text-5xl font-bold leading-tight mb-4">
            Portal del estudiante
          </h1>
          <p className="text-white/90 max-w-md leading-relaxed">
            Consulta tu matrícula, pagos pendientes y cursos asignados a tu sección.
            Si eres padre, accede con la cuenta de tu hijo.
          </p>
        </div>
        <p className="text-white/70 text-sm">
          “Estudiar en Trilce SE NOTA”<br />
          Desde 1985 — más de 40 años de experiencia educativa.
        </p>
      </aside>

      {/* Form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-bg-card rounded-lg shadow-lg border border-border p-8">
          <h2 className="text-3xl font-bold mb-1">Bienvenido</h2>
          <p className="text-text-secondary mb-6 text-sm">
            Ingresa con tu DNI y PIN de 6 dígitos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">DNI</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                placeholder="71234567"
                className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-trilce-primary"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold">
                  PIN (6 dígitos)
                </label>
                <Link
                  href="#"
                  className="text-xs text-trilce-primary font-semibold hover:underline"
                >
                  ¿Olvidaste tu PIN?
                </Link>
              </div>
              <div
                className="grid grid-cols-6 gap-2"
                onPaste={handlePinPaste}
              >
                {pin.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handlePinKey(i, e)}
                    className="aspect-square text-center text-xl font-bold border border-border rounded-sm focus:outline-none focus:border-trilce-primary"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-trilce-primary hover:bg-trilce-primary-dark disabled:opacity-60 text-white font-semibold py-3 rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Ingresando…' : 'Ingresar al portal'}
              {!loading && <Icon name="ArrowRight" size={18} />}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            ¿Aún no estás inscrito?{' '}
            <Link
              href="/inscripcion"
              className="text-trilce-primary font-semibold hover:underline"
            >
              Inscríbete aquí
            </Link>
          </p>
          <p className="text-center text-xs text-text-muted mt-3">
            <Link href="/" className="hover:underline">← Volver al inicio</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
