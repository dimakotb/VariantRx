import type { ModelTab } from '@/types';

export default function StatusPill({
  status,
  model = 'pathnet',
}: {
  status: string;
  model?: ModelTab;
}) {
  const s = status.toUpperCase();
  let cls =
    'font-mono text-[9px] px-2 py-0.5 rounded-full tracking-[0.07em] font-bold border';

  if (s.includes('PATHOGENIC') || s.includes('HIGH') || s.includes('TOX')) {
    cls += ' bg-[rgba(255,91,91,0.15)] text-[var(--danger)] border-[rgba(255,91,91,0.3)]';
  } else if (s.includes('BENIGN') || s.includes('LOW') || s.includes('STANDARD')) {
    cls += ' bg-[rgba(0,212,170,0.12)] text-[var(--accent2)] border-[rgba(0,212,170,0.25)]';
  } else if (s === 'NOT RUN' || s === 'IDLE') {
    cls += ' bg-[rgba(59,142,255,0.08)] text-[var(--muted)] border-[var(--border)]';
  } else if (model === 'drugnet') {
    cls += ' bg-[rgba(0,212,170,0.12)] text-[var(--accent2)] border-[rgba(0,212,170,0.25)]';
  } else {
    cls += ' bg-[rgba(255,169,77,0.12)] text-[var(--warn)] border-[rgba(255,169,77,0.25)]';
  }

  return <span className={cls}>{status}</span>;
}
