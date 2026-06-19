import type { ReactNode } from 'react';

const variants = {
  info: 'border-[var(--accent)] text-[var(--accent)]',
  success: 'border-[var(--accent2)] text-[var(--accent2)]',
  warning: 'border-[var(--warn)] text-[var(--warn)]',
  danger: 'border-[var(--danger)] text-[var(--danger)]',
  accent: 'border-[var(--accent)] text-[var(--accent)]',
  neutral: 'border-[var(--border)] text-[var(--muted)]',
} as const;

export default function Badge({
  children,
  variant = 'neutral',
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={`font-mono text-[9px] tracking-[0.09em] px-[7px] py-[3px] rounded border ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
