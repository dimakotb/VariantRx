/** Shared API envelope */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Variant record (ClinVar + optional PGx overlap) */
export type VariantType = 'snv' | 'del' | 'ins' | 'dup' | 'indel';
export type PathogenicityLabel = 'Pathogenic' | 'Benign' | 'Uncertain';
export type DrugTypeClass = 'dt-pk' | 'dt-tox' | 'dt-ef';

export interface DrugAssociation {
  n: string;
  t: string;
  c: DrugTypeClass;
}

export interface Variant {
  rsid: string;
  gene: string;
  chrom: string;
  ref: string;
  alt: string;
  type: VariantType | string;
  path: PathogenicityLabel | string;
  drugResp: string | null;
  drugs: DrugAssociation[];
  diseases: string[];
  cpic: boolean;
  pgkb: boolean;
  hc: boolean;
  sub: number;
  rev: number;
  cat: string;
  tag: string;
  src: string[];
  desc: string;
  hasDrug: boolean;
  assembly?: string;
  /** Inference catalog (backend / notebook export) */
  pathnetEligible?: boolean;
  drugnetEligible?: boolean;
  pathnetVector?: number[];
  drugnetVector?: number[];
  preprocessVersion?: string;
  /** Kaggle notebook fields used by ml-service (kaggle-v1) */
  reviewStatus?: string;
  origin?: string;
  originSimple?: string;
  assembly?: string;
  submitterCategories?: number;
  testedInGtr?: boolean;
}

export interface VariantSearchGroup {
  label: string;
  note: string;
  filter: (v: Variant) => boolean;
}

import type {
  ConfidenceLevel,
  DrugNetFeatureVector,
  DrugNetInput,
  DrugNetOutput,
  ModelFeature,
  PathNetFeatureVector,
  PathNetInput,
  PathNetOutput,
  PredictionLabel,
  VariantFeatureVector,
} from '@/types/ml.types';

export type {
  ConfidenceLevel,
  DrugNetFeatureVector,
  DrugNetInput,
  DrugNetOutput,
  ModelFeature,
  PathNetFeatureVector,
  PathNetInput,
  PathNetOutput,
  PredictionLabel,
  VariantFeatureVector,
};

/** UI-facing aliases for ML inference responses */
export type PathNetResult = import('@/types/ml.types').PathNetOutput;

export type DrugNetResult = Omit<import('@/types/ml.types').DrugNetOutput, 'drugs'> & {
  drugs: DrugAssociation[];
};

/**
 * @deprecated Use PathNetFeatureVector via buildPathNetFeatureVector()
 */
export interface PathNetPayload {
  rsid: string;
  gene: string;
  ref: string;
  alt: string;
  chrom: string;
  numSubmitters: number;
  reviewOrder: number;
  highConf: boolean;
  pathLabel: string;
}

/**
 * @deprecated Use DrugNetFeatureVector via buildDrugNetFeatureVector()
 */
export interface DrugNetPayload {
  rsid: string;
  useCpic: boolean;
  usePgkb: boolean;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  token?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  username: string;
}

export interface PathNetReportSnapshot {
  score: number;
  label: string;
  confidence: string;
  features: ModelFeature[];
}

export interface DrugNetReportSnapshot {
  score: number;
  label: string;
  confidence?: string;
  drugs: DrugAssociation[];
  features?: ModelFeature[];
}

export interface GenomicReport {
  _id: string;
  patientName: string;
  patientId?: string;
  rsid: string;
  gene: string;
  variantType?: string;
  chromosome: string;
  alleleChange: string;
  pathnetResult?: PathNetReportSnapshot | null;
  drugnetResult?: DrugNetReportSnapshot | null;
  reviewerNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReportPayload {
  patientName: string;
  patientId?: string;
  rsid: string;
  gene: string;
  variantType?: string;
  chromosome: string;
  alleleChange: string;
  pathnetResult?: PathNetReportSnapshot;
  drugnetResult?: DrugNetReportSnapshot;
  reviewerNotes?: string;
}

export type ModelTab = 'pathnet' | 'drugnet';
export type ModelRunStatus = 'idle' | 'running' | 'done' | 'error' | 'na';
