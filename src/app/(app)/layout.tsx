// Layout del panel admin/docente.
// El sidebar lee items desde src/shared/lib/sidebar-registry — registra los
// items de tu módulo en src/modules/<modulo>/sidebar.config.ts.

import { ReactNode } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { Topbar } from '@/shared/components/Topbar';

export default function AppLayout({ children }: { children: ReactNode }) {
  // TODO: cuando Persona A tenga useAuthAdmin, leer rol y user reales
  const user = {
    initials: 'AR',
    name: 'Ana Ramírez',
    meta: 'Admin colegio',
  };

  return (
    <div className="min-h-screen flex bg-bg-page">
      <Sidebar scope="admin" role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar title="Panel administrativo" user={user} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
