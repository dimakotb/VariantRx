import { useState, type FormEvent } from 'react';
import ScoreDisplay from '@/components/results/ScoreDisplay';
import FeatureBar from '@/components/features/FeatureBar';
import DrugList from '@/components/results/DrugList';
import ResultCard from '@/components/results/ResultCard';
import { createReport } from '@/services/reportService';
import InferenceMetaFooter from '@/components/results/InferenceMetaFooter';
import type { DrugNetResult, PathNetResult, Variant } from '@/types';

interface DrugNetPageProps {
  result: DrugNetResult;
  variant: Variant;
  pathnetResult?: PathNetResult | null;
  onReportSaved?: () => void;
}

export default function DrugNetPage({
  result,
  variant,
  pathnetResult,
  onReportSaved,
}: DrugNetPageProps) {
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSaveReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setSaveError('Patient name is required.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      await createReport({
        patientName,
        patientId,
        rsid: variant.rsid,
        gene: variant.gene,
        variantType: variant.type,
        chromosome: variant.chrom,
        alleleChange: `${variant.ref} → ${variant.alt}`,
        pathnetResult: pathnetResult
          ? {
              score: pathnetResult.score,
              label: pathnetResult.label,
              confidence: pathnetResult.confidence,
              features: pathnetResult.features,
            }
          : undefined,
        drugnetResult: {
          score: result.score,
          label: result.label || variant.drugResp || 'PGx impact',
          drugs: result.drugs?.length ? result.drugs : variant.drugs,
          features: result.features,
          confidence: result.confidence,
        },
        reviewerNotes: notes,
      });
      setSaveSuccess(true);
      setPatientName('');
      setPatientId('');
      setNotes('');
      onReportSaved?.();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save report.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreDisplay score={result.score} modelType="drugnet" />
        <div className="md:col-span-2 space-y-4">
          <ResultCard variant={variant} />
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded p-4 font-mono border-t-2 border-t-[rgba(0,212,170,0.35)]">
            <span className="text-[var(--muted)] text-[8px] uppercase tracking-[0.14em] block">
              PGx drug response label
            </span>
            <span className="text-[var(--accent2)] text-sm font-bold mt-1 block uppercase">
              {result.label || variant.drugResp || 'Altered drug response'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded p-5 border-t-2 border-t-[rgba(0,212,170,0.25)]">
        <h3 className="text-[var(--muted)] text-[8px] font-mono uppercase tracking-[0.14em] mb-3">
          Therapeutics under PGx guidelines
        </h3>
        <DrugList drugs={result.drugs?.length ? result.drugs : variant.drugs} />
      </div>

      <FeatureBar features={result.features} model="drugnet" />
      <InferenceMetaFooter meta={result} />

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded p-5">
        <h3 className="text-[var(--muted)] text-[8px] font-mono uppercase tracking-[0.14em] mb-4 pb-2 border-b border-[var(--border)]">
          Save combined analysis
        </h3>
        {saveSuccess && <p className="mb-3 text-[var(--accent2)] text-xs font-mono">✔ Report saved.</p>}
        {saveError && <p className="mb-3 text-[var(--danger)] text-xs font-mono">✖ {saveError}</p>}
        <form onSubmit={handleSaveReport} className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
          <div className="md:col-span-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="Patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="bg-[var(--bg)] border border-[var(--border)] text-xs px-3 py-2 rounded text-[var(--text)] focus:border-[var(--accent2)] focus:outline-none"
              />
              <input
                placeholder="Medical record ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="bg-[var(--bg)] border border-[var(--border)] text-xs px-3 py-2 rounded text-[var(--text)] focus:border-[var(--accent2)] focus:outline-none"
              />
            </div>
            <textarea
              placeholder="Clinical notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-[var(--bg)] border border-[var(--border)] text-xs px-3 py-2 rounded text-[var(--text)] focus:border-[var(--accent2)] focus:outline-none font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="self-end bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.3)] text-[var(--accent2)] text-xs font-bold py-3 rounded uppercase tracking-wider cursor-pointer hover:bg-[rgba(0,212,170,0.18)] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Commit Analysis'}
          </button>
        </form>
      </div>
    </div>
  );
}
