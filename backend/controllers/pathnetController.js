const PredictionResult = require('../models/PredictionResult');
const Variant = require('../models/Variant');
const { predictPathNet } = require('../services/mlInference');

// POST /api/predict/pathnet  { rsid }
const runPathNet = async (req, res, next) => {
  try {
    const { rsid } = req.body;

    const variant = await Variant.findOne({ rsid });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found in inference catalog',
      });
    }

    if (variant.pathnetEligible === false) {
      return res.status(400).json({
        success: false,
        message: 'PathNet is not available for this variant',
      });
    }

    const inference = await predictPathNet(variant);

    const result = await PredictionResult.create({
      rsid,
      model: 'pathnet',
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

module.exports = { runPathNet };
