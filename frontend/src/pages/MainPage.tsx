import AppShell from '@/components/layout/AppShell';
import SelectorBar from '@/components/layout/SelectorBar';
import Sidebar from '@/components/sidebar/Sidebar';
import ResultsPanel from '@/components/results/ResultsPanel';

export default function MainPage() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <SelectorBar />
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          <Sidebar />
          <ResultsPanel />
        </div>
      </div>
    </AppShell>
  );
}
