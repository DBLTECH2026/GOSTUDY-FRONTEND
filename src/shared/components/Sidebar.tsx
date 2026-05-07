'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSidebarItems, Role, SidebarItem } from '@/shared/lib/sidebar-registry';
import { Icon, IconName } from './Icon';

type SidebarProps = {
  scope: 'admin' | 'portal';
  role: Role;
};

export function Sidebar({ scope, role }: SidebarProps) {
  const pathname = usePathname();
  const items = getSidebarItems(role, scope);

  if (scope === 'portal') {
    return <PortalSidebar items={items} pathname={pathname} />;
  }
  return <AdminSidebar items={items} pathname={pathname} />;
}

function PortalSidebar({ items, pathname }: { items: SidebarItem[]; pathname: string }) {
  return (
    <aside className="w-60 bg-bg-card border-r border-border p-6 flex flex-col gap-1.5">
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
    </aside>
  );
}

function AdminSidebar({ items, pathname }: { items: SidebarItem[]; pathname: string }) {
  return (
    <aside className="w-60 bg-trilce-accent text-white p-6 flex flex-col gap-1.5">
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
    </aside>
  );
}
