const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  n: { type: String, required: true },   // drug name
  t: { type: String, required: true },   // type label (PK/Dosage, Drug Toxicity, etc.)
  c: { type: String, required: true },   // CSS class key (dt-pk, dt-tox, dt-ef)
});

const variantSchema = new mongoose.Schema(
  {
    rsid:      { type: String, required: true, unique: true, index: true },
    gene:      { type: String, required: true },
    chrom:     { type: String, required: true },
    ref:       { type: String, required: true },
    alt:       { type: String, required: true },
    type:      { type: String, default: 'snv' },
    path:      { type: String, enum: ['Pathogenic', 'Benign', 'Uncertain'], required: true },
    drugResp:  { type: String, default: null },
    drugs:     { type: [drugSchema], default: [] },
    diseases:  { type: [String], default: [] },
    cpic:      { type: Boolean, default: false },
    pgkb:      { type: Boolean, default: false },
    hc:        { type: Boolean, default: false },
    sub:       { type: Number, default: 1 },
    rev:       { type: Number, default: 0 },
    cat:       { type: String },
    tag:       { type: String },
    src:       { type: [String], default: [] },
    desc:      { type: String },
    hasDrug:   { type: Boolean, default: false },
    pathnetEligible:  { type: Boolean, default: true },
    drugnetEligible:  { type: Boolean, default: false },
    pathnetVector:    { type: [Number], default: null },
    drugnetVector:    { type: [Number], default: null },
    preprocessVersion:{ type: String, default: 'kaggle-v0' },
    /** Kaggle notebook inference fields (kaggle-v1 catalog) */
    reviewStatus:       { type: String },
    origin:             { type: String },
    originSimple:       { type: String },
    assembly:           { type: String, default: 'GRCh38' },
    submitterCategories:{ type: Number, default: 0 },
    testedInGtr:        { type: Boolean, default: false },
    sigBonus:           { type: Number, default: 0 },
    numDistinctDrugs:   { type: Number, default: 0 },
    sigFlag:            { type: Number, default: 0 },
    logPmidCount:       { type: Number, default: 0 },
    hasStarAllele:      { type: Number, default: 0 },
    cpicLevel:          { type: Number, default: 0 },
    geneFunctionOrdinal:{ type: Number, default: 0 },
    evidenceXGeneFunc:  { type: Number, default: 0 },
    pgxFeatures:        { type: mongoose.Schema.Types.Mixed, default: null },
    pos:              { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Variant', variantSchema);