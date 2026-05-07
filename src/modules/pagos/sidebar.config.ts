import type { SidebarItem } from '@/shared/lib/sidebar-registry';

// Persona C — items del módulo Pagos (admin)
export const pagosSidebar: SidebarItem[] = [
  {
    label: 'Pagos',
    href: '/pagos',
    icon: 'CreditCard',
    roles: ['admin'],
    order: 40,
  },
];
