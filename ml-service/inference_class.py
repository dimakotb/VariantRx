"""
Class definition for unpickling notebook-exported inference.pkl.

The Kaggle notebook pickles VariantRxInference from __main__.
This module provides the same class so pickle can restore the instance state.
"""
from __future__ import annotations

import numpy as np
import pandas as pd


class VariantRxInference:
    preprocess_version = "kaggle-v1"
    pathnet_model_version = "xgb-v1"
    drugnet_model_version = "catboost-v1"

    def _build_row(self, variant_dict):
        df_row = pd.DataFrame([variant_dict])
        df_row["Origin"] = df_row["Origin"].apply(
            lambda x: self.ORIGIN_REMAP.get(str(x).strip(), x)
        )
        df_row["OriginSimple"] = df_row["OriginSimple"].apply(
            lambda x: self.ORIGIN_REMAP.get(str(x).strip(), x)
        )

        df_row["GeneFunction"] = df_row["GeneSymbol"].apply(self._assign_gene_function)
        df_row["NumberSubmitters"] = pd.to_numeric(
            df_row["NumberSubmitters"], errors="coerce"
        ).fillna(0)
        df_row["LogSubmitters"] = np.log1p(df_row["NumberSubmitters"])
        if "Start" not in df_row.columns:
            df_row["Start"] = variant_dict.get("Start", 0)
        df_row["Start"] = pd.to_numeric(df_row["Start"], errors="coerce").fillna(0)
        df_row["LogPosition"] = np.log1p(df_row["Start"])
        if "NumDistinctDrugs" not in df_row.columns:
            df_row["NumDistinctDrugs"] = variant_dict.get("NumDistinctDrugs", 1)
        df_row["NumDistinctDrugs"] = pd.to_numeric(
            df_row["NumDistinctDrugs"], errors="coerce"
        ).fillna(1)
        df_row["LogNumDrugs"] = np.log1p(df_row["NumDistinctDrugs"])
        df_row["IsCPIC_Gene"] = df_row["GeneSymbol"].str.upper().isin(self.PGX_GENES).astype(int)

        df_row["LastEvaluated"] = pd.to_datetime(df_row.get("LastEvaluated"), errors="coerce")
        df_row["YearsSinceEval"] = (
            (pd.Timestamp("2025-01-01") - df_row["LastEvaluated"]).dt.days / 365.0
        ).fillna(-1).clip(-1, 100)

        df_row["EvidenceOrdinal"] = (
            df_row["ReviewStatus"]
            .astype(str)
            .str.lower()
            .apply(lambda s: next((v for k, v in self.REVIEW_ORDINAL.items() if k in s), 0))
        )

        df_row["IsTransition"] = df_row.apply(
            lambda r: 1
            if (str(r["ReferenceAllele"]).upper(), str(r["AlternateAllele"]).upper())
            in self.TRANSITIONS
            else 0,
            axis=1,
        )
        df_row["IsGermline"] = (
            df_row["OriginSimple"].str.lower().str.contains("germline").astype(int)
        )
        df_row["IsIndel"] = df_row.apply(
            lambda r: 1
            if (
                len(str(r["ReferenceAllele"])) != len(str(r["AlternateAllele"]))
                or str(r["ReferenceAllele"]).upper() in ("", "-", "N")
                or str(r["AlternateAllele"]).upper() in ("", "-", "N")
            )
            else 0,
            axis=1,
        )

        df_row["TestedInGTR"] = int(variant_dict.get("TestedInGTR", 0))
        df_row["SubmitterCategories"] = float(variant_dict.get("SubmitterCategories", 0))
        df_row["GeneFunctionOrdinal"] = df_row["GeneSymbol"].apply(self._gene_func_ordinal)
        df_row["EvidenceXGeneFunc"] = df_row["EvidenceOrdinal"] * df_row["GeneFunctionOrdinal"]

        for col, default in [
            ("SigFlag", 0.0),
            ("LogPMIDCount", 0.0),
            ("HasStarAllele", 0.0),
            ("CPICLevel", 0.0),
        ]:
            if col not in df_row.columns:
                df_row[col] = default

        for col in self.PGX_NUM_FEATURES:
            if col not in df_row.columns:
                df_row[col] = 0.0

        return df_row

    def _featurize_path(self, df_row):
        cat_enc = self.cat_ohe.transform(df_row[self.CAT_FEATURES].astype(str))
        gene_enc = self.gene_ohe.transform(
            self._bucket_gene(df_row[self.GENE_FEATURE], self.top_genes)
        )
        chrom_enc = self.chrom_ohe.transform(df_row[["Chromosome"]].astype(str))
        ref_enc = self.ref_ohe.transform(self._first_base(df_row["ReferenceAllele"]))
        alt_enc = self.alt_ohe.transform(self._first_base(df_row["AlternateAllele"]))

        X = np.hstack(
            [
                df_row[self.NUM_FEATURES].values.astype(np.float32),
                cat_enc,
                gene_enc,
                chrom_enc,
                ref_enc,
                alt_enc,
            ]
        )
        X = np.nan_to_num(X, nan=0.0, posinf=10.0, neginf=-10.0)
        X = self._apply_winsorizer(X, self.winsor_bounds)
        X[:, self.cont_idx] = self.scaler.transform(X[:, self.cont_idx])
        return X

    def _featurize_drug(self, df_row):
        drug_num = df_row[self.NUM_FEATURES + self.PGX_NUM_FEATURES].values.astype(np.float32)
        drug_cat = self.drug_cat_ohe.transform(df_row[self.CAT_FEATURES].astype(str))
        drug_gene = self.drug_gene_ohe.transform(
            self._bucket_gene(df_row[self.GENE_FEATURE], self.top_genes_drug)
        )
        drug_chrom = self.drug_chrom_ohe.transform(df_row[["Chromosome"]].astype(str))
        drug_ref = self.drug_ref_ohe.transform(self._first_base(df_row["ReferenceAllele"]))
        drug_alt = self.drug_alt_ohe.transform(self._first_base(df_row["AlternateAllele"]))

        X = np.hstack([drug_num, drug_cat, drug_gene, drug_chrom, drug_ref, drug_alt])
        X = np.nan_to_num(X, nan=0.0, posinf=10.0, neginf=-10.0)
        X = self._apply_winsorizer(X, self.drug_winsor_bounds)
        X[:, self.all_drug_cont_idx] = self.drug_scaler.transform(X[:, self.all_drug_cont_idx])
        return X

    def predict_pathnet(self, variant_dict: dict) -> dict:
        df_row = self._build_row(variant_dict)
        X = self._featurize_path(df_row)
        probs = self.path_xgb.predict_proba(X)[0]

        pred_idx = int(probs[1] >= self.best_thresh)
        label = self.le_path.classes_[pred_idx]
        confidence = float(probs[pred_idx])

        return {
            "label": label,
            "score": round(float(probs[1]), 4),
            "confidence": round(confidence, 4),
            "pathogenic_prob": round(float(probs[1]), 4),
            "benign_prob": round(float(probs[0]), 4),
        }

    def predict_drugnet(self, variant_dict: dict) -> dict:
        df_row = self._build_row(variant_dict)
        X = self._featurize_drug(df_row)
        drug_probs = self.drug_xgb.predict_proba(X)[0]
        pred_idx = int(np.argmax(drug_probs))
        label = self.le_drug.classes_[pred_idx]
        confidence = float(drug_probs[pred_idx])

        return {
            "label": label,
            "score": round(confidence, 4),
            "confidence": round(confidence, 4),
            "class_probs": {
                cls: round(float(p), 4) for cls, p in zip(self.le_drug.classes_, drug_probs)
            },
        }
