import { useVariant } from '@/context/VariantContext';

export default function AvailabilityPanel() {
  const { selectedVariant, manualOverride, manualVariant } = useVariant();
  const currentVariant = manualOverride ? manualVariant : selectedVariant;
  const isDrugNetEnabled = Boolean(currentVariant?.hasDrug);
  const hasSelection = Boolean(currentVariant?.rsid);

  return (
    <div
      className={`rounded p-[11px] ${
        isDrugNetEnabled
          ? 'bg-[rgba(0,212,170,0.07)] border border-[rgba(0,212,170,0.22)]'
          : 'bg-[rgba(78,96,122,0.06)] border border-[var(--border)]'
      }`}
    >
      <div
        className={`font-mono text-[8px] tracking-[0.13em] mb-2 ${
          isDrugNetEnabled ? 'text-[var(--accent2)]' : 'text-[var(--muted)]'
        }`}
      >
        {hasSelection
          ? isDrugNetEnabled
            ? 'PGX OVERLAP DETECTED'
            : 'CLINVAR ONLY VARIANT'
          : 'SELECT A VARIANT'}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-[7px] h-[7px] rounded-full bg-[var(--accent2)] shrink-0" />
          <span className="font-mono text-[9px] text-[var(--accent2)] flex-1">
            PathNet · filtered ClinVar
          </span>
          <span className="font-mono text-[8px] px-1 py-0.5 rounded border ab-path bg-[rgba(59,142,255,0.12)] text-[var(--accent)] border-[rgba(59,142,255,0.2)]">
            ALL VARIANTS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-[7px] h-[7px] rounded-full shrink-0 ${
              isDrugNetEnabled ? 'bg-[var(--accent2)]' : 'bg-[var(--muted2)]'
            }`}
          />
          <span
            className={`font-mono text-[9px] flex-1 ${
              isDrugNetEnabled ? 'text-[var(--accent2)]' : 'text-[var(--muted)]'
            }`}
          >
            DrugNet · PGx overlap
          </span>
          <span
            className={`font-mono text-[8px] px-1 py-0.5 rounded border ${
              isDrugNetEnabled
                ? 'bg-[rgba(0,212,170,0.12)] text-[var(--accent2)] border-[rgba(0,212,170,0.2)]'
                : 'bg-[rgba(78,96,122,0.1)] text-[var(--muted)] border-[var(--border)]'
            }`}
          >
            {isDrugNetEnabled ? 'AVAILABLE' : '~1,600 ROWS'}
          </span>
        </div>
      </div>

      <p className="font-mono text-[9px] text-[var(--muted)] mt-2 leading-[1.6]">
        {hasSelection
          ? isDrugNetEnabled
            ? 'Both PathNet and DrugNet pipelines are available for this variant.'
            : 'DrugNet is locked — no PharmGKB/CPIC overlap for this variant.'
          : 'Select a variant to check DrugNet availability.'}
      </p>
    </div>
  );
}
