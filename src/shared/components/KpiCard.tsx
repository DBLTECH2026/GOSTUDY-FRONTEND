import { ReactNode } from 'react';
import { Icon, IconName } from './Icon';

type KpiCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: IconName;
  iconColor?: string;
  /** Si true, el label es naranja (para reportes) */
  emphasize?: boolean;
  emphasizeColor?: 'success' | 'warning' | 'danger' | 'primary' | 'info';
};

const EMPHASIZE_CLASS: Record<NonNullable<KpiCardProps['emphasizeColor']>, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger:  'text-danger',
  primary: 'text-trilce-primary',
  info:    'text-info',
};

export function KpiCard({
  label,
  value,
  hint,
  icon,
  iconColor,
  emphasize,
  emphasizeColor = 'primary',
}: KpiCardProps) {
  return (
    <div className="flex-1 bg-bg-card border border-border rounded-md p-5">
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-bold tracking-wide ${
            emphasize ? EMPHASIZE_CLASS[emphasizeColor] : 'text-text-secondary'
          }`}
        >
          {label}
        </span>
        {icon && (
          <Icon name={icon} size={20} className={iconColor ?? 'text-text-muted'} />
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      {hint && <div className="text-[11px] text-text-muted mt-1">{hint}</div>}
    </div>
  );
}
