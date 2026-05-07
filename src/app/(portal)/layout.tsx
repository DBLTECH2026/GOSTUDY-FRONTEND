// Layout del Portal del Estudiante.
// Sidebar diferente al admin (scope='portal').

import { ReactNode } from 'react';

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-indigo-50">
      <aside className="w-64 bg-indigo-900 text-white p-4">
        <div className="font-bold text-xl mb-6">Mi Portal</div>
        <p className="text-xs text-indigo-300">
          [Sidebar portal — Persona C, lee getSidebarItems(&apos;estudiante&apos;, &apos;portal&apos;)]
        </p>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
