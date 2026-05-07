import type { SidebarItem } from '@/shared/lib/sidebar-registry';

// Persona C — items del Portal del Estudiante (scope='portal')
export const portalSidebar: SidebarItem[] = [
  {
    label: 'Inicio',
    href: '/inicio',
    icon: 'House',
    roles: ['estudiante'],
    scope: 'portal',
    order: 1,
  },
  {
    label: 'Mi matrícula',
    href: '/mi-matricula',
    icon: 'FileText',
    roles: ['estudiante'],
    scope: 'portal',
    order: 2,
  },
  {
    label: 'Mis pagos',
    href: '/mis-pagos',
    icon: 'CreditCard',
    roles: ['estudiante'],
    scope: 'portal',
    order: 3,
  },
  {
    label: 'Mis cursos',
    href: '/mis-cursos',
    icon: 'BookOpen',
    roles: ['estudiante'],
    scope: 'portal',
    order: 4,
  },
  {
    label: 'Mi perfil',
    href: '/mi-perfil',
    icon: 'User',
    roles: ['estudiante'],
    scope: 'portal',
    order: 5,
  },
];
