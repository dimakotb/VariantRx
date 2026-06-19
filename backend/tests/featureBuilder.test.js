const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  buildPathNetVector,
  buildDrugNetVector,
  enrichCatalogFields,
} = require('../utils/featureBuilder');
const { escapeRegex } = require('../utils/escapeRegex');

describe('featureBuilder', () => {
  const sample = {
    rsid: 'rs1799853',
    gene: 'CYP2C9',
    ref: 'C',
    alt: 'T',
    sub: 24,
    rev: 3,
    hc: true,
    cpic: true,
    pgkb: true,
    hasDrug: true,
  };

  it('builds PathNet vector with correct length and transition flag', () => {
    const vector = buildPathNetVector(sample);
    assert.equal(vector.length, 4);
    assert.equal(vector[2], 1); // CT is a transition
    assert.equal(vector[3], 1); // highConf
    assert.ok(Math.abs(vector[0] - Math.log1p(24)) < 1e-9);
    assert.equal(vector[1], 3);
  });

  it('builds DrugNet vector with PGx flags appended', () => {
    const vector = buildDrugNetVector(sample);
    assert.equal(vector.length, 7);
    assert.deepEqual(vector.slice(4), [1, 1, 1]);
  });

  it('enrichCatalogFields sets eligibility and vectors', () => {
    const doc = enrichCatalogFields({ ...sample, path: 'Pathogenic' });
    assert.equal(doc.pathnetEligible, true);
    assert.equal(doc.drugnetEligible, true);
    assert.equal(doc.pathnetVector.length, 4);
    assert.equal(doc.drugnetVector.length, 7);
    assert.equal(doc.preprocessVersion, 'kaggle-v0');
  });

  it('kaggle-v1 catalog skips legacy 4/7 vectors', () => {
    const doc = enrichCatalogFields({
      ...sample,
      path: 'Pathogenic',
      reviewStatus: 'practice guideline',
      preprocessVersion: 'kaggle-v1',
    });
    assert.equal(doc.pathnetVector, null);
    assert.equal(doc.drugnetVector, null);
    assert.equal(doc.preprocessVersion, 'kaggle-v1');
  });
});

describe('escapeRegex', () => {
  it('escapes special regex characters', () => {
    assert.equal(escapeRegex('rs1799853'), 'rs1799853');
    assert.equal(escapeRegex('CYP2C9*'), 'CYP2C9\\*');
    assert.equal(escapeRegex('a+b'), 'a\\+b');
  });
});
