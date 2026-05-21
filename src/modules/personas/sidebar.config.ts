import type { SidebarItem } from '@/shared/lib/sidebar-registry';

export const personasSidebar: SidebarItem[] = [
  {
    label: 'Estudiantes',
    href: '/estudiantes',
    icon: 'GraduationCap',
    roles: ['admin'],
    scope: 'admin',
    order: 20,
  },
  {
    label: 'Docentes',
    href: '/docentes',
    icon: 'Users',
    roles: ['admin'],
    scope: 'admin',
    order: 21,
  },
];
