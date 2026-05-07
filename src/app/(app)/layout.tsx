'use client';

// Layout del panel admin/docente.
// El sidebar lee items desde src/shared/lib/sidebar-registry — registra los
// items de tu módulo en src/modules/<modulo>/sidebar.config.ts.

import { ReactNode, useState } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { Topbar } from '@/shared/components/Topbar';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // TODO: cuando Persona A tenga useAuthAdmin, leer rol y user reales
  const user = {
    initials: 'AR',
    name: 'Ana Ramírez',
    meta: 'Admin colegio',
  };

  return (
    <div className="min-h-screen flex bg-bg-page">
      <Sidebar
        scope="admin"
        role="admin"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="Panel administrativo"
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
