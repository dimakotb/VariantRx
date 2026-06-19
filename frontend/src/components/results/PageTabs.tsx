import { useModel } from '@/context/ModelContext';
import { useVariant } from '@/context/VariantContext';
import { useDrugNet } from '@/hooks/useDrugNet';
import { usePathNet } from '@/hooks/usePathNet';
import TabStatusPill from '@/components/ui/TabStatusPill';
import type { ModelTab } from '@/types';

export default function PageTabs() {
  const { activeTab, setActiveTab } = useModel();
  const { result: pathnetResult, loading: loadingPathnet } = usePathNet();
  const { result: drugnetResult, loading: loadingDrugnet } = useDrugNet();
  const { selectedVariant, manualOverride, manualVariant } = useVariant();

  const currentVariant = manualOverride ? manualVariant : selectedVariant;
  const isDrugNetEnabled = Boolean(currentVariant?.hasDrug);

  const pathnetStatus = loadingPathnet
    ? 'RUNNING'
    : pathnetResult
      ? 'DONE'
      : 'IDLE';

  const drugnetStatus = !currentVariant || !isDrugNetEnabled
    ? 'N/A'
    : loadingDrugnet
      ? 'RUNNING'
      : drugnetResult
        ? 'DONE'
        : 'IDLE';

  const tabClass = (tab: ModelTab) => {
    const base =
      'flex items-center gap-2 px-[22px] h-11 font-mono text-[10px] font-bold tracking-[0.1em] border-b-2 transition-colors cursor-pointer';
    if (activeTab === tab) {
      return tab === 'pathnet'
        ? `${base} text-[var(--accent)] border-[var(--accent)]`
        : `${base} text-[var(--accent2)] border-[var(--accent2)]`;
    }
    return `${base} text-[var(--muted)] border-transparent hover:text-[var(--text)]`;
  };

  return (
    <div className="flex items-stretch h-11 bg-[var(--surface)] border-b border-[var(--border)] select-none">
      <button type="button" onClick={() => setActiveTab('pathnet')} className={tabClass('pathnet')}>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
        PATHNET
        <TabStatusPill status={pathnetStatus} model="pathnet" />
      </button>
      <div className="w-px bg-[var(--border)] my-2" />
      <button type="button" onClick={() => setActiveTab('drugnet')} className={tabClass('drugnet')}>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent2)] shrink-0" />
        DRUGNET
        <TabStatusPill status={drugnetStatus} model="drugnet" />
      </button>
    </div>
  );
}
