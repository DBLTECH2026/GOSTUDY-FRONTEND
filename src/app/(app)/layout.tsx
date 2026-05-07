// Layout del panel admin/docente.
// El sidebar lee items desde src/shared/lib/sidebar-registry (no editar el sidebar
// directamente — registra tus items en src/modules/<modulo>/sidebar.config.ts).

import { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white p-4">
        <div className="font-bold text-xl mb-6">GOSTUDY</div>
        <p className="text-xs text-slate-400">
          [Sidebar admin — implementar componente que lea getSidebarItems(role, &apos;admin&apos;)]
        </p>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
