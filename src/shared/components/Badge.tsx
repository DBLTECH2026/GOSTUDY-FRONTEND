import { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success text-text-on-primary',
  warning: 'bg-warning text-text-on-primary',
  danger:  'bg-danger text-text-on-primary',
  info:    'bg-info text-text-on-primary',
  primary: 'bg-trilce-primary text-text-on-primary',
  neutral: 'bg-bg-card text-text-secondary border border-border',
};

export function Badge({
  variant = 'neutral',
  children,
  className = '',
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[11px] font-semibold ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
