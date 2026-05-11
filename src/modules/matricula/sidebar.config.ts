import type { SidebarItem } from '@/shared/lib/sidebar-registry';

export const matriculaSidebar: SidebarItem[] = [
  {
    label: 'Matrícula',
    href: '/matricula',
    icon: 'Folder',
    roles: ['admin'],
    scope: 'admin',
    order: 15,
  },
];
