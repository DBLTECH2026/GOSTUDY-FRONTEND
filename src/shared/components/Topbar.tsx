import { ReactNode } from 'react';
import { Icon } from './Icon';

type TopbarProps = {
  title: string;
  subtitle?: string;
  user?: { initials: string; name: string; meta?: string };
  right?: ReactNode;
};

export function Topbar({ title, subtitle, user, right }: TopbarProps) {
  return (
    <header className="h-16 px-6 py-4 flex items-center justify-between bg-bg-card border-b border-border">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-lg font-bold text-text-primary">{title}</h1>
        {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {right}
        <Icon name="Bell" className="text-text-secondary" />
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-trilce-primary flex items-center justify-center text-text-on-primary text-xs font-semibold">
              {user.initials}
            </div>
            <div className="flex flex-col">
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
