const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, unique: true },
    type:       { type: String, enum: ['PK/Dosage', 'Drug Toxicity', 'Drug Efficacy'], required: true },
    cssClass:   { type: String },      // dt-pk, dt-tox, dt-ef
    linkedRsids:{ type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Drug', drugSchema);