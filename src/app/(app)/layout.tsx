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
  return (a + b).toUpperCase() || 'US';
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, ready } = useAuthGuard('admin');
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
    meta: user.rol === 'admin' ? 'Admin colegio' : 'Docente',
  };

  async function handleLogout() {
    await logout();
    router.replace('/admin-login');
  }

  return (
    <div className="min-h-screen flex bg-bg-page">
      <Sidebar
        scope="admin"
        role={user.rol === 'docente' ? 'docente' : 'admin'}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="Panel administrativo"
          user={headerUser}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
