import type { ReactNode } from 'react';
import { useVariant } from '@/context/VariantContext';
import { useModel } from '@/context/ModelContext';
import VariantInputForm from '@/components/sidebar/VariantInputForm';
import AvailabilityPanel from '@/components/sidebar/AvailabilityPanel';

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="sec-hdr flex items-center gap-1.5 px-[18px] py-2.5 font-mono text-[8px] tracking-[0.16em] text-[var(--muted)] border-b border-[var(--border)]">
      {children}
    </div>
  );
}

export default function Sidebar() {
  const { manualOverride, setManualOverride, resetSelection } = useVariant();
  const { resetPredictions } = useModel();

  const handleToggleOverride = (checked: boolean) => {
    setManualOverride(checked);
    resetPredictions();
    if (checked) resetSelection();
  };

  return (
    <aside className="w-full lg:w-[300px] shrink-0 bg-[var(--surface)] border-b lg:border-b-0 lg:border-r border-[var(--border)] flex flex-col overflow-y-auto max-h-[50vh] lg:max-h-none">
      <SectionHeader>MANUAL OVERRIDE</SectionHeader>
      <div className="px-[18px] py-3.5 flex flex-col gap-2">
        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[var(--text)]">
          <input
            type="checkbox"
            checked={manualOverride}
            onChange={(e) => handleToggleOverride(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          Custom input (not in inference catalog)
        </label>
        <p className="font-mono text-[8px] text-[var(--muted)] leading-relaxed">
          Demo-only with mock API. For live backend, search and select a catalog variant.
        </p>
      </div>

      <div className="px-[18px] py-3.5 flex-1 space-y-0">
        <VariantInputForm />
      </div>

      <div className="mt-auto px-[18px] pb-4">
        <AvailabilityPanel />
      </div>
    </aside>
  );
}
