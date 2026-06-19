/**
 * Server-side feature vectors — keep aligned with frontend/src/utils/featureBuilder.ts
 * and frontend/src/types/ml.types.ts (VARIANT_BASE_FEATURE_NAMES order).
 */

const TRANSITION_ALLELES = new Set(['AG', 'GA', 'CT', 'TC']);

const VARIANT_BASE_FEATURE_NAMES = [
  'LOG_SUBMITTERS',
  'EVIDENCE_ORD',
  'IS_TRANSITION',
  'HIGH_CONF',
];

const DRUGNET_EXTRA_FEATURE_NAMES = ['CPIC_FLAG', 'PGKB_FLAG', 'HAS_DRUG_OVERLAP'];

function logSubmitters(submitterCount) {
  return Math.log1p(submitterCount ?? 1);
}

function isTransition(ref, alt) {
  return TRANSITION_ALLELES.has(`${ref}${alt}`) ? 1 : 0;
}

function buildPathNetVector(variant) {
  const logSub = logSubmitters(variant.sub);
  const evidenceOrder = variant.rev ?? 0;
  const transition = isTransition(variant.ref, variant.alt);
  const highConf = variant.hc ? 1 : 0;
  return [logSub, evidenceOrder, transition, highConf];
}

function buildDrugNetVector(variant, options = {}) {
  const base = buildPathNetVector(variant);
  const useCpic = options.useCpic ?? variant.cpic ?? false;
  const usePgkb = options.usePgkb ?? variant.pgkb ?? false;
  const hasDrugOverlap = Boolean(variant.hasDrug);
  return [...base, useCpic ? 1 : 0, usePgkb ? 1 : 0, hasDrugOverlap ? 1 : 0];
}

function vectorToFeatureRows(vector, model) {
  const names =
    model === 'drugnet'
      ? [...VARIANT_BASE_FEATURE_NAMES, ...DRUGNET_EXTRA_FEATURE_NAMES]
      : VARIANT_BASE_FEATURE_NAMES;

  return names.map((key, i) => ({
    key,
    value: typeof vector[i] === 'number' ? Number(vector[i].toFixed(4)) : vector[i],
    ...(model === 'drugnet' ? { model: 'drugnet' } : {}),
  }));
}

/**
 * Attach catalog / inference fields to a variant document before persistence.
 */
function isLegacyCatalog(doc, preprocessVersion) {
  const version = doc.preprocessVersion ?? preprocessVersion ?? process.env.PREPROCESS_VERSION ?? 'kaggle-v0';
  return version === 'kaggle-v0' && !doc.reviewStatus;
}

function enrichCatalogFields(doc, preprocessVersion) {
  const version =
    preprocessVersion || process.env.PREPROCESS_VERSION || doc.preprocessVersion || 'kaggle-v0';

  const legacy = isLegacyCatalog(doc, version);
  const pathnetVector = doc.pathnetVector ?? (legacy ? buildPathNetVector(doc) : null);
  const drugnetVector = doc.drugnetVector ?? (legacy ? buildDrugNetVector(doc) : null);

  return {
    ...doc,
    pathnetEligible: doc.pathnetEligible ?? true,
    drugnetEligible: doc.drugnetEligible ?? Boolean(doc.hasDrug),
    pathnetVector,
    drugnetVector,
    preprocessVersion: doc.preprocessVersion ?? version,
  };
}

module.exports = {
  VARIANT_BASE_FEATURE_NAMES,
  DRUGNET_EXTRA_FEATURE_NAMES,
  buildPathNetVector,
  buildDrugNetVector,
  vectorToFeatureRows,
  enrichCatalogFields,
};
