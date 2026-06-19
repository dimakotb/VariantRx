import type { ModelTab } from '@/types';

interface TabStatusPillProps {
  status: string;
  model?: ModelTab;
}

export default function TabStatusPill({ status, model }: TabStatusPillProps) {
  const stat = status.toUpperCase();

  let cls =
    'font-mono text-[8px] px-1.5 py-0.5 rounded-[10px] tracking-[0.05em] border';

  if (stat === 'N/A') {
    cls += ' bg-[rgba(78,96,122,0.08)] text-[var(--muted2)] border-[var(--border)]';
  } else if (stat === 'RUNNING') {
    cls += ' bg-[rgba(255,169,77,0.12)] text-[var(--warn)] border-[rgba(255,169,77,0.3)]';
  } else if (stat === 'DONE') {
    cls +=
      model === 'drugnet'
        ? ' bg-[rgba(0,212,170,0.12)] text-[var(--accent2)] border-[rgba(0,212,170,0.25)]'
        : ' bg-[rgba(59,142,255,0.08)] text-[var(--muted)] border-[var(--border)]';
  } else {
    cls += ' bg-[rgba(78,96,122,0.12)] text-[var(--muted2)] border-[var(--border)]';
  }

  return <span className={cls}>{stat === 'DONE' ? 'READY' : stat}</span>;
}
