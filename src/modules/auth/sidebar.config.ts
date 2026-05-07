import type { SidebarItem } from '@/shared/lib/sidebar-registry';

// Persona A: el módulo Auth normalmente no agrega items al sidebar
// (el login no está en sidebar). Dejar vacío salvo que sea necesario.
export const authSidebar: SidebarItem[] = [];
