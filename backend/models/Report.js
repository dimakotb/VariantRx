const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: [true, 'Please provide a patient name'],
      trim: true,
    },
    patientId: {
      type: String,
      default: '',
    },
    rsid: {
      type: String,
      required: true,
    },
    gene: {
      type: String,
      required: true,
    },
    variantType: {
      type: String,
      default: 'snv',
    },
    chromosome: {
      type: String,
      default: '-',
    },
    alleleChange: {
      type: String,
      default: '',
    },
    pathnetResult: {
      score: { type: Number },
      label: { type: String },
      confidence: { type: String },
      features: [
        {
          key: { type: String },
          value: { type: mongoose.Schema.Types.Mixed },
        }
      ],
    },
    drugnetResult: {
      score: { type: Number },
      label: { type: String },
      drugs: [
        {
          n: { type: String },
          t: { type: String },
          c: { type: String },
        }
      ],
      features: [
        {
          key: { type: String },
          value: { type: mongoose.Schema.Types.Mixed },
        }
      ],
    },
    reviewerNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
