'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { Topbar } from '@/shared/components/Topbar';

export default function PortalLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // TODO: cuando Persona A tenga useAuthPortal, leer estudiante real
  const estudiante = {
    initials: 'JP',
    name: 'Juan Carlos Pérez',
    meta: '3ro Primaria — A',
  };

  return (
    <div className="min-h-screen flex bg-bg-page">
      <Sidebar
        scope="portal"
        role="estudiante"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="Mi Portal"
          subtitle="Bienvenido a tu portal estudiantil"
          user={estudiante}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
