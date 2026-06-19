# Inference catalog format

Each line in a `.jsonl` file is one variant document. Required fields: `rsid`, `gene`, `chrom`, `ref`, `alt`, `path`.

Optional: `pathnetVector`, `drugnetVector` (if omitted, `seedFromCatalog.js` computes them via `utils/featureBuilder.js`).

See `catalog.sample.jsonl` for examples.

**Demo seed:** `npm run seed` loads all 34 rows from `frontend/src/data/mockVariants.json` (same as mock UI).

```bash
cd backend
npm run seed:catalog                              # default: data/inference_catalog.jsonl
npm run seed:catalog:full                         # same (~1.4M rows, 30–90+ min)
npm run seed:catalog data/catalog_5k.jsonl        # small sample
npm run seed:catalog data/inference_catalog.jsonl --replace  # wipe DB first
```

Full catalog: `inference_catalog.jsonl` (~825 MB, 1,433,828 lines). The seed script streams and bulk-upserts in batches of 2000.
