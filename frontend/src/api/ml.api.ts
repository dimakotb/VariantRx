import { env } from '@/config/env';
import { mlPost } from '@/services/ml/mlClient';
import type { DrugAssociation, ModelFeature } from '@/types';
import type {
  DrugNetInput,
  DrugNetOutput,
  MlInferenceRequest,
  PathNetInput,
  PathNetOutput,
  PredictByRsidBody,
  PredictDrugNetByRsidBody,
} from '@/types/ml.types';
import { ML_API_PATHS } from '@/types/ml.types';
import { toMlInferenceRequest } from '@/utils/featureBuilder';

const INFERENCE_DELAY_MS = 900;

function delay<T>(data: T, ms = INFERENCE_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function mockPathNet(features: PathNetInput): PathNetOutput {
  const pathLabel = features.pathLabel || 'Uncertain';
  let score: number;
  if (pathLabel === 'Pathogenic') score = 0.75 + Math.random() * 0.2;
  else if (pathLabel === 'Benign') score = 0.05 + Math.random() * 0.25;
  else score = 0.38 + Math.random() * 0.24;

  const label =
    score > 0.7 ? 'PATHOGENIC' : score > 0.45 ? 'UNCERTAIN' : 'BENIGN';
  const confidence =
    score > 0.82 || score < 0.22
      ? 'HIGH'
      : score > 0.65 || score < 0.38
        ? 'MODERATE'
        : 'LOW';

  const modelFeatures: ModelFeature[] = [
    { key: 'LOG_SUBMITTERS', value: features.logSubmitters.toFixed(2) },
    { key: 'EVIDENCE_ORD', value: features.evidenceOrder },
    { key: 'IS_TRANSITION', value: features.isTransition },
    { key: 'HIGH_CONF', value: features.highConf },
    { key: 'PATH_SCORE', value: score.toFixed(3) },
  ];

  return {
    rsid: features.rsid,
    gene: features.gene,
    score: parseFloat(score.toFixed(3)),
    label,
    confidence,
    features: modelFeatures,
    preprocessVersion: 'kaggle-v0',
    modelVersion: 'mock-v0',
    inCatalog: false,
  };
}

function mockDrugNet(features: DrugNetInput): DrugNetOutput {
  const score = 0.55 + Math.random() * 0.35;
  const modelFeatures: ModelFeature[] = [
    { key: 'CPIC_FLAG', value: features.cpicFlag, model: 'drugnet' },
    { key: 'PGKB_FLAG', value: features.pgkbFlag, model: 'drugnet' },
    { key: 'HAS_DRUG_OVERLAP', value: features.hasDrugOverlap, model: 'drugnet' },
    { key: 'PGX_SCORE', value: score.toFixed(3), model: 'drugnet' },
  ];

  return {
    rsid: features.rsid,
    gene: features.gene,
    score: parseFloat(score.toFixed(3)),
    label:
      score > 0.75
        ? 'HIGH PGx IMPACT'
        : score > 0.55
          ? 'MODERATE PGx IMPACT'
          : 'LOW PGx IMPACT',
    confidence: score > 0.7 ? 'HIGH' : 'MODERATE',
    drugs: [],
    features: modelFeatures,
    preprocessVersion: 'kaggle-v0',
    modelVersion: 'mock-v0',
    inCatalog: false,
  };
}

const MOCK_META = {
  preprocessVersion: 'kaggle-v0',
  modelVersion: 'mock-v0',
  inCatalog: true,
} as const;

/**
 * Catalog-based PathNet — backend loads precomputed vector by rsid.
 */
export async function runPathNetByRsid(rsid: string): Promise<PathNetOutput> {
  try {
    const data = await mlPost<PathNetOutput, PredictByRsidBody>(ML_API_PATHS.pathnet, { rsid });
    return delay(data);
  } catch (err) {
    throw err instanceof Error ? err : new Error('PathNet catalog inference failed');
  }
}

/**
 * Catalog-based DrugNet.
 */
export async function runDrugNetByRsid(
  rsid: string,
  options: Pick<PredictDrugNetByRsidBody, 'useCpic' | 'usePgkb'> = {},
): Promise<DrugNetOutput> {
  const body: PredictDrugNetByRsidBody = {
    rsid,
    useCpic: options.useCpic,
    usePgkb: options.usePgkb,
  };
  try {
    const data = await mlPost<DrugNetOutput, PredictDrugNetByRsidBody>(
      ML_API_PATHS.drugnet,
      body,
    );
    return delay(data);
  } catch (err) {
    throw err instanceof Error ? err : new Error('DrugNet catalog inference failed');
  }
}

/**
 * PathNet inference API (feature payload — mock / manual override).
 */
export async function runPathNet(features: PathNetInput): Promise<PathNetOutput> {
  const request: MlInferenceRequest<PathNetInput> = toMlInferenceRequest('pathnet', features);

  if (env.useMockApi) {
    const out = await delay(mockPathNet(request.features));
    return { ...out, ...MOCK_META, inCatalog: false };
  }

  try {
    const data = await mlPost<PathNetOutput, MlInferenceRequest<PathNetInput>>(
      ML_API_PATHS.pathnet,
      request,
    );
    return delay(data);
  } catch {
    const out = await delay(mockPathNet(request.features));
    return { ...out, ...MOCK_META, inCatalog: false };
  }
}

/**
 * DrugNet inference API (feature payload — mock / manual override).
 */
export async function runDrugNet(features: DrugNetInput): Promise<DrugNetOutput> {
  const request: MlInferenceRequest<DrugNetInput> = toMlInferenceRequest('drugnet', features);

  if (env.useMockApi) {
    const out = await delay(mockDrugNet(request.features));
    return { ...out, ...MOCK_META, inCatalog: false };
  }

  try {
    const data = await mlPost<DrugNetOutput, MlInferenceRequest<DrugNetInput>>(
      ML_API_PATHS.drugnet,
      request,
    );
    return delay(data);
  } catch {
    const out = await delay(mockDrugNet(request.features));
    return { ...out, ...MOCK_META, inCatalog: false };
  }
}
