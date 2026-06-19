import type { DrugAssociation } from '@/types';

export default function DrugList({ drugs = [] }: { drugs?: DrugAssociation[] }) {
  if (!drugs.length) {
    return (
      <p className="text-[var(--muted)] font-mono text-xs italic">
        No specific drug interactions documented.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {drugs.map((drug, index) => (
        <div
          key={`${drug.n}-${index}`}
          className={`drug-item flex items-center justify-between px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded ${drug.c}`}
        >
          <span className="font-mono text-[11px] text-[var(--text)]">{drug.n}</span>
          <span className={`drug-type text-[9px] px-1.5 py-0.5 rounded font-mono ${drug.c}`}>
            {drug.t}
          </span>
        </div>
      ))}
    </div>
  );
}
