import type { SidebarItem } from '@/shared/lib/sidebar-registry';

export const academicoSidebar: SidebarItem[] = [
  {
    label: 'Cursos',
    href: '/cursos',
    icon: 'BookOpen',
    roles: ['admin'],
    scope: 'admin',
    order: 22,
  },
  {
    label: 'Asignaciones',
    href: '/asignaciones',
    icon: 'List',
    roles: ['admin'],
    scope: 'admin',
    order: 23,
  },
  {
    label: 'Horarios',
    href: '/horarios',
    icon: 'Calendar',
    roles: ['admin'],
    scope: 'admin',
    order: 24,
  },
  // Solo visible para docentes — ven sus clases asignadas
  {
    label: 'Mis clases',
    href: '/mis-clases',
    icon: 'GraduationCap',
    roles: ['docente'],
    scope: 'admin',
    order: 10,
  },
];
