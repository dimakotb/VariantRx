import { runPathNet, runPathNetByRsid } from '@/api/ml.api';
import type { PathNetInput, PathNetOutput } from '@/types/ml.types';

/**
 * PathNet service — Residual MLP pathogenicity model (Kaggle notebook).
 * UI and hooks depend on this wrapper, not on API transport details.
 */
export const pathNetService = {
  async predictByRsid(rsid: string): Promise<PathNetOutput> {
    return runPathNetByRsid(rsid);
  },
  async predict(features: PathNetInput): Promise<PathNetOutput> {
    return runPathNet(features);
  },
};

export type { PathNetInput, PathNetOutput };
