import SourceChips from '@/components/results/SourceChips';
import type { Variant } from '@/types';

export default function ResultCard({ variant }: { variant: Variant }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded p-5 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="gene-tag inline-flex items-center gap-1 px-2 py-1 bg-[var(--surface2)] border border-[var(--border)] rounded font-mono text-[11px]">
          {variant.gene}
        </span>
        <span className="font-mono text-[11px] text-[var(--accent)]">{variant.rsid}</span>
      </div>
      <p className="text-[11px] text-[var(--muted)] leading-relaxed">{variant.desc}</p>
      {variant.diseases?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {variant.diseases.map((d) => (
            <span
              key={d}
              className="text-[10px] px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--muted)]"
            >
              {d}
            </span>
          ))}
        </div>
      )}
      <SourceChips sources={variant.src} />
    </div>
  );
}
