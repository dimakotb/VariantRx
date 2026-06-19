/**
 * Map a MongoDB Variant → notebook / ml-service input dict.
 * Field names match Kaggle predict_variant() variant_dict keys.
 */

function variantToMlPayload(variant) {
  const v = variant.toObject ? variant.toObject() : variant;
  const pgx = v.pgxFeatures && typeof v.pgxFeatures === 'object' ? v.pgxFeatures : {};

  const payload = {
    rsid: v.rsid,
    GeneSymbol: v.gene,
    Chromosome: v.chrom,
    ReferenceAllele: v.ref,
    AlternateAllele: v.alt,
    NumberSubmitters: v.sub ?? 1,
    ReviewStatus: v.reviewStatus || 'no assertion provided',
    Origin: v.origin || 'germline',
    OriginSimple: v.originSimple || 'germline',
    Assembly: v.assembly || 'GRCh38',
    Type: v.type || 'snv',
    TestedInGTR: v.testedInGtr ? 1 : 0,
    SubmitterCategories: v.submitterCategories ?? 0,
    SigBonus: v.sigBonus ?? 0,
    NumDistinctDrugs: v.numDistinctDrugs ?? 0,
    SigFlag: v.sigFlag ?? 0,
    LogPMIDCount: v.logPmidCount ?? 0,
    HasStarAllele: v.hasStarAllele ?? 0,
    CPICLevel: v.cpicLevel ?? 0,
    GeneFunctionOrdinal: v.geneFunctionOrdinal ?? 0,
    EvidenceXGeneFunc: v.evidenceXGeneFunc ?? 0,
    preprocessVersion: v.preprocessVersion,
    hasDrug: Boolean(v.hasDrug),
  };

  for (const [key, value] of Object.entries(pgx)) {
    payload[key] = value;
  }

  return payload;
}

module.exports = { variantToMlPayload };
