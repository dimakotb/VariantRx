import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { pathNetService } from '@/services/ml/pathnet.service';
import type { Variant } from '@/types';
import type { PathNetOutput } from '@/types/ml.types';
import { buildPathNetFeatureVector } from '@/utils/featureBuilder';
import {
  canPredictWithManualOverride,
  manualOverrideBlockedMessage,
  shouldUseCatalogPredict,
} from '@/utils/inferenceMode';

export interface PathNetPredictOptions {
  manualOverride?: boolean;
}

export interface PathNetInferenceState {
  result: PathNetOutput | null;
  loading: boolean;
  error: string | null;
  predict: (variant: Variant, options?: PathNetPredictOptions) => Promise<void>;
  reset: () => void;
}

export const PathNetInferenceContext = createContext<PathNetInferenceState | null>(null);

/** Internal controller — mounted once in ModelProvider */
export function usePathNetController(): PathNetInferenceState {
  const [result, setResult] = useState<PathNetOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const predict = useCallback(async (variant: Variant, options: PathNetPredictOptions = {}) => {
    if (!variant.rsid) return;

    const manual = options.manualOverride ?? false;

    if (!canPredictWithManualOverride(manual)) {
      setError(manualOverrideBlockedMessage());
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = shouldUseCatalogPredict(manual)
        ? await pathNetService.predictByRsid(variant.rsid)
        : await pathNetService.predict(buildPathNetFeatureVector(variant));

      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PathNet inference failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({ result, loading, error, predict, reset }),
    [result, loading, error, predict, reset],
  );
}

export function PathNetInferenceProvider({
  value,
  children,
}: {
  value: PathNetInferenceState;
  children: ReactNode;
}) {
  return (
    <PathNetInferenceContext.Provider value={value}>{children}</PathNetInferenceContext.Provider>
  );
}

/** UI entry point for PathNet — do not call services from components */
export function usePathNet(): PathNetInferenceState {
  const ctx = useContext(PathNetInferenceContext);
  if (!ctx) {
    throw new Error('usePathNet must be used within ModelProvider');
  }
  return ctx;
}
