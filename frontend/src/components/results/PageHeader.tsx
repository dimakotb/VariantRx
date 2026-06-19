import { useVariant } from '@/context/VariantContext';
import { useDrugNet } from '@/hooks/useDrugNet';
import { usePathNet } from '@/hooks/usePathNet';
import MstatIndicator from '@/components/ui/MstatIndicator';
import StatusPill from '@/components/ui/StatusPill';
import type { ModelTab } from '@/types';

export default function PageHeader({ activeTab }: { activeTab: ModelTab }) {
  const { result: pathnetResult, loading: loadingPathnet } = usePathNet();
  const { result: drugnetResult, loading: loadingDrugnet } = useDrugNet();
  const { selectedVariant, manualOverride, manualVariant } = useVariant();
  const variant = manualOverride ? manualVariant : selectedVariant;
  const isPath = activeTab === 'pathnet';

  const mstatStatus = isPath
    ? loadingPathnet
      ? 'running'
      : pathnetResult
        ? 'done'
        : 'idle'
    : !variant?.hasDrug
      ? 'na'
      : loadingDrugnet
        ? 'running'
        : drugnetResult
          ? 'done'
          : 'idle';

  const pillStatus = isPath
    ? pathnetResult?.label ?? 'NOT RUN'
    : drugnetResult?.label ?? 'NOT RUN';

  return (
    <div className="bg-[var(--surface)] border-b border-[var(--border)] px-[22px] py-3 flex justify-between items-center shrink-0">
      <div>
        <h1
          className={`font-mono text-[11px] font-bold tracking-[0.12em] ${
            isPath ? 'text-[var(--accent)]' : 'text-[var(--accent2)]'
          }`}
        >
          {isPath ? 'PATHNET — Pathogenicity Model' : 'DRUGNET — Drug Response Model'}
        </h1>
        <p className="text-[10px] text-[var(--muted)] mt-0.5">
          {isPath ? 'Filtered ClinVar dataset' : 'PGx overlap dataset (~1,600)'}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <MstatIndicator status={mstatStatus} />
        <StatusPill status={pillStatus} model={activeTab} />
      </div>
    </div>
  );
}
