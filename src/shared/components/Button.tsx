import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'on-dark';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   'bg-trilce-primary text-text-on-primary hover:bg-trilce-primary-dark',
  secondary: 'bg-bg-card text-text-secondary border border-border hover:bg-bg-muted',
  ghost:     'text-trilce-primary hover:bg-trilce-primary-soft',
  danger:    'bg-danger text-text-on-primary hover:opacity-90',
  'on-dark': 'bg-bg-card text-trilce-primary hover:bg-trilce-primary-soft',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
