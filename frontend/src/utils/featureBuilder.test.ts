import { describe, expect, it } from 'vitest';
import {
  buildDrugNetFeatureVector,
  buildPathNetFeatureVector,
  toPathNetFlatVector,
} from '@/utils/featureBuilder';
import type { Variant } from '@/types';

const sample: Variant = {
  rsid: 'rs1799853',
  gene: 'CYP2C9',
  chrom: '10',
  ref: 'C',
  alt: 'T',
  type: 'snv',
  path: 'Pathogenic',
  drugResp: null,
  drugs: [],
  diseases: [],
  cpic: true,
  pgkb: true,
  hc: true,
  sub: 24,
  rev: 3,
  cat: '',
  tag: '',
  src: [],
  desc: '',
  hasDrug: true,
};

describe('featureBuilder', () => {
  it('builds PathNet vector with 4 features in order', () => {
    const features = buildPathNetFeatureVector(sample);
    const vector = toPathNetFlatVector(features);
    expect(vector).toHaveLength(4);
    expect(vector[2]).toBe(1); // CT is a transition
    expect(vector[3]).toBe(1);
    expect(vector[0]).toBeCloseTo(Math.log1p(24));
    expect(vector[1]).toBe(3);
  });

  it('builds DrugNet vector with PGx flags', () => {
    const features = buildDrugNetFeatureVector(sample);
    expect(features.values).toHaveLength(7);
    expect(features.values.slice(4)).toEqual([1, 1, 1]);
  });
});
