const PredictionResult = require('../models/PredictionResult');
const Variant = require('../models/Variant');
const { predictDrugNet } = require('../services/mlInference');

// POST /api/predict/drugnet  { rsid, useCpic?, usePgkb? }
const runDrugNet = async (req, res, next) => {
  try {
    const { rsid } = req.body;

    const variant = await Variant.findOne({ rsid });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found in inference catalog',
      });
    }

    if (!variant.hasDrug) {
      return res.status(400).json({
        success: false,
        message: 'DrugNet is not available for this variant (no PGx overlap data)',
      });
    }

    const inference = await predictDrugNet(variant);

    const result = await PredictionResult.create({
      rsid,
      model: 'drugnet',
      score: inference.score,
      label: inference.label,
      confidence: inference.confidence,
      features: inference.features,
      inputs: { rsid, preprocessVersion: variant.preprocessVersion },
      preprocessVersion: inference.preprocessVersion,
      modelVersion: inference.modelVersion,
      inCatalog: true,
    });

    res.json({
      success: true,
      data: {
        rsid,
        gene: variant.gene,
        score: inference.score,
        label: inference.label,
        confidence: inference.confidence,
        drugs: inference.drugs,
        classProbs: inference.classProbs,
        src: variant.src,
        features: inference.features,
        resultId: result._id,
        preprocessVersion: inference.preprocessVersion,
        modelVersion: inference.modelVersion,
        inCatalog: inference.inCatalog,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { runDrugNet };
