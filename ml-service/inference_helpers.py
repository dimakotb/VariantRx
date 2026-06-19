"""Helper functions referenced by notebook-pickled VariantRxInference."""
from __future__ import annotations

import numpy as np


def assign_gene_function(gene):
    g = str(gene).upper()
    if any(g.startswith(p) for p in ("CYP", "UGT", "NAT")):
        return "metabolism"
    if g in ("DPYD", "TPMT", "NUDT15"):
        return "metabolism"
    if any(g.startswith(p) for p in ("SLCO", "ABCB", "ABCG")):
        return "transport"
    if g.startswith("HLA"):
        return "immune"
    if g in ("VKORC1", "F5", "F2", "F10"):
        return "coagulation"
    if g in ("G6PD",):
        return "oxidative_stress"
    if g in ("CFTR", "RYR1", "CACNA1S"):
        return "channel"
    return "other"


_METABOLIZERS = {
    "CYP2D6", "CYP2C9", "CYP2C19", "CYP3A4", "CYP3A5",
    "CYP1A2", "DPYD", "TPMT", "NUDT15", "UGT1A1", "NAT2",
}
_TRANSPORTERS = {"SLCO1B1", "ABCB1", "ABCG2"}
_HLA_IMMUNE = {"HLA-B", "HLA-A"}


def _gene_func_ordinal(g):
    g = str(g).upper()
    if g in _METABOLIZERS:
        return 3
    if g in _TRANSPORTERS:
        return 2
    if g in _HLA_IMMUNE:
        return 1
    return 0


def first_base(series):
    return series.fillna("N").str.upper().str[0:1].values.reshape(-1, 1)


def bucket_gene(series, top_genes):
    return series.where(series.isin(top_genes), other="__OTHER__").values.reshape(-1, 1)


def apply_winsorizer(X, bounds):
    X = X.copy()
    for i, (lo, hi) in bounds.items():
        X[:, i] = np.clip(X[:, i], lo, hi)
    return X


# Names the notebook pickle may reference from __main__
NOTEBOOK_GLOBALS = {
    "assign_gene_function": assign_gene_function,
    "_gene_func_ordinal": _gene_func_ordinal,
    "first_base": first_base,
    "bucket_gene": bucket_gene,
    "apply_winsorizer": apply_winsorizer,
}
