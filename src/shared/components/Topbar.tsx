import { ReactNode } from 'react';
import { Icon } from './Icon';

type TopbarProps = {
  title: string;
  subtitle?: string;
  user?: { initials: string; name: string; meta?: string };
  right?: ReactNode;
  /** Callback al tocar la hamburguesa en mobile. */
  onMenuClick?: () => void;
};

export function Topbar({ title, subtitle, user, right, onMenuClick }: TopbarProps) {
  return (
    <header className="h-16 px-4 sm:px-6 py-4 flex items-center justify-between bg-bg-card border-b border-border gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburguesa visible solo en mobile/tablet (< lg) */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 -ml-1.5 rounded-sm text-text-secondary hover:bg-bg-muted"
            aria-label="Abrir menú"
          >
            <Icon name="List" size={22} />
          </button>
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-text-primary truncate">{title}</h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-text-secondary truncate">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {right}
        <Icon name="Bell" className="text-text-secondary hidden sm:block" />
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-trilce-primary flex items-center justify-center text-text-on-primary text-xs font-semibold flex-shrink-0">
              {user.initials}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[13px] font-semibold text-text-primary leading-tight">
                {user.name}
              </span>
              {user.meta && (
                <span className="text-[11px] text-text-secondary leading-tight">
                  {user.meta}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
