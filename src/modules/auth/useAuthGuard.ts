'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import type { TipoUsuario } from './types';

/**
 * Redirige al login correspondiente si no hay sesión activa
 * o si el tipo de usuario no coincide con el esperado.
 */
export function useAuthGuard(esperado: TipoUsuario) {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace(esperado === 'admin' ? '/admin-login' : '/portal-login');
      return;
    }
    if (user.tipo !== esperado) {
      // Tiene sesión pero del rol equivocado -> mandarlo a su panel
      router.replace(user.tipo === 'admin' ? '/dashboard' : '/inicio');
    }
  }, [user, hydrated, esperado, router]);

  return { user, hydrated, ready: hydrated && user?.tipo === esperado };
}
