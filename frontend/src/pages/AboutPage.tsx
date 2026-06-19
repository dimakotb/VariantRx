import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import { env } from '@/config/env';

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-[var(--surface)] border border-[var(--border)] rounded p-6 space-y-3">
      <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
        {title}
      </h2>
      <div className="text-sm text-[var(--muted)] leading-relaxed space-y-2 font-sans">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <AppShell>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-8">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
              Platform overview
            </p>
            <h1 className="text-2xl font-bold text-[var(--text)] font-mono tracking-tight">
              How {env.appName} works
            </h1>
            <p className="mt-3 text-[var(--muted)] text-sm leading-relaxed">
              {env.appName} is a pharmacogenomics research dashboard that runs two independent
              machine-learning pipelines on a shared ClinVar + PharmGKB inference catalog.
            </p>
          </div>

          <Section title="PathNet — pathogenicity">
            <p>
              <strong className="text-[var(--text)]">Model:</strong> XGBoost classifier trained on
              ClinVar-derived features (review evidence, submitters, variant type, GTR flags, and
              encoded metadata).
            </p>
            <p>
              <strong className="text-[var(--text)]">Scope:</strong> Variants in the preprocessed
              catalog with pathogenicity labels (Pathogenic / Benign).
            </p>
            <p>
              <strong className="text-[var(--text)]">Output:</strong> Pathogenicity probability,
              PATHOGENIC / BENIGN label, and confidence tier.
            </p>
          </Section>

          <Section title="DrugNet — pharmacogenomics">
            <p>
              <strong className="text-[var(--text)]">Model:</strong> CatBoost multi-class classifier
              for drug response categories (PK/Dosage, Drug Efficacy, Drug Toxicity/Sensitivity).
            </p>
            <p>
              <strong className="text-[var(--text)]">Scope:</strong> Only variants with PharmGKB
              overlap (<code className="text-[var(--accent)]">hasDrug</code> in the catalog).
            </p>
            <p>
              <strong className="text-[var(--text)]">Output:</strong> Predicted drug-response class
              and per-class probabilities.
            </p>
          </Section>

          <Section title="Data sources">
            <ul className="list-disc pl-5 space-y-1">
              <li>ClinVar — variant pathogenicity, review status, submitter counts</li>
              <li>PharmGKB — drug associations and PGx annotation flags</li>
              <li>Gene–disease mappings for display context</li>
            </ul>
          </Section>

          <Section title="Inference catalog">
            <p>
              Predictions run only on variants loaded into the MongoDB catalog (exported from the
              Kaggle preprocessing notebook). Search by rsID, gene, or drug name to select a
              catalog row, then run each model independently.
            </p>
            <p className="text-[var(--muted2)] text-xs font-mono">
              Footer metadata shows preprocess version (e.g. kaggle-v1) and model version (e.g.
              xgb-v1) when live ML is connected.
            </p>
          </Section>

          <Section title="Important disclaimer">
            <p>
              This tool is for <strong className="text-[var(--warn)]">research and education</strong>
              , not clinical diagnosis. Do not use outputs for patient care decisions.
            </p>
          </Section>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/"
              className="px-4 py-2 rounded border border-[var(--accent)] text-[var(--accent)] text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-[rgba(59,142,255,0.1)]"
            >
              Go to analysis
            </Link>
            <Link
              to="/reports"
              className="px-4 py-2 rounded border border-[var(--border)] text-[var(--muted)] text-[10px] font-mono uppercase tracking-wider hover:text-[var(--text)] hover:border-[var(--border-hi)]"
            >
              Patient reports
            </Link>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
