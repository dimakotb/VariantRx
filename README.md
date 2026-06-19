# VariantRx

Bioinformatics and pharmacogenomics platform for graduation portfolio work. Showcases dual independent ML pipelines:

- **PathNet** — variant pathogenicity (Residual MLP, all ClinVar-filtered variants)
- **DrugNet** — drug response / PGx impact (XGBoost, PGx overlap variants only)

UI follows the independent dual-model HTML prototype: dark biotech dashboard, grouped variant search, separate run buttons, and tabbed model results.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite, React Router |
| Backend | Node.js, Express, MongoDB (optional) |
| ML (future) | Kaggle-trained PathNet / DrugNet → `ml-service/` (FastAPI skeleton ready) |

## Quick start (demo mode, no database)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — register or log in with any email/password (mock auth).

Set in `frontend/.env`:

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=/api
```

This loads **34 variants** from the HTML prototype dataset, runs mock inference locally, and stores patient reports in `localStorage`.

## Full stack (with backend)

```bash
# Terminal 1 — API (port 5001)
cd backend
cp .env.example .env   # configure MONGO_URI, JWT_SECRET, CLIENT_URL
npm install
node seed.js           # seed MongoDB from frontend mockVariants.json (34 rows)
npm run dev

# Terminal 2 — UI (port 5173, proxies /api → 5001)
cd frontend
npm run dev
```

Set `VITE_USE_MOCK_API=false` in `frontend/.env` to use live API routes.

## Frontend architecture

```
frontend/src/
├── types/
│   ├── index.ts        # Variant, reports, UI types
│   └── ml.types.ts     # feature vectors, PathNet/DrugNet I/O
├── utils/featureBuilder.ts   # Variant → ML feature vectors (Kaggle-aligned)
├── api/ml.api.ts       # mock inference now; swap to real POST only here
├── services/ml/
│   ├── mlClient.ts     # generic ML HTTP handler
│   ├── pathnet.service.ts
│   └── drugnet.service.ts
├── hooks/
│   ├── usePathNet.tsx  # UI must use hooks, not services directly
│   └── useDrugNet.tsx
├── services/api/client.ts
├── context/            # Auth, Variant, Model (tab + inference providers)
├── components/
└── utils/exportReport.ts
```

**ML integration readiness:** UI → `usePathNet` / `useDrugNet` → services → `api/ml.api.ts`. Live API mode uses **catalog inference**: `POST /api/predict/pathnet` and `/drugnet` with `{ rsid }`; the backend loads precomputed vectors from MongoDB. Mock mode (`VITE_USE_MOCK_API=true`) builds features client-side for demo/manual override.

### Inference catalog (pre-model training)

1. Export preprocessed rows from your Kaggle notebook to JSONL (see `backend/data/catalog.sample.jsonl`).
2. Seed MongoDB: `cd backend && npm run seed` (demo set + vectors) or `npm run seed:catalog [path/to/catalog.jsonl]`.
3. Set `VITE_USE_MOCK_API=false` and run backend + frontend for catalog-based predict.
4. When models are trained: set `ML_SERVICE_URL`, load weights in `ml-service/main.py`, update model version env vars.

Feature order: `frontend/src/types/ml.types.ts` and `backend/utils/featureBuilder.js` (must stay aligned).

### Prep already in repo (before notebook is final)

- Unified demo catalog: `backend/seed.js` reads `frontend/src/data/mockVariants.json`
- Tests: `cd backend && npm test`, `cd frontend && npm test`
- ML service skeleton: [ml-service/](ml-service/) (FastAPI stub on port 8000)
- [docs/NOTEBOOK_EXPORT.md](docs/NOTEBOOK_EXPORT.md) — export schema for Kaggle
- [docs/DEMO_CHECKLIST.md](docs/DEMO_CHECKLIST.md) — manual demo steps

## Features

- Variant search (rsID, gene, drug) with grouped PGx / ClinVar dropdown
- Independent PathNet and DrugNet execution with loading and error states
- Manual override sidebar (demo-only when live API; catalog search for production path)
- Authentication (JWT backend or mock session)
- Patient profiles — save analyses, history, edit notes
- Export printable HTML genomic reports

## Project name

Branded **VariantRx** in the app; aligns with **VARIANTIQ** prototype visual identity.
