import { runDrugNet, runDrugNetByRsid } from '@/api/ml.api';
import type { DrugNetInput, DrugNetOutput } from '@/types/ml.types';

/**
 * DrugNet service — XGBoost PGx drug-response model (same notebook as PathNet).
 */
export const drugNetService = {
  async predictByRsid(
    rsid: string,
    options?: { useCpic?: boolean; usePgkb?: boolean },
  ): Promise<DrugNetOutput> {
    return runDrugNetByRsid(rsid, options);
  },
  async predict(features: DrugNetInput): Promise<DrugNetOutput> {
    return runDrugNet(features);
  },
};

export type { DrugNetInput, DrugNetOutput };
