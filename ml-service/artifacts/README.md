# ML artifacts from Kaggle notebook

Place the exported bundle here:

```
artifacts/
  inference.pkl    ← required (pickled VariantRxInference object from notebook)
```

The pickle must expose:

- `predict_pathnet(variant_dict) -> dict`
- `predict_drugnet(variant_dict) -> dict`

Optional attributes: `preprocess_version`, `pathnet_model_version`, `drugnet_model_version`

See `docs/NOTEBOOK_EXPORT.md` for the full export checklist.
