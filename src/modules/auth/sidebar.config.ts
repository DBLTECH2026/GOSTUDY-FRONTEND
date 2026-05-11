import type { SidebarItem } from '@/shared/lib/sidebar-registry';

// Auth registra el "Dashboard" del panel admin (entrada principal)
export const authSidebar: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'House',
    roles: ['admin', 'docente'],
    scope: 'admin',
    order: 1,
  },
];
