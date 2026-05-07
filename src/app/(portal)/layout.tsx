import { ReactNode } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { Topbar } from '@/shared/components/Topbar';

export default function PortalLayout({ children }: { children: ReactNode }) {
  // TODO: cuando Persona A tenga useAuthPortal, leer estudiante real
  const estudiante = {
    initials: 'JP',
    name: 'Juan Carlos Pérez',
    meta: '3ro Primaria — A',
  };

  return (
    <div className="min-h-screen flex bg-bg-page">
      <Sidebar scope="portal" role="estudiante" />
      <div className="flex-1 flex flex-col">
        <Topbar
          title="Mi Portal"
          subtitle="Bienvenido a tu portal estudiantil"
          user={estudiante}
        />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
