export default function SourceChips({ sources = [] }: { sources?: string[] }) {
  if (!sources.length) return null;

  const chipClass = (s: string) => {
    const u = s.toLowerCase();
    if (u.includes('clin') || u === 'cv') return 'sc-cv';
    if (u.includes('pharm') || u === 'pg') return 'sc-pg';
    if (u.includes('cpic') || u === 'cp') return 'sc-cp';
    return 'sc-ot';
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {sources.map((s) => (
        <span
          key={s}
          className={`src-chip font-mono text-[8px] px-1 py-0.5 rounded tracking-wide ${
            chipClass(s) === 'sc-cv'
              ? 'bg-[rgba(59,142,255,0.1)] text-[var(--accent)] border border-[rgba(59,142,255,0.2)]'
              : chipClass(s) === 'sc-pg'
                ? 'bg-[rgba(0,212,170,0.1)] text-[var(--accent2)] border border-[rgba(0,212,170,0.2)]'
                : 'bg-[rgba(255,169,77,0.1)] text-[var(--warn)] border border-[rgba(255,169,77,0.2)]'
          }`}
        >
          {s}
        </span>
      ))}
    </div>
  );
}
