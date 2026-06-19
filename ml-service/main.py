"""
VariantRx ML inference service — loads Kaggle notebook export (artifacts/inference.pkl).

Run:
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000

Copy from Kaggle output into ml-service/artifacts/:
  inference.pkl

Then set in backend/.env:
  ML_SERVICE_URL=http://localhost:8000
  PREPROCESS_VERSION=kaggle-v1
  PATHNET_MODEL_VERSION=xgb-v1
  DRUGNET_MODEL_VERSION=catboost-v1
"""
from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from engine import engine_status, load_engine, predict_drugnet, predict_pathnet

app = FastAPI(title="VariantRx ML Service", version="0.2.0")


class PredictRequest(BaseModel):
    rsid: str
    variant: dict[str, Any] = Field(default_factory=dict)
    model: str | None = None


class PredictResponse(BaseModel):
    score: float
    label: str
    confidence: str
    features: list[dict] = Field(default_factory=list)
    modelVersion: str = "kaggle-v1"
    preprocessVersion: str = "kaggle-v1"
    drugs: list[dict] | None = None
    classProbs: dict[str, float] | None = None


@app.on_event("startup")
def startup() -> None:
    load_engine()


@app.get("/health")
def health():
    status = engine_status()
    return {"status": "ok", "service": "variantrx-ml", **status}


@app.post("/predict/pathnet", response_model=PredictResponse)
def predict_pathnet_route(body: PredictRequest):
    variant = {**body.variant, "rsid": body.rsid}
    try:
        result = predict_pathnet(variant)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return PredictResponse(**result)


@app.post("/predict/drugnet", response_model=PredictResponse)
def predict_drugnet_route(body: PredictRequest):
    variant = {**body.variant, "rsid": body.rsid}
    try:
        result = predict_drugnet(variant)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return PredictResponse(**result)
