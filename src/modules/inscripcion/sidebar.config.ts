import type { SidebarItem } from '@/shared/lib/sidebar-registry';

export const inscripcionSidebar: SidebarItem[] = [
  {
    label: 'Inscripciones',
    href: '/inscripciones',
    icon: 'FileText',
    roles: ['admin'],
    scope: 'admin',
    order: 10,
  },
];
