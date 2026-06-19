export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export type PredictionLabel = 'PATHOGENIC' | 'BENIGN' | 'UNCERTAIN' | string;

export type PathogenicityLabel = 'Pathogenic' | 'Benign' | 'Uncertain';

export interface ModelFeature {
  key: string;
  value: string | number;
  model?: 'pathnet' | 'drugnet';
}

/** Ordered feature names — must stay aligned with Kaggle / backend preprocessing */
export const VARIANT_BASE_FEATURE_NAMES = [
  'LOG_SUBMITTERS',
  'EVIDENCE_ORD',
  'IS_TRANSITION',
  'HIGH_CONF',
] as const;

export const DRUGNET_EXTRA_FEATURE_NAMES = ['CPIC_FLAG', 'PGKB_FLAG', 'HAS_DRUG_OVERLAP'] as const;

export type VariantBaseFeatureName = (typeof VARIANT_BASE_FEATURE_NAMES)[number];
export type DrugNetExtraFeatureName = (typeof DRUGNET_EXTRA_FEATURE_NAMES)[number];

/**
 * Shared numeric input for both models (Residual MLP + XGBoost base).
 * `values` is the flat vector sent to inference after preprocessing.
 */
export interface VariantFeatureVector {
  rsid: string;
  gene: string;
  chrom: string;
  ref: string;
  alt: string;
  featureNames: readonly VariantBaseFeatureName[];
  values: readonly [number, number, number, number];
}

/** PathNet (Residual MLP): base vector + ClinVar pathogenicity context */
export interface PathNetFeatureVector extends VariantFeatureVector {
  pathLabel: PathogenicityLabel | string;
  logSubmitters: number;
  evidenceOrder: number;
  isTransition: 0 | 1;
  highConf: 0 | 1;
}

export interface PgxFeatureFlags {
  useCpic: boolean;
  usePgkb: boolean;
  hasDrugOverlap: boolean;
}

/** DrugNet (XGBoost): PathNet base + PGx flags */
export interface DrugNetFeatureVector extends Omit<PathNetFeatureVector, 'featureNames' | 'values'> {
  pgx: PgxFeatureFlags;
  featureNames: readonly (VariantBaseFeatureName | DrugNetExtraFeatureName)[];
  values: readonly [number, number, number, number, number, number, number];
  cpicFlag: 0 | 1;
  pgkbFlag: 0 | 1;
  hasDrugOverlap: 0 | 1;
}

/** Service / API input aliases */
export type PathNetInput = PathNetFeatureVector;
export type DrugNetInput = DrugNetFeatureVector;

/** Traceability fields returned with catalog-based inference */
export interface InferenceMeta {
  preprocessVersion?: string;
  modelVersion?: string;
  inCatalog?: boolean;
}

export interface PathNetOutput extends InferenceMeta {
  rsid: string;
  gene: string;
  score: number;
  label: PredictionLabel;
  confidence: ConfidenceLevel;
  features: ModelFeature[];
  resultId?: string;
}

export interface DrugNetOutput extends InferenceMeta {
  rsid: string;
  gene?: string;
  score: number;
  label: string;
  confidence: ConfidenceLevel;
  features: ModelFeature[];
  /** Populated from variant PGx data at inference time when mock API returns none */
  drugs?: Array<{ n: string; t: string; c: string }>;
  /** CatBoost multi-class probabilities (kaggle-v1 DrugNet) */
  classProbs?: Record<string, number>;
  resultId?: string;
}

export interface PredictByRsidBody {
  rsid: string;
}

export interface PredictDrugNetByRsidBody extends PredictByRsidBody {
  useCpic?: boolean;
  usePgkb?: boolean;
}

export interface MlInferenceRequest<TFeatures> {
  model: 'pathnet' | 'drugnet';
  features: TFeatures;
  /** Flat numeric vector for notebook-exported models */
  vector: number[];
}

export interface MlApiErrorBody {
  success: false;
  message: string;
}

export const ML_API_PATHS = {
  pathnet: '/predict/pathnet',
  drugnet: '/predict/drugnet',
} as const;
