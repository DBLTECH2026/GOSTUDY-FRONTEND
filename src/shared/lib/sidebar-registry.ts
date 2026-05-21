/**
 * Registro central de items del sidebar.
 *
 * ⚠️ NO MODIFICAR ESTE ARCHIVO directamente. Cada módulo exporta su config
 * en `src/modules/<modulo>/sidebar.config.ts`. Aquí solo se importan y unen.
 *
 * Si tu módulo no aparece en el sidebar, crea tu archivo config y agrégalo
 * a la lista de imports al final de este archivo.
 */

export type Role = 'admin' | 'docente' | 'estudiante';

export type SidebarItem = {
  label: string;
  href: string;
  icon: string; // nombre del icon de lucide-react
  roles: Role[];
  /** Si pertenece al portal del estudiante en lugar del admin */
  scope?: 'admin' | 'portal';
  /** Para agrupar items, opcional */
  group?: string;
  /** Orden dentro del sidebar (menor primero) */
  order?: number;
};

/* ───── Imports de configs por módulo ─────
 * Cada persona agrega aquí SU import cuando crea el archivo. */
import { authSidebar } from '@/modules/auth/sidebar.config';
import { personasSidebar } from '@/modules/personas/sidebar.config';
import { inscripcionSidebar } from '@/modules/inscripcion/sidebar.config';
import { catalogosSidebar } from '@/modules/catalogos/sidebar.config';
import { matriculaSidebar } from '@/modules/matricula/sidebar.config';
import { pagosSidebar } from '@/modules/pagos/sidebar.config';
import { portalSidebar } from '@/modules/portal/sidebar.config';
import { reportesSidebar } from '@/modules/reportes/sidebar.config';
import { academicoSidebar } from '@/modules/academico/sidebar.config';

const allItems: SidebarItem[] = [
  ...authSidebar,
  ...personasSidebar,
  ...inscripcionSidebar,
  ...catalogosSidebar,
  ...matriculaSidebar,
  ...pagosSidebar,
  ...portalSidebar,
  ...reportesSidebar,
  ...academicoSidebar,
];

export function getSidebarItems(role: Role, scope: 'admin' | 'portal' = 'admin'): SidebarItem[] {
  return allItems
    .filter((it) => (it.scope ?? 'admin') === scope)
    .filter((it) => it.roles.includes(role))
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}
