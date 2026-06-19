import { useModel } from '@/context/ModelContext';
import { useVariant } from '@/context/VariantContext';
import { useDrugNet } from '@/hooks/useDrugNet';
import { usePathNet } from '@/hooks/usePathNet';
import PageTabs from '@/components/results/PageTabs';
import PageHeader from '@/components/results/PageHeader';
import EmptyState from '@/components/results/EmptyState';
import LockedOverlay from '@/components/results/LockedOverlay';
import LoadingBar from '@/components/results/LoadingBar';
import PathNetPage from '@/components/results/PathNetPage';
import DrugNetPage from '@/components/results/DrugNetPage';
import {
  canPredictWithManualOverride,
  manualOverrideBlockedMessage,
} from '@/utils/inferenceMode';

interface ResultsPanelProps {
  onReportSaved?: () => void;
}

export default function ResultsPanel({ onReportSaved }: ResultsPanelProps) {
  const { selectedVariant, manualOverride, manualVariant } = useVariant();
  const { activeTab } = useModel();
  const {
    result: pathnetResult,
    loading: loadingPathnet,
    error: errorPathnet,
    predict: runPathNetPrediction,
  } = usePathNet();
  const {
    result: drugnetResult,
    loading: loadingDrugnet,
    error: errorDrugnet,
    predict: predictDrugNet,
  } = useDrugNet();

  const runDrugNetPrediction = () => {
    const variant = manualOverride ? manualVariant : selectedVariant;
    if (!variant?.rsid) return Promise.resolve();
    return predictDrugNet(variant, { manualOverride });
  };

  const runPathNetFromVariant = () => {
    const variant = manualOverride ? manualVariant : selectedVariant;
    if (!variant?.rsid) return Promise.resolve();
    return runPathNetPrediction(variant, { manualOverride });
  };

  const currentVariant = manualOverride ? manualVariant : selectedVariant;
  const hasVariant = Boolean(currentVariant?.rsid);
  const isDrugNetEnabled = Boolean(currentVariant?.hasDrug);
  const canRunInference = canPredictWithManualOverride(manualOverride);

  const renderReadyState = (model: 'pathnet' | 'drugnet') => {
    const isPath = model === 'pathnet';
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center font-mono select-none">
        <p className="text-[var(--muted)] text-[10px] tracking-[0.07em] mb-4">
          {isPath ? 'Input vector loaded' : 'PGx overlap verified'}
        </p>
        {!canRunInference && (
          <p className="text-[var(--muted)] text-[9px] font-mono max-w-sm mb-4 leading-relaxed">
            {manualOverrideBlockedMessage()}
          </p>
        )}
        <button
          type="button"
          disabled={!canRunInference}
          onClick={isPath ? runPathNetFromVariant : () => runDrugNetPrediction()}
          className={`px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded border ${
            canRunInference ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          } ${
            isPath
              ? 'bg-[rgba(59,142,255,0.1)] border-[rgba(59,142,255,0.3)] text-[var(--accent)] hover:border-[var(--accent)]'
              : 'bg-[rgba(0,212,170,0.1)] border-[rgba(0,212,170,0.3)] text-[var(--accent2)] hover:border-[var(--accent2)]'
          }`}
        >
          Execute {isPath ? 'PathNet' : 'DrugNet'} inference
        </button>
      </div>
    );
  };

  const renderContent = () => {
    if (!hasVariant || !currentVariant) {
      return <EmptyState activeTab={activeTab} />;
    }

    if (activeTab === 'pathnet') {
      if (loadingPathnet) return <LoadingBar modelName="PathNet" variant="path" />;
      if (errorPathnet) {
        return (
          <p className="p-4 text-[var(--danger)] font-mono text-xs border border-[rgba(255,91,91,0.3)] rounded">
            ✖ {errorPathnet}
          </p>
        );
      }
      if (pathnetResult) {
        return (
          <PathNetPage result={pathnetResult} variant={currentVariant} onReportSaved={onReportSaved} />
        );
      }
      return renderReadyState('pathnet');
    }

    if (!isDrugNetEnabled) {
      return <LockedOverlay rsid={currentVariant.rsid} />;
    }
    if (loadingDrugnet) return <LoadingBar modelName="DrugNet" variant="drug" />;
    if (errorDrugnet) {
      return (
        <p className="p-4 text-[var(--danger)] font-mono text-xs border border-[rgba(255,91,91,0.3)] rounded">
          ✖ {errorDrugnet}
        </p>
      );
    }
    if (drugnetResult) {
      return (
        <DrugNetPage
          result={drugnetResult}
          variant={currentVariant}
          pathnetResult={pathnetResult}
          onReportSaved={onReportSaved}
        />
      );
    }
    return renderReadyState('drugnet');
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg)] min-h-0 overflow-hidden">
      <PageTabs />
      {hasVariant && <PageHeader activeTab={activeTab} />}
      <div className="page-lbar h-0.5 bg-[var(--surface)] relative overflow-hidden shrink-0">
        {(loadingPathnet && activeTab === 'pathnet') || (loadingDrugnet && activeTab === 'drugnet') ? (
          <div
            className={`absolute inset-y-0 w-[60%] animate-[slide_1.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent ${
              activeTab === 'pathnet' ? 'via-[var(--accent)]' : 'via-[var(--accent2)]'
            } to-transparent`}
          />
        ) : null}
      </div>
      <div className="flex-1 overflow-y-auto px-[22px] py-5 min-h-0">{renderContent()}</div>
    </div>
  );
}
