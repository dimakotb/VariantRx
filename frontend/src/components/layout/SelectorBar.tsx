import { useModel } from '@/context/ModelContext';
import { useVariant } from '@/context/VariantContext';
import { useDrugNet } from '@/hooks/useDrugNet';
import { usePathNet } from '@/hooks/usePathNet';
import VariantDropdown from '@/components/selector/VariantDropdown';

export default function SelectorBar() {
  const { selectedVariant, manualOverride, manualVariant } = useVariant();
  const { setActiveTab } = useModel();
  const { predict: predictPathNet, loading: loadingPathnet } = usePathNet();
  const { predict: predictDrugNet, loading: loadingDrugnet } = useDrugNet();

  const currentVariant = manualOverride ? manualVariant : selectedVariant;
  const hasVariant = Boolean(currentVariant?.rsid);
  const isDrugNetEnabled = Boolean(currentVariant?.hasDrug);

  const handleRunPathnet = async () => {
    if (!hasVariant || !currentVariant) return;
    setActiveTab('pathnet');
    await predictPathNet(currentVariant);
  };

  const handleRunDrugnet = async () => {
    if (!hasVariant || !isDrugNetEnabled || !currentVariant) return;
    setActiveTab('drugnet');
    await predictDrugNet(currentVariant);
  };

  return (
    <div className="bg-[var(--surface2)] border-b border-[var(--border)] px-5 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 select-none">
      <span className="font-mono text-[9px] tracking-[0.13em] text-[var(--muted)] sm:w-16 shrink-0 pt-3 sm:pt-0">
        VARIANT
      </span>

      <VariantDropdown />

      <div className="flex gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleRunPathnet}
          disabled={!hasVariant || loadingPathnet}
          className={`flex-1 sm:flex-none px-[13px] h-9 rounded font-mono text-[10px] font-bold tracking-[0.09em] flex items-center justify-center gap-1 transition-all cursor-pointer ${
            hasVariant && !loadingPathnet
              ? 'bg-[var(--accent)] text-white hover:opacity-[0.82] active:scale-[0.97]'
              : 'bg-[var(--surface3)] text-[var(--muted2)] opacity-35 cursor-not-allowed'
          }`}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
            <path d="M2 1.5L8.5 5L2 8.5V1.5Z" fill="currentColor" />
          </svg>
          {loadingPathnet ? 'RUNNING…' : 'RUN PATHNET'}
        </button>

        <button
          type="button"
          onClick={handleRunDrugnet}
          disabled={!hasVariant || !isDrugNetEnabled || loadingDrugnet}
          title={!isDrugNetEnabled ? 'DrugNet requires PGx overlap data' : 'Execute DrugNet'}
          className={`flex-1 sm:flex-none px-[13px] h-9 rounded font-mono text-[10px] font-bold tracking-[0.09em] flex items-center justify-center gap-1 transition-all cursor-pointer ${
            hasVariant && isDrugNetEnabled && !loadingDrugnet
              ? 'bg-[var(--accent2)] text-[var(--bg)] hover:opacity-[0.82] active:scale-[0.97]'
              : 'bg-[var(--surface3)] text-[var(--muted2)] border border-[var(--border)] opacity-55 cursor-not-allowed'
          }`}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
            <path d="M2 1.5L8.5 5L2 8.5V1.5Z" fill="currentColor" />
          </svg>
          {loadingDrugnet ? 'RUNNING…' : 'RUN DRUGNET'}
        </button>
      </div>
    </div>
  );
}
