/**
 * Normalize Kaggle notebook JSONL rows → MongoDB Variant documents.
 * Supports kaggle-v1 (notebook) and legacy kaggle-v0 (demo) rows.
 */

const DRUG_TYPE_CSS = {
  'PK/Dosage': 'dt-pk',
  'Drug Efficacy': 'dt-ef',
  'Drug Toxicity/Sensitivity': 'dt-tox',
};

function pick(row, ...keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }
  return undefined;
}

function normalizeDrugs(row) {
  if (Array.isArray(row.drugs) && row.drugs.length) {
    return row.drugs.map((d) => ({
      n: d.n || d.name || d.DrugName || 'Unknown',
      t: d.t || d.type || row.drugResp || row.DrugResponse || 'Drug Efficacy',
      c: d.c || DRUG_TYPE_CSS[d.t || d.type || row.drugResp] || 'dt-ef',
    }));
  }

  const name = pick(row, 'drugName', 'DrugName');
  const resp = pick(row, 'drugResp', 'DrugResponse');
  if (name) {
    return [{ n: String(name), t: resp || 'Drug Efficacy', c: DRUG_TYPE_CSS[resp] || 'dt-ef' }];
  }
  return [];
}

function normalizeRsid(row) {
  const raw = pick(row, 'rsid', 'RSID', 'RSID_num');
  if (raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (/^rs\d+$/.test(s)) return s;
  const num = String(raw).replace(/\D/g, '');
  return num ? `rs${num}` : null;
}

function normalizeCatalogRow(row) {
  const rsid = normalizeRsid(row);
  if (!rsid) {
    throw new Error('Catalog row missing rsid');
  }

  const path =
    pick(row, 'path', 'PathBinary', 'pathLabel') || 'Uncertain';
  const hasDrugExplicit = pick(row, 'hasDrug', 'HasDrug', 'hasTrustedDrugLabel');
  const hasDrug =
    hasDrugExplicit !== undefined
      ? Boolean(hasDrugExplicit)
      : Boolean(pick(row, 'drugResp', 'DrugResponse', 'drugName', 'DrugName'));

  const doc = {
    rsid,
    gene: pick(row, 'gene', 'GeneSymbol') || 'Unknown',
    chrom: String(pick(row, 'chrom', 'Chromosome', 'chromosome') ?? ''),
    ref: String(pick(row, 'ref', 'ReferenceAllele') ?? ''),
    alt: String(pick(row, 'alt', 'AlternateAllele') ?? ''),
    type: pick(row, 'type', 'Type') || 'snv',
    path,
    drugResp: pick(row, 'drugResp', 'DrugResponse') || null,
    drugs: normalizeDrugs(row),
    diseases: Array.isArray(row.diseases) ? row.diseases : [],
    cpic: Boolean(pick(row, 'cpic', 'IsCPIC_Gene', 'isCpicGene')),
    pgkb: Boolean(pick(row, 'pgkb', 'HasTrustedDrugLabel', 'hasPgkb')),
    hc: Boolean(pick(row, 'hc', 'IsHighConfidence', 'isHighConfidence')),
    sub: Number(pick(row, 'sub', 'NumberSubmitters') ?? 1),
    rev: Number(pick(row, 'rev', 'EvidenceOrdinal', 'evidenceOrdinal') ?? 0),
    desc: pick(row, 'desc', 'description') || '',
    src: Array.isArray(row.src) ? row.src : hasDrug ? ['ClinVar', 'PharmGKB'] : ['ClinVar'],
    hasDrug,
    pathnetEligible: row.pathnetEligible !== false,
    drugnetEligible: row.drugnetEligible ?? hasDrug,
    preprocessVersion: pick(row, 'preprocessVersion') || 'kaggle-v1',
    reviewStatus: pick(row, 'reviewStatus', 'ReviewStatus') || 'no assertion provided',
    origin: pick(row, 'origin', 'Origin') || 'germline',
    originSimple: pick(row, 'originSimple', 'OriginSimple') || 'germline',
    assembly: pick(row, 'assembly', 'Assembly') || 'GRCh38',
    submitterCategories: Number(pick(row, 'submitterCategories', 'SubmitterCategories') ?? 0),
    testedInGtr: Boolean(pick(row, 'testedInGtr', 'TestedInGTR', 'testedInGTR')),
    sigBonus: Number(pick(row, 'sigBonus', 'SigBonus') ?? 0),
    numDistinctDrugs: Number(pick(row, 'numDistinctDrugs', 'NumDistinctDrugs') ?? 0),
    sigFlag: Number(pick(row, 'sigFlag', 'SigFlag') ?? 0),
    logPmidCount: Number(pick(row, 'logPmidCount', 'LogPMIDCount') ?? 0),
    hasStarAllele: Number(pick(row, 'hasStarAllele', 'HasStarAllele') ?? 0),
    cpicLevel: Number(pick(row, 'cpicLevel', 'CPICLevel') ?? 0),
    geneFunctionOrdinal: Number(pick(row, 'geneFunctionOrdinal', 'GeneFunctionOrdinal') ?? 0),
    evidenceXGeneFunc: Number(pick(row, 'evidenceXGeneFunc', 'EvidenceXGeneFunc') ?? 0),
    pgxFeatures: row.pgxFeatures && typeof row.pgxFeatures === 'object' ? row.pgxFeatures : null,
  };

  if (!doc.pgxFeatures) {
    const ann = {};
    for (const [key, value] of Object.entries(row)) {
      if (key.startsWith('AnnCount_') || key.startsWith('annCount_')) {
        ann[key] = Number(value) || 0;
      }
    }
    if (Object.keys(ann).length) doc.pgxFeatures = ann;
  }

  if (row.pathnetVector) doc.pathnetVector = row.pathnetVector;
  if (row.drugnetVector) doc.drugnetVector = row.drugnetVector;

  return doc;
}

module.exports = { normalizeCatalogRow, normalizeRsid };
