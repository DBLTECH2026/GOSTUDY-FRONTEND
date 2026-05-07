import { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-bg-card border border-border rounded-md p-6 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  icon,
  title,
  right,
}: {
  icon?: ReactNode;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2.5">
        {icon}
        <h2 className="text-base font-bold text-text-primary">{title}</h2>
      </div>
      {right}
    </div>
  );
}
