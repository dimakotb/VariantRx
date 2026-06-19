const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  key:   { type: String },
  value: { type: mongoose.Schema.Types.Mixed },
});

const predictionResultSchema = new mongoose.Schema(
  {
    rsid:       { type: String, required: true, index: true },
    model:      { type: String, enum: ['pathnet', 'drugnet'], required: true },
    score:      { type: Number, required: true },
    label:      { type: String, required: true },
    confidence: { type: String, enum: ['HIGH', 'MODERATE', 'LOW'] },
    features:   { type: [featureSchema], default: [] },
    inputs:     { type: mongoose.Schema.Types.Mixed },
    preprocessVersion: { type: String },
    modelVersion:      { type: String },
    inCatalog:         { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PredictionResult', predictionResultSchema);