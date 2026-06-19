import type { Variant } from '@/types';

interface DropdownItemProps {
  variant: Variant;
  onSelect: (v: Variant) => void;
}

export default function DropdownItem({ variant, onSelect }: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(variant)}
      className="w-full grid grid-cols-[90px_90px_1fr_auto_auto] items-center gap-2 px-3 py-2 border-b border-[var(--border)] hover:bg-[var(--surface2)] cursor-pointer text-left transition-colors"
    >
      <span className="font-mono text-[11px] text-[var(--accent)] font-bold">{variant.rsid}</span>
      <span className="font-mono text-[10px] text-[var(--text)]">{variant.gene}</span>
      <span className="text-[11px] text-[var(--muted)] truncate">{variant.desc}</span>
      <span className={`di-tag font-mono text-[8px] px-1.5 py-0.5 rounded ${variant.hasDrug ? variant.cat : 'tag-na'}`}>
        {variant.hasDrug ? variant.tag : 'ClinVar only'}
      </span>
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${variant.hasDrug ? 'bg-[var(--accent2)]' : 'bg-[var(--muted2)]'}`}
        title={variant.hasDrug ? 'PGx overlap' : 'ClinVar only'}
      />
    </button>
  );
}
