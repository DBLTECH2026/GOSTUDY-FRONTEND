'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const TABS = [
  { href: '/reportes/inscripciones',          label: 'Inscripciones' },
  { href: '/reportes/matriculas-por-seccion', label: 'Matrículas por sección' },
  { href: '/reportes/pagos-por-periodo',      label: 'Pagos por período' },
];

export default function ReportesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-5">
      <nav className="flex items-center gap-1.5 p-1.5 bg-bg-card rounded-md border border-border w-fit">
        {TABS.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`px-4 py-2 rounded-sm text-[13px] transition-colors ${
                active
                  ? 'bg-trilce-primary text-text-on-primary font-semibold'
                  : 'text-text-secondary hover:bg-bg-muted'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
