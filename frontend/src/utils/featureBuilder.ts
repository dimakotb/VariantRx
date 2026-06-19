import type { Variant } from '@/types';
import type {
  DrugNetFeatureVector,
  PathNetFeatureVector,
  PgxFeatureFlags,
  VariantFeatureVector,
} from '@/types/ml.types';
import {
  DRUGNET_EXTRA_FEATURE_NAMES,
  VARIANT_BASE_FEATURE_NAMES,
} from '@/types/ml.types';

const TRANSITION_ALLELES = new Set(['AG', 'GA', 'CT', 'TC']);

function isTransition(ref: string, alt: string): 0 | 1 {
  return TRANSITION_ALLELES.has(`${ref}${alt}`) ? 1 : 0;
}

function logSubmitters(submitterCount: number): number {
  return Math.log1p(submitterCount ?? 1);
}

/**
 * Core preprocessing shared by PathNet and DrugNet.
 * Keep in sync with Kaggle notebook / FastAPI feature pipeline.
 */
export function buildVariantFeatureVector(variant: Variant): VariantFeatureVector {
  const logSub = logSubmitters(variant.sub ?? 1);
  const evidenceOrder = variant.rev ?? 0;
  const transition = isTransition(variant.ref, variant.alt);
  const highConf: 0 | 1 = variant.hc ? 1 : 0;

  return {
    rsid: variant.rsid,
    gene: variant.gene,
    chrom: variant.chrom,
    ref: variant.ref,
    alt: variant.alt,
    featureNames: VARIANT_BASE_FEATURE_NAMES,
    values: [logSub, evidenceOrder, transition, highConf] as const,
  };
}

export function buildPathNetFeatureVector(variant: Variant): PathNetFeatureVector {
  const base = buildVariantFeatureVector(variant);
  const [logSub, evidenceOrder, transition, highConf] = base.values;

  return {
    ...base,
    pathLabel: variant.path ?? 'Uncertain',
    logSubmitters: logSub,
    evidenceOrder,
    isTransition: transition as 0 | 1,
    highConf: highConf as 0 | 1,
  };
}

export interface DrugNetFeatureOptions {
  useCpic?: boolean;
  usePgkb?: boolean;
}

export function buildDrugNetFeatureVector(
  variant: Variant,
  options: DrugNetFeatureOptions = {},
): DrugNetFeatureVector {
  const pathnet = buildPathNetFeatureVector(variant);
  const pgx: PgxFeatureFlags = {
    useCpic: options.useCpic ?? variant.cpic,
    usePgkb: options.usePgkb ?? variant.pgkb,
    hasDrugOverlap: variant.hasDrug,
  };
  const cpicFlag: 0 | 1 = pgx.useCpic ? 1 : 0;
  const pgkbFlag: 0 | 1 = pgx.usePgkb ? 1 : 0;
  const hasDrugOverlap: 0 | 1 = pgx.hasDrugOverlap ? 1 : 0;

  return {
    ...pathnet,
    pgx,
    featureNames: [...VARIANT_BASE_FEATURE_NAMES, ...DRUGNET_EXTRA_FEATURE_NAMES],
    values: [...pathnet.values, cpicFlag, pgkbFlag, hasDrugOverlap] as const,
    cpicFlag,
    pgkbFlag,
    hasDrugOverlap,
  };
}

/** Flat vector for model inference (PathNet MLP input) */
export function toPathNetFlatVector(features: PathNetFeatureVector): number[] {
  return [...features.values];
}

/** Flat vector for DrugNet XGBoost (base + PGx) */
export function toDrugNetFlatVector(features: DrugNetFeatureVector): number[] {
  return [...features.values];
}

export function toMlInferenceRequest<T extends PathNetFeatureVector | DrugNetFeatureVector>(
  model: 'pathnet' | 'drugnet',
  features: T,
): { model: typeof model; features: T; vector: number[] } {
  const vector =
    model === 'pathnet'
      ? toPathNetFlatVector(features as PathNetFeatureVector)
      : toDrugNetFlatVector(features as DrugNetFeatureVector);

  return { model, features, vector };
}
