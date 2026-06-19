# VariantRx ML service

Loads the Kaggle notebook export: `artifacts/inference.pkl`

```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health: http://localhost:8000/health

Backend (`backend/.env`):

```env
ML_SERVICE_URL=http://localhost:8000
PREPROCESS_VERSION=kaggle-v1
PATHNET_MODEL_VERSION=xgb-v1
DRUGNET_MODEL_VERSION=catboost-v1
```

See [docs/NOTEBOOK_EXPORT.md](../docs/NOTEBOOK_EXPORT.md) for what the notebook must export.
