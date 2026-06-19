const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeCatalogRow } = require('../utils/catalogNormalizer');
const { variantToMlPayload } = require('../utils/variantToMlPayload');

describe('catalogNormalizer', () => {
  it('normalizes notebook-style row to catalog document', () => {
    const doc = normalizeCatalogRow({
      RSID_num: 1799853,
      GeneSymbol: 'CYP2C9',
      Chromosome: 10,
      ReferenceAllele: 'C',
      AlternateAllele: 'T',
      PathBinary: 'Benign',
      NumberSubmitters: 42,
      EvidenceOrdinal: 3,
      IsHighConfidence: true,
      HasTrustedDrugLabel: true,
      IsCPIC_Gene: true,
      ReviewStatus: 'criteria provided, multiple submitters, no conflicts',
      Origin: 'germline',
      OriginSimple: 'germline',
      Assembly: 'GRCh38',
      SubmitterCategories: 2,
      TestedInGTR: 'Y',
      DrugName: 'Warfarin',
      DrugResponse: 'PK/Dosage',
      preprocessVersion: 'kaggle-v1',
    });

    assert.equal(doc.rsid, 'rs1799853');
    assert.equal(doc.gene, 'CYP2C9');
    assert.equal(doc.chrom, '10');
    assert.equal(doc.path, 'Benign');
    assert.equal(doc.sub, 42);
    assert.equal(doc.rev, 3);
    assert.equal(doc.hc, true);
    assert.equal(doc.hasDrug, true);
    assert.equal(doc.reviewStatus, 'criteria provided, multiple submitters, no conflicts');
    assert.equal(doc.testedInGtr, true);
    assert.equal(doc.drugs[0].n, 'Warfarin');
    assert.equal(doc.preprocessVersion, 'kaggle-v1');
  });
});

describe('variantToMlPayload', () => {
  it('maps Mongo variant to notebook predict_variant keys', () => {
    const payload = variantToMlPayload({
      rsid: 'rs1799853',
      gene: 'CYP2C9',
      chrom: '10',
      ref: 'C',
      alt: 'T',
      sub: 42,
      reviewStatus: 'no assertion provided',
      origin: 'germline',
      originSimple: 'germline',
      assembly: 'GRCh38',
      type: 'snv',
      testedInGtr: true,
      submitterCategories: 2,
      sigBonus: 0.5,
      numDistinctDrugs: 3,
      pgxFeatures: { AnnCount_Metabolism_PK: 2 },
      preprocessVersion: 'kaggle-v1',
      hasDrug: true,
    });

    assert.equal(payload.GeneSymbol, 'CYP2C9');
    assert.equal(payload.TestedInGTR, 1);
    assert.equal(payload.SigBonus, 0.5);
    assert.equal(payload.AnnCount_Metabolism_PK, 2);
  });
});
