"""
Load Kaggle notebook inference bundle from artifacts/inference.pkl

The notebook must export a pickled object with:
  - predict_pathnet(variant_dict) -> dict
  - predict_drugnet(variant_dict) -> dict
  - preprocess_version, pathnet_model_version, drugnet_model_version (optional attrs)
"""
from __future__ import annotations

import io
import os
import pickle
import sys
from pathlib import Path
from typing import Any

from inference_class import VariantRxInference
from inference_helpers import NOTEBOOK_GLOBALS

# Notebook pickles VariantRxInference and helper refs from __main__ / __mp_main__.
for _mod_name in ("__main__", "__mp_main__"):
    if _mod_name not in sys.modules:
        sys.modules[_mod_name] = sys.modules[__name__]
    _mod = sys.modules[_mod_name]
    _mod.VariantRxInference = VariantRxInference
    for _name, _fn in NOTEBOOK_GLOBALS.items():
        setattr(_mod, _name, _fn)

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
DEFAULT_BUNDLE = ARTIFACTS_DIR / "inference.pkl"

_engine: Any | None = None
_load_error: str | None = None


def get_bundle_path() -> Path:
    return Path(os.getenv("INFERENCE_BUNDLE_PATH", str(DEFAULT_BUNDLE)))


def load_engine(force: bool = False) -> Any | None:
    global _engine, _load_error

    if _engine is not None and not force:
        return _engine

    bundle_path = get_bundle_path()
    if not bundle_path.is_file():
        _load_error = f"Inference bundle not found: {bundle_path}"
        _engine = None
        return None

    class _NotebookUnpickler(pickle.Unpickler):
        def find_class(self, module, name):
            if name == "VariantRxInference":
                return VariantRxInference
            return super().find_class(module, name)

    try:
        with bundle_path.open("rb") as fh:
            _engine = _NotebookUnpickler(fh).load()
        _load_error = None
    except Exception as exc:  # noqa: BLE001 — surface load failures to health endpoint
        _load_error = str(exc)
        _engine = None

    return _engine


def engine_status() -> dict:
    bundle_path = get_bundle_path()
    engine = load_engine()
    return {
        "artifacts_loaded": engine is not None,
        "bundle_path": str(bundle_path),
        "bundle_exists": bundle_path.is_file(),
        "load_error": _load_error,
        "preprocess_version": getattr(engine, "preprocess_version", None),
        "pathnet_model_version": getattr(engine, "pathnet_model_version", None),
        "drugnet_model_version": getattr(engine, "drugnet_model_version", None),
    }


def _confidence_from_prob(prob: float) -> str:
    if prob >= 0.85:
        return "HIGH"
    if prob >= 0.65:
        return "MODERATE"
    return "LOW"


def _format_pathnet(raw: dict, engine: Any) -> dict:
    label_raw = str(raw.get("label", "Uncertain"))
    label = label_raw.upper() if label_raw in ("Pathogenic", "Benign") else label_raw
    if label == "PATHOGENIC" or label_raw == "Pathogenic":
        label = "PATHOGENIC"
    elif label == "BENIGN" or label_raw == "Benign":
        label = "BENIGN"

    score = float(
        raw.get("score")
        or raw.get("pathogenic_prob")
        or raw.get("confidence")
        or 0.5
    )
    confidence = raw.get("confidence_level") or _confidence_from_prob(
        float(raw.get("confidence", score))
    )
    if isinstance(confidence, (int, float)):
        confidence = _confidence_from_prob(float(confidence))

    return {
        "score": round(score, 3),
        "label": label,
        "confidence": confidence,
        "features": raw.get("features") or [],
        "modelVersion": getattr(engine, "pathnet_model_version", "kaggle-v1"),
        "preprocessVersion": getattr(engine, "preprocess_version", "kaggle-v1"),
        "pathogenicProb": raw.get("pathogenic_prob"),
        "benignProb": raw.get("benign_prob"),
    }


def _format_drugnet(raw: dict, engine: Any) -> dict:
    score = float(raw.get("score") or raw.get("confidence") or 0.5)
    confidence = raw.get("confidence_level") or _confidence_from_prob(score)
    if isinstance(confidence, (int, float)):
        confidence = _confidence_from_prob(float(confidence))

    class_probs = raw.get("class_probs") or raw.get("classProbs")

    return {
        "score": round(score, 3),
        "label": raw.get("label", "Unknown"),
        "confidence": confidence,
        "features": raw.get("features") or [],
        "drugs": raw.get("drugs") or [],
        "classProbs": class_probs,
        "modelVersion": getattr(engine, "drugnet_model_version", "kaggle-v1"),
        "preprocessVersion": getattr(engine, "preprocess_version", "kaggle-v1"),
    }


def predict_pathnet(variant: dict) -> dict:
    engine = load_engine()
    if engine is None:
        raise RuntimeError(_load_error or "Inference bundle not loaded")

    if not hasattr(engine, "predict_pathnet"):
        raise RuntimeError("inference.pkl must expose predict_pathnet(variant_dict)")

    raw = engine.predict_pathnet(variant)
    if not isinstance(raw, dict):
        raise RuntimeError("predict_pathnet must return a dict")
    return _format_pathnet(raw, engine)


def predict_drugnet(variant: dict) -> dict:
    engine = load_engine()
    if engine is None:
        raise RuntimeError(_load_error or "Inference bundle not loaded")

    if not hasattr(engine, "predict_drugnet"):
        raise RuntimeError("inference.pkl must expose predict_drugnet(variant_dict)")

    raw = engine.predict_drugnet(variant)
    if not isinstance(raw, dict):
        raise RuntimeError("predict_drugnet must return a dict")
    return _format_drugnet(raw, engine)
