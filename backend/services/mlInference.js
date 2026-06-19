const { buildPathNetVector, buildDrugNetVector, vectorToFeatureRows } = require('../utils/featureBuilder');
const { variantToMlPayload } = require('../utils/variantToMlPayload');
const mlConfig = require('../config/mlConfig');
const { postMlPredict } = require('./mlClient');

function scoreFromPathLabel(pathLabel) {
  if (pathLabel === 'Pathogenic') return 0.75 + Math.random() * 0.2;
  if (pathLabel === 'Benign') return 0.05 + Math.random() * 0.25;
  return 0.38 + Math.random() * 0.24;
}

function pathogenicityLabel(score) {
  if (score > 0.7) return 'PATHOGENIC';
  if (score > 0.45) return 'UNCERTAIN';
  return 'BENIGN';
}

function pathogenicityConfidence(score) {
  if (score > 0.82 || score < 0.22) return 'HIGH';
  if (score > 0.65 || score < 0.38) return 'MODERATE';
  return 'LOW';
}

function stubPathNet(variant, vector) {
  const pathLabel = variant.path || 'Uncertain';
  const score = scoreFromPathLabel(pathLabel);
  const label = pathogenicityLabel(score);
  const confidence = pathogenicityConfidence(score);

  const features = [
    ...vectorToFeatureRows(vector, 'pathnet'),
    { key: 'PATH_SCORE', value: score.toFixed(3) },
  ];

  return {
    score: parseFloat(score.toFixed(3)),
    label,
    confidence,
    features,
    modelVersion: mlConfig.pathnetModelVersion,
    preprocessVersion: variant.preprocessVersion || mlConfig.preprocessVersion,
    inCatalog: true,
  };
}

function stubDrugNet(variant, vector) {
  const score = 0.55 + Math.random() * 0.38;
  const label =
    score > 0.75
      ? 'HIGH PGx IMPACT'
      : score > 0.55
        ? 'MODERATE PGx IMPACT'
        : 'LOW PGx IMPACT';
  const confidence = score > 0.7 ? 'HIGH' : 'MODERATE';

  const features = [
    ...vectorToFeatureRows(vector, 'drugnet'),
    { key: 'PGX_SCORE', value: score.toFixed(3), model: 'drugnet' },
  ];

  return {
    score: parseFloat(score.toFixed(3)),
    label: variant.drugResp || label,
    confidence,
    features,
    drugs: variant.drugs || [],
    modelVersion: mlConfig.drugnetModelVersion,
    preprocessVersion: variant.preprocessVersion || mlConfig.preprocessVersion,
    inCatalog: true,
  };
}

function normalizeMlResponse(raw, variant, model) {
  const score = Number(raw.score);
  const vector =
    model === 'pathnet'
      ? buildPathNetVector(variant)
      : buildDrugNetVector(variant);

  const features =
    Array.isArray(raw.features) && raw.features.length
      ? raw.features
      : [
          ...vectorToFeatureRows(vector, model),
          {
            key: model === 'pathnet' ? 'PATH_SCORE' : 'PGX_SCORE',
            value: score.toFixed(3),
            ...(model === 'drugnet' ? { model: 'drugnet' } : {}),
          },
        ];

  return {
    score: parseFloat(score.toFixed(3)),
    label: raw.label,
    confidence: raw.confidence || 'MODERATE',
    features,
    drugs: raw.drugs ?? variant.drugs ?? [],
    classProbs: raw.classProbs,
    modelVersion:
      raw.modelVersion ||
      (model === 'pathnet' ? mlConfig.pathnetModelVersion : mlConfig.drugnetModelVersion),
    preprocessVersion:
      raw.preprocessVersion || variant.preprocessVersion || mlConfig.preprocessVersion,
    inCatalog: true,
  };
}

async function predictPathNet(variant) {
  if (mlConfig.mlServiceUrl) {
    const payload = variantToMlPayload(variant);
    const raw = await postMlPredict('pathnet', payload);
    return normalizeMlResponse(raw, variant, 'pathnet');
  }
  const vector = buildPathNetVector(variant);
  return stubPathNet(variant, vector);
}

async function predictDrugNet(variant) {
  if (mlConfig.mlServiceUrl) {
    const payload = variantToMlPayload(variant);
    const raw = await postMlPredict('drugnet', payload);
    return normalizeMlResponse(raw, variant, 'drugnet');
  }
  const vector = buildDrugNetVector(variant);
  return stubDrugNet(variant, vector);
}

module.exports = {
  predictPathNet,
  predictDrugNet,
  stubPathNet,
  stubDrugNet,
};
