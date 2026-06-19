export default function MstatIndicator({
  status,
}: {
  status: 'idle' | 'running' | 'done' | 'na';
}) {
  const labels = { idle: 'IDLE', running: 'RUNNING', done: 'DONE', na: 'N/A' };
  const dotClass =
    status === 'running'
      ? 'bg-[var(--warn)] animate-pulse'
      : status === 'done'
        ? 'bg-[var(--accent2)]'
        : status === 'na'
          ? 'bg-[var(--muted2)] opacity-30'
          : 'bg-[var(--muted2)]';

  return (
    <div className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--muted)] tracking-[0.07em]">
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {labels[status]}
    </div>
  );
}
