import { useEffect, useRef } from 'react';
import { useVariant } from '@/context/VariantContext';
import DropdownItem from '@/components/selector/DropdownItem';
import SelectedChip from '@/components/selector/SelectedChip';

const GROUPS = [
  { label: 'PGx OVERLAP — DrugNet + PathNet', note: '~1,600 rows', pgx: true },
  { label: 'ClinVar ONLY — PathNet only', note: 'filtered ClinVar', pgx: false },
] as const;

export default function VariantDropdown() {
  const {
    variants,
    selectedVariant,
    searchQuery,
    setSearchQuery,
    isDropdownOpen,
    setIsDropdownOpen,
    loading,
    selectVariant,
    resetSelection,
    manualOverride,
  } = useVariant();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsDropdownOpen]);

  return (
    <div className="relative flex-1 min-w-0" ref={dropdownRef}>
      {selectedVariant && !manualOverride ? (
        <div className="flex items-center bg-[var(--bg)] border border-[var(--border-hi)] rounded h-9 px-3">
          <SelectedChip
            rsid={selectedVariant.rsid}
            gene={selectedVariant.gene}
            hasDrug={selectedVariant.hasDrug}
            inCatalog={selectedVariant.pathnetEligible !== false}
            onClear={resetSelection}
          />
        </div>
      ) : (
        <div className="flex items-center bg-[var(--bg)] border border-[var(--border-hi)] rounded overflow-hidden focus-within:border-[var(--accent)]">
          <span className="pl-2.5 text-[var(--muted)] font-mono text-[13px]">⌕</span>
          <input
            type="text"
            placeholder="Search rsID, gene, or drug…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="flex-1 bg-transparent border-none outline-none text-[var(--text)] font-mono text-xs py-2 pr-3 caret-[var(--accent)] placeholder:text-[var(--muted2)]"
          />
          {loading && (
            <span className="pr-2 text-[var(--accent)] text-[10px] animate-pulse">…</span>
          )}
        </div>
      )}

      {isDropdownOpen && searchQuery.trim().length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-[var(--surface)] border border-[var(--border-hi)] rounded max-h-[260px] overflow-y-auto shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
          {!loading && variants.length === 0 && (
            <p className="p-4 text-center font-mono text-[11px] text-[var(--muted)]">
              No matches — use Manual Override in the sidebar.
            </p>
          )}
          {GROUPS.map((group) => {
            const items = variants.filter((v) => v.hasDrug === group.pgx);
            if (!items.length) return null;
            return (
              <div key={group.label}>
                <div className="px-3 py-2 bg-[var(--surface2)] border-b border-[var(--border)] flex justify-between font-mono text-[9px] tracking-[0.14em] text-[var(--muted)]">
                  <span>{group.label}</span>
                  <span className="text-[var(--muted2)]">{group.note}</span>
                </div>
                {items.map((v) => (
                  <DropdownItem key={v.rsid} variant={v} onSelect={selectVariant} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
