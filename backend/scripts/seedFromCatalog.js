/**
 * Load preprocessed variant catalog from JSONL (notebook export).
 * Streams line-by-line and uses bulk upserts (safe for 1M+ rows).
 *
 * Usage:
 *   node scripts/seedFromCatalog.js
 *   node scripts/seedFromCatalog.js path/to/catalog.jsonl
 *   node scripts/seedFromCatalog.js path/to/catalog.jsonl --replace
 *
 * Default file: backend/data/catalog.sample.jsonl
 * Full catalog:  backend/data/inference_catalog.jsonl
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Variant = require('../models/Variant');
const { enrichCatalogFields } = require('../utils/featureBuilder');
const { normalizeCatalogRow } = require('../utils/catalogNormalizer');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const defaultCatalogPath = path.join(__dirname, '..', 'data', 'inference_catalog.jsonl');
const BATCH_SIZE = 2000;

function parseArgs() {
  const args = process.argv.slice(2);
  const replace = args.includes('--replace');
  const filePath = args.find((a) => !a.startsWith('--')) || defaultCatalogPath;
  return { catalogPath: filePath, replace };
}

async function* iterateJsonl(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum += 1;
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      yield JSON.parse(trimmed);
    } catch (err) {
      throw new Error(`Invalid JSON on line ${lineNum}: ${err.message}`);
    }
  }
}

async function flushBatch(batch) {
  if (!batch.length) return 0;
  const result = await Variant.bulkWrite(batch, { ordered: false });
  return (result.upsertedCount || 0) + (result.modifiedCount || 0) + (result.matchedCount || 0);
}

async function seedFromCatalog() {
  const { catalogPath, replace } = parseArgs();

  if (!fs.existsSync(catalogPath)) {
    console.error(`Catalog file not found: ${catalogPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(catalogPath);
  console.log(`Catalog: ${catalogPath}`);
  console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log('Streaming JSONL (this may take 30–90+ minutes for ~1.4M rows)…\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected.');

  if (replace) {
    const deleted = await Variant.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing variants (--replace).`);
  }

  const started = Date.now();
  let batch = [];
  let processed = 0;
  let errors = 0;

  try {
    for await (const row of iterateJsonl(catalogPath)) {
      try {
        const doc = enrichCatalogFields(normalizeCatalogRow(row));
        batch.push({
          updateOne: {
            filter: { rsid: doc.rsid },
            update: { $set: doc },
            upsert: true,
          },
        });
      } catch (err) {
        errors += 1;
        if (errors <= 5) console.warn(`Skip row: ${err.message}`);
        continue;
      }

      if (batch.length >= BATCH_SIZE) {
        await flushBatch(batch);
        processed += batch.length;
        batch = [];
        if (processed % 10000 === 0) {
          const elapsed = ((Date.now() - started) / 1000).toFixed(0);
          console.log(`  … ${processed.toLocaleString()} rows (${elapsed}s)`);
        }
      }
    }

    if (batch.length) {
      await flushBatch(batch);
      processed += batch.length;
    }
  } finally {
    const totalInDb = await Variant.countDocuments();
    await mongoose.connection.close();

    const elapsedMin = ((Date.now() - started) / 60000).toFixed(1);
    console.log(`\nDone in ${elapsedMin} min.`);
    console.log(`Processed: ${processed.toLocaleString()} rows`);
    if (errors) console.log(`Skipped (errors): ${errors}`);
    console.log(`Variants in MongoDB: ${totalInDb.toLocaleString()}`);
    process.exit(0);
  }
}

seedFromCatalog().catch((err) => {
  console.error(err);
  process.exit(1);
});
