'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSidebarItems, Role, SidebarItem } from '@/shared/lib/sidebar-registry';
import { Icon, IconName } from './Icon';

type SidebarProps = {
  scope: 'admin' | 'portal';
  role: Role;
  /** Si true, se muestra como drawer en mobile (oculto por defecto). */
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ scope, role, open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = getSidebarItems(role, scope);

  const isPortal = scope === 'portal';

  return (
    <>
      {/* Overlay en mobile cuando está abierto */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-60 flex-col gap-1.5 p-6
          overflow-y-auto
          transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:flex-shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
          ${isPortal
            ? 'bg-bg-card border-r border-border'
            : 'bg-trilce-accent text-white'}
        `}
      >
        {/* Botón cerrar visible solo en mobile cuando está abierto */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 lg:hidden ${isPortal ? 'text-text-muted hover:text-text-secondary' : 'text-white/60 hover:text-white'}`}
          aria-label="Cerrar menú"
        >
          <Icon name="X" size={20} />
        </button>

        {isPortal ? (
          <PortalContents items={items} pathname={pathname} onNavigate={onClose} />
        ) : (
          <AdminContents items={items} pathname={pathname} onNavigate={onClose} />
        )}
      </aside>
    </>
  );
}

function PortalContents({
  items, pathname, onNavigate,
}: {
  items: SidebarItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <div className="w-8 h-8 rounded-md bg-trilce-primary flex items-center justify-center text-text-on-primary font-bold text-lg">
          T
        </div>
        <span className="text-sm font-semibold text-text-primary">Mi Portal</span>
      </div>
      <div className="px-3 py-4 text-[11px] font-bold tracking-widest text-text-muted">
        MENU
      </div>
      {items.map((item) => {
        const active = pathname.endsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-3 rounded-sm text-sm transition-colors ${
              active
                ? 'bg-trilce-primary-light text-trilce-primary-dark font-semibold'
                : 'text-text-secondary hover:bg-bg-muted'
            }`}
          >
            <Icon
              name={item.icon as IconName}
              size={20}
              className={active ? 'text-trilce-primary' : 'text-text-secondary'}
            />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function AdminContents({
  items, pathname, onNavigate,
}: {
  items: SidebarItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
        <div className="w-8 h-8 rounded-md bg-trilce-primary flex items-center justify-center text-text-on-primary font-bold text-lg">
          T
        </div>
        <span className="text-base font-bold tracking-wide">GOSTUDY</span>
      </div>
      <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-white/40">
        PRINCIPAL
      </div>
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-3 rounded-sm text-sm transition-colors ${
              active
                ? 'bg-trilce-primary text-white font-semibold'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon name={item.icon as IconName} size={18} className="text-current" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
