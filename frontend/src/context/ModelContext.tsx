import {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useVariant } from '@/context/VariantContext';
import {
  DrugNetInferenceProvider,
  useDrugNetController,
  type DrugNetInferenceState,
} from '@/hooks/useDrugNet';
import {
  PathNetInferenceProvider,
  usePathNetController,
  type PathNetInferenceState,
} from '@/hooks/usePathNet';
import type { DrugNetFeatureOptions } from '@/utils/featureBuilder';
import type { DrugNetResult, ModelTab, PathNetResult, Variant } from '@/types';

interface DrugNetRunOptions extends DrugNetFeatureOptions {}

interface ModelContextValue {
  activeTab: ModelTab;
  setActiveTab: (tab: ModelTab) => void;
  pathnetResult: PathNetResult | null;
  drugnetResult: DrugNetResult | null;
  loadingPathnet: boolean;
  loadingDrugnet: boolean;
  errorPathnet: string | null;
  errorDrugnet: string | null;
  runPathNetPrediction: () => Promise<void>;
  runDrugNetPrediction: (options?: DrugNetRunOptions) => Promise<void>;
  resetPredictions: () => void;
}

const ModelContext = createContext<ModelContextValue | null>(null);

export function useModel(): ModelContextValue {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error('useModel must be used within ModelProvider');
  return ctx;
}

function resolveActiveVariant(
  manualOverride: boolean,
  manualVariant: Variant,
  selectedVariant: Variant | null,
): Variant | null {
  const variant = manualOverride ? manualVariant : selectedVariant;
  return variant?.rsid ? variant : null;
}

function ModelContextBridge({
  pathNet,
  drugNet,
  children,
}: {
  pathNet: PathNetInferenceState;
  drugNet: DrugNetInferenceState;
  children: ReactNode;
}) {
  const { selectedVariant, manualOverride, manualVariant, setSearchModelFilter } = useVariant();
  const [activeTab, setActiveTab] = useState<ModelTab>('pathnet');

  useEffect(() => {
    setSearchModelFilter(activeTab === 'drugnet' ? 'drugnet' : undefined);
  }, [activeTab, setSearchModelFilter]);

  const getVariant = useCallback(
    () => resolveActiveVariant(manualOverride, manualVariant, selectedVariant),
    [manualOverride, manualVariant, selectedVariant],
  );

  const resetPredictions = useCallback(() => {
    pathNet.reset();
    drugNet.reset();
  }, [pathNet, drugNet]);

  const runPathNetPrediction = useCallback(async () => {
    const variant = getVariant();
    if (!variant) return;
    await pathNet.predict(variant, { manualOverride });
  }, [getVariant, pathNet, manualOverride]);

  const runDrugNetPrediction = useCallback(
    async (options: DrugNetRunOptions = {}) => {
      const variant = getVariant();
      if (!variant) return;
      await drugNet.predict(variant, { ...options, manualOverride });
    },
    [getVariant, drugNet, manualOverride],
  );

  const value = useMemo<ModelContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      pathnetResult: pathNet.result,
      drugnetResult: drugNet.result,
      loadingPathnet: pathNet.loading,
      loadingDrugnet: drugNet.loading,
      errorPathnet: pathNet.error,
      errorDrugnet: drugNet.error,
      runPathNetPrediction,
      runDrugNetPrediction,
      resetPredictions,
    }),
    [
      activeTab,
      pathNet.result,
      pathNet.loading,
      pathNet.error,
      drugNet.result,
      drugNet.loading,
      drugNet.error,
      runPathNetPrediction,
      runDrugNetPrediction,
      resetPredictions,
    ],
  );

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}

export function ModelProvider({ children }: { children: ReactNode }) {
  const pathNet = usePathNetController();
  const drugNet = useDrugNetController();

  return (
    <PathNetInferenceProvider value={pathNet}>
      <DrugNetInferenceProvider value={drugNet}>
        <ModelContextBridge pathNet={pathNet} drugNet={drugNet}>
          {children}
        </ModelContextBridge>
      </DrugNetInferenceProvider>
    </PathNetInferenceProvider>
  );
}
