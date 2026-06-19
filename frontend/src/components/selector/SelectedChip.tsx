interface SelectedChipProps {
  rsid: string;
  gene: string;
  hasDrug?: boolean;
  inCatalog?: boolean;
  onClear: () => void;
}

export default function SelectedChip({
  rsid,
  gene,
  hasDrug,
  inCatalog = true,
  onClear,
}: SelectedChipProps) {
  return (
    <div className="flex items-center gap-2 w-full min-w-0">
      <span className="font-mono text-[11px] text-[var(--accent)] font-bold shrink-0">{rsid}</span>
      <span className="font-mono text-[10px] text-[var(--muted)] truncate">({gene})</span>
      {inCatalog && (
        <span
          className={`font-mono text-[7px] px-1 py-0.5 rounded border shrink-0 ${
            hasDrug
              ? 'text-[var(--accent2)] border-[rgba(0,212,170,0.25)] bg-[rgba(0,212,170,0.08)]'
              : 'text-[var(--muted)] border-[var(--border)] bg-[rgba(78,96,122,0.08)]'
          }`}
        >
          {hasDrug ? 'PGx' : 'ClinVar'}
        </span>
      )}
      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-[var(--muted)] hover:text-[var(--text)] text-base leading-none cursor-pointer bg-transparent border-none shrink-0"
        aria-label="Clear selection"
      >
        ×
      </button>
    </div>
  );
}
