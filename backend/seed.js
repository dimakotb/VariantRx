const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Variant = require('./models/Variant');
const PredictionResult = require('./models/PredictionResult');
const { enrichCatalogFields } = require('./utils/featureBuilder');

dotenv.config();

/** Same 34-variant demo set as frontend/src/data/mockVariants.json */
const MOCK_VARIANTS_PATH = path.join(
  __dirname,
  '..',
  'frontend',
  'src',
  'data',
  'mockVariants.json',
);

function loadDemoVariants() {
  if (!fs.existsSync(MOCK_VARIANTS_PATH)) {
    throw new Error(`Demo catalog not found: ${MOCK_VARIANTS_PATH}`);
  }
  const raw = fs.readFileSync(MOCK_VARIANTS_PATH, 'utf8');
  return JSON.parse(raw);
}

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding.');

    const demoVariants = loadDemoVariants();

    await Variant.deleteMany({});
    await PredictionResult.deleteMany({});
    console.log('Cleared existing Variants and PredictionResults.');

    const enriched = demoVariants.map((v) => enrichCatalogFields(v));
    const docs = await Variant.insertMany(enriched);
    console.log(`Successfully seeded ${docs.length} variants from mockVariants.json`);

    mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
