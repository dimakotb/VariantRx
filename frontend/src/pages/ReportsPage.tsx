import AppShell from '@/components/layout/AppShell';
import HistoryPanel from '@/components/results/HistoryPanel';

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
          <h1 className="font-mono text-sm font-bold text-[var(--text)] tracking-wide">
            Patient reports
          </h1>
          <p className="text-[var(--muted)] text-[10px] font-mono mt-1">
            Saved PathNet / DrugNet analyses · edit notes · export HTML
          </p>
        </div>
        <HistoryPanel />
      </div>
    </AppShell>
  );
}
