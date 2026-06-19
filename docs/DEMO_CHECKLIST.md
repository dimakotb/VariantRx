# VariantRx demo checklist

Run through before presenting or recording a demo.

## Demo mode (frontend only)

- [ ] `VITE_USE_MOCK_API=true` in `frontend/.env`
- [ ] `npm run dev` in `frontend`
- [ ] Login with any email/password
- [ ] Search `CYP2C9` → select variant → Run PathNet → see score + features
- [ ] Select PGx variant → DrugNet tab → Run DrugNet → see drugs list
- [ ] Select ClinVar-only variant → DrugNet shows locked state
- [ ] Save report → History panel → export HTML
- [ ] Manual override: run PathNet in mock mode only

## Full stack (catalog + API)

- [ ] MongoDB running; `MONGO_URI` in `backend/.env`
- [ ] `cd backend && npm run seed` (loads 34 variants from `mockVariants.json`)
- [ ] `npm run dev` in backend (port 5001)
- [ ] `VITE_USE_MOCK_API=false` in `frontend/.env`
- [ ] Register account → login
- [ ] Search → select → PathNet predict (catalog rsid)
- [ ] DrugNet predict on PGx variant
- [ ] Manual override: predict buttons disabled with message
- [ ] Save report → appears in History (MongoDB, not localStorage)
- [ ] Footer shows `preprocess kaggle-v0 · model mock-v0`

## Optional ML service

- [ ] `cd ml-service && uvicorn main:app --port 8000`
- [ ] `ML_SERVICE_URL=http://localhost:8000` in backend `.env`
- [ ] Predictions use Python stub (deterministic from vector)

## Tests

```bash
cd backend && npm test
cd frontend && npm test
```

## Known limitations (mention in thesis)

- Inference only on variants in the preprocessed catalog
- Mock/stub models until Kaggle weights are deployed
- Manual override is demo-only when using live API
