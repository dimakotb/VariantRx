# VariantRx

Bioinformatics and pharmacogenomics platform for exploring genetic variants and drug interactions. Built as a graduation portfolio project with two independent ML pipelines:

| Model | Purpose | Scope |
|-------|---------|--------|
| **PathNet** | Variant pathogenicity | All ClinVar-filtered variants (XGBoost) |
| **DrugNet** | Drug response / PGx impact | PGx overlap variants only (CatBoost) |

Dark biotech dashboard UI: grouped variant search, separate model runs, tabbed results, patient reports, and HTML export.

**Repository:** [github.com/dimakotb/VariantRx](https://github.com/dimakotb/VariantRx)

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite, React Router |
| Backend | Node.js, Express, MongoDB, JWT auth |
| ML service | Python, FastAPI, notebook export (`inference.pkl`) |

---

## Project layout

```
VariantRx/
├── frontend/          # React UI (port 5173)
├── backend/           # REST API (port 5001)
├── ml-service/        # FastAPI inference (port 8000)
├── backend/data/      # Catalog JSONL samples + seed scripts
└── docs/              # Notebook export schema, demo checklist
```

---

## ML service 

When trained models are exported from the Kaggle notebook:

```bash
cd ml-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Place `inference.pkl` in `ml-service/artifacts/`, then in `backend/.env`:

```env
ML_SERVICE_URL=http://localhost:8000
PREPROCESS_VERSION=kaggle-v1
PATHNET_MODEL_VERSION=xgb-v1
DRUGNET_MODEL_VERSION=catboost-v1
```

---

## Environment variables

**Frontend** (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_USE_MOCK_API` | `true` = mock data; `false` = live API |
| `VITE_API_BASE_URL` | `/api` (Vite proxy) or full backend URL |
| `VITE_APP_NAME` | Display name (default: VariantRx) |

**Backend** (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Auth signing key |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `ML_SERVICE_URL` | Optional FastAPI inference URL |

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/variants` | Search variants |
| `GET` | `/api/variants/:rsid` | Variant by rsID |
| `POST` | `/api/predict/pathnet` | PathNet inference `{ rsid }` |
| `POST` | `/api/predict/drugnet` | DrugNet inference `{ rsid }` |
| `GET/POST` | `/api/reports` | Saved patient analyses |
| `GET` | `/api/health` | Health check |

---

## Features

- Variant search by rsID, gene, or drug (PGx / ClinVar groups)
- Independent PathNet and DrugNet runs with loading and error states
- Manual variant override sidebar (demo mode)
- JWT authentication or mock session
- Patient report history with notes and printable HTML export

---

## Tests

```bash
cd backend && npm test
cd frontend && npm test
```

---

## License & attribution

Graduation portfolio project. UI branding: **VariantRx** 

