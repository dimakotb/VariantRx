# Kaggle notebook → VariantRx integration

Your notebook trains **XGBoost PathNet** + **CatBoost DrugNet** with encoders/scalers.  
The website loads a **variant catalog** (JSONL → MongoDB) and calls **ml-service** with each variant’s fields.

## Two exports from the notebook

| File | Purpose |
|------|---------|
| `inference_catalog.jsonl` | Searchable variants for the website |
| `inference.pkl` | Trained models + preprocessors for ml-service |

---

## 1. Catalog JSONL (`inference_catalog.jsonl`)

One JSON object per line. Import:

```bash
cd backend
npm run seed:catalog /path/to/inference_catalog.jsonl
```

### Required fields

| Field | Example | Notes |
|-------|---------|--------|
| `rsid` | `"rs1799853"` | String with `rs` prefix |
| `gene` | `"CYP2C9"` | |
| `chrom` | `"10"` | String |
| `ref` | `"C"` | |
| `alt` | `"T"` | |
| `path` | `"Pathogenic"` | `Pathogenic`, `Benign`, or `Uncertain` |
| `sub` | `24` | ClinVar submitter count |
| `rev` | `3` | Evidence ordinal (0–4) |
| `hc` | `true` | High-confidence review flag |
| `hasDrug` | `true` | PharmGKB overlap |
| `cpic` | `true` | CPIC gene flag |
| `pgkb` | `true` | PharmGKB match |
| `preprocessVersion` | `"kaggle-v1"` | |

### Required for ML inference (kaggle-v1)

These map to your notebook’s `predict_variant()` inputs:

| Field | Notebook column |
|-------|-----------------|
| `reviewStatus` | `ReviewStatus` |
| `origin` | `Origin` |
| `originSimple` | `OriginSimple` |
| `assembly` | `Assembly` |
| `type` | `Type` (e.g. `snv`, `Deletion`) |
| `submitterCategories` | `SubmitterCategories` |
| `testedInGtr` | `TestedInGTR` == Y |

### DrugNet rows (`hasDrug: true`) — also include

| Field | Notebook column |
|-------|-----------------|
| `sigBonus` | `SigBonus` |
| `numDistinctDrugs` | `NumDistinctDrugs` |
| `sigFlag` | `SigFlag` |
| `logPmidCount` | `LogPMIDCount` |
| `hasStarAllele` | `HasStarAllele` |
| `cpicLevel` | `CPICLevel` |
| `geneFunctionOrdinal` | `GeneFunctionOrdinal` |
| `evidenceXGeneFunc` | `EvidenceXGeneFunc` |
| `AnnCount_*` | Any AnnCount pivot columns (or nest under `pgxFeatures`) |

### UI metadata (recommended)

`drugs`, `diseases`, `desc`, `drugResp`, `src`, `tag`, `cat`, `type`

Example row:

```json
{"rsid":"rs1799853","gene":"CYP2C9","chrom":"10","ref":"C","alt":"T","type":"single nucleotide variant","path":"Benign","sub":42,"rev":3,"hc":true,"hasDrug":true,"cpic":true,"pgkb":true,"reviewStatus":"criteria provided, multiple submitters, no conflicts","origin":"germline","originSimple":"germline","assembly":"GRCh38","submitterCategories":2,"testedInGtr":true,"sigBonus":0.0,"numDistinctDrugs":3,"drugResp":"PK/Dosage","drugs":[{"n":"Warfarin","t":"PK/Dosage","c":"dt-pk"}],"preprocessVersion":"kaggle-v1","pathnetEligible":true,"drugnetEligible":true}
```

**Export from the full merged dataset** (before train/val rebalancing), not the 20k-sampled training `df`.

---

## 2. Inference bundle (`inference.pkl`)

Pickle a class instance that wraps your trained models and preprocessors.

### Required methods

```python
class VariantRxInference:
    preprocess_version = "kaggle-v1"
    pathnet_model_version = "xgb-v1"
    drugnet_model_version = "catboost-v1"

    def predict_pathnet(self, variant_dict: dict) -> dict:
        # Same logic as your predict_variant() pathogenicity branch
        return {
            "label": "Pathogenic",           # or "Benign"
            "score": 0.87,                   # pathogenic probability (0–1)
            "confidence": 0.87,              # probability of predicted class
            "pathogenic_prob": 0.87,
            "benign_prob": 0.13,
        }

    def predict_drugnet(self, variant_dict: dict) -> dict:
        return {
            "label": "PK/Dosage",            # class name
            "score": 0.72,                   # max class probability
            "confidence": 0.72,
            "class_probs": {
                "PK/Dosage": 0.72,
                "Drug Efficacy": 0.18,
                "Drug Toxicity/Sensitivity": 0.10,
            },
        }
```

Save:

```python
import pickle
engine = VariantRxInference(...)  # load path_xgb, drug model, all OHE/scalers inside
with open("/kaggle/working/inference.pkl", "wb") as f:
    pickle.dump(engine, f)
```

Copy to `ml-service/artifacts/inference.pkl`.

---

## 3. Wire up locally

```bash
# Backend
cd backend
npm run seed:catalog ../path/to/inference_catalog.jsonl
# .env: PREPROCESS_VERSION=kaggle-v1, ML_SERVICE_URL=http://localhost:8000

# ML service
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend: VITE_USE_MOCK_API=false
```

Health check: http://localhost:8000/health → `"artifacts_loaded": true`

---

## Verify

- [ ] Catalog row count matches your inference set
- [ ] `GET /health` shows `artifacts_loaded: true`
- [ ] Search rsID → PathNet returns PATHOGENIC/BENIGN (not stub)
- [ ] PGx variant → DrugNet returns PK/Dosage / Efficacy / Toxicity label
- [ ] Footer shows `preprocess kaggle-v1 · model xgb-v1`

Legacy demo catalog (`kaggle-v0`, 4/7 feature vectors) still works with stub inference when `ML_SERVICE_URL` is unset.
