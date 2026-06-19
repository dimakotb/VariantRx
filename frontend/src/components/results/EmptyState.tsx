import { DnaHelixEmpty } from '@/components/ui/Logo';
import type { ModelTab } from '@/types';

export default function EmptyState({ activeTab }: { activeTab: ModelTab }) {
  const isPath = activeTab === 'pathnet';

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-5 py-12 select-none">
      <DnaHelixEmpty accent={isPath ? 'accent' : 'accent2'} />
      <h3 className="font-mono text-[11px] tracking-[0.1em] text-[var(--muted)] mt-3">
        SELECT A VARIANT TO BEGIN
      </h3>
      <p className="text-[11px] text-[var(--muted)] opacity-60 max-w-[320px] leading-[1.7] mt-2">
        <span
          className="font-mono text-[10px] tracking-[0.07em] block mb-1"
          style={{ color: isPath ? 'var(--accent)' : 'var(--accent2)' }}
        >
          {isPath ? 'PathNet — filtered ClinVar' : 'DrugNet — PGx overlap (~1,600)'}
        </span>
        {isPath
          ? 'Runs independently on all ClinVar variants.'
          : 'Requires PharmGKB/CPIC overlap data.'}
      </p>
    </div>
  );
}
