import type { SidebarItem } from '@/shared/lib/sidebar-registry';

// Persona C — items del módulo Reportes (admin)
export const reportesSidebar: SidebarItem[] = [
  {
    label: 'Reportes',
    href: '/reportes/inscripciones',
    icon: 'ChartBar',
    roles: ['admin'],
    order: 50,
  },
];
