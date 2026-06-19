import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { drugNetService } from '@/services/ml/drugnet.service';
import type { DrugNetResult, Variant } from '@/types';
import { buildDrugNetFeatureVector, type DrugNetFeatureOptions } from '@/utils/featureBuilder';
import {
  canPredictWithManualOverride,
  manualOverrideBlockedMessage,
  shouldUseCatalogPredict,
} from '@/utils/inferenceMode';

export interface DrugNetPredictOptions extends DrugNetFeatureOptions {
  manualOverride?: boolean;
}

export interface DrugNetInferenceState {
  result: DrugNetResult | null;
  loading: boolean;
  error: string | null;
  predict: (variant: Variant, options?: DrugNetPredictOptions) => Promise<void>;
  reset: () => void;
}

export const DrugNetInferenceContext = createContext<DrugNetInferenceState | null>(null);

export function useDrugNetController(): DrugNetInferenceState {
  const [result, setResult] = useState<DrugNetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const predict = useCallback(async (variant: Variant, options: DrugNetPredictOptions = {}) => {
    if (!variant.rsid) return;

    const manual = options.manualOverride ?? false;

    if (!canPredictWithManualOverride(manual)) {
      setError(manualOverrideBlockedMessage());
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const { useCpic, usePgkb } = options;

    try {
      const output = shouldUseCatalogPredict(manual)
        ? await drugNetService.predictByRsid(variant.rsid, { useCpic, usePgkb })
        : await drugNetService.predict(buildDrugNetFeatureVector(variant, { useCpic, usePgkb }));

      setResult({
        ...output,
        drugs: output.drugs?.length
          ? (output.drugs as DrugNetResult['drugs'])
          : (variant.drugs ?? []),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DrugNet inference failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({ result, loading, error, predict, reset }),
    [result, loading, error, predict, reset],
  );
}

export function DrugNetInferenceProvider({
  value,
  children,
}: {
  value: DrugNetInferenceState;
  children: ReactNode;
}) {
  return (
    <DrugNetInferenceContext.Provider value={value}>{children}</DrugNetInferenceContext.Provider>
  );
}

export function useDrugNet(): DrugNetInferenceState {
  const ctx = useContext(DrugNetInferenceContext);
  if (!ctx) {
    throw new Error('useDrugNet must be used within ModelProvider');
  }
  return ctx;
}
