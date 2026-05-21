'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { Topbar } from '@/shared/components/Topbar';
import { useAuthGuard } from '@/modules/auth/useAuthGuard';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useRouter } from 'next/navigation';

function initialsOf(nombres = '', apellidos = '') {
  const a = nombres.trim().charAt(0);
  const b = apellidos.trim().charAt(0);
  return (a + b).toUpperCase() || 'ES';
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, ready } = useAuthGuard('estudiante');
  const { logout } = useAuth();
  const router = useRouter();

  if (!ready || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary text-sm">
        Cargando…
      </div>
    );
  }

  const headerUser = {
    initials: initialsOf(user.nombres, user.apellidos),
    name: user.nombre,
    meta: user.codigo_estudiante ?? 'Estudiante',
  };

  async function handleLogout() {
    await logout();
    router.replace('/portal-login');
  }

  return (
    <div className="h-screen flex bg-bg-page overflow-hidden">
      <Sidebar
        scope="portal"
        role="estudiante"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Topbar
          title="Mi Portal"
          subtitle="Bienvenido a tu portal estudiantil"
          user={headerUser}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
