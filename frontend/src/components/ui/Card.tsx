import type { HTMLAttributes } from 'react';

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`tc-card p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-ink-900)]">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-[var(--color-ink-500)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
