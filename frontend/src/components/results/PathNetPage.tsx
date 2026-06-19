import { useState, type FormEvent } from 'react';
import ScoreDisplay from '@/components/results/ScoreDisplay';
import FeatureBar from '@/components/features/FeatureBar';
import ResultCard from '@/components/results/ResultCard';
import { createReport } from '@/services/reportService';
import InferenceMetaFooter from '@/components/results/InferenceMetaFooter';
import type { PathNetResult, Variant } from '@/types';

interface PathNetPageProps {
  result: PathNetResult;
  variant: Variant;
  onReportSaved?: () => void;
}

export default function PathNetPage({ result, variant, onReportSaved }: PathNetPageProps) {
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
        pathnetResult: {
          score: result.score,
          label: result.label,
          confidence: result.confidence,
          features: result.features,
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
        <ScoreDisplay score={result.score} modelType="pathnet" />
        <div className="md:col-span-2 space-y-4">
          <ResultCard variant={variant} />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded p-4 font-mono">
              <span className="text-[var(--muted)] text-[8px] uppercase tracking-[0.14em] block">
                Classification
              </span>
              <span className="text-[var(--text)] text-sm font-bold mt-1 block">{result.label}</span>
            </div>
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded p-4 font-mono">
              <span className="text-[var(--muted)] text-[8px] uppercase tracking-[0.14em] block">
                Confidence
              </span>
              <span className="text-sm font-bold mt-1 block text-[var(--accent)]">
                {result.confidence}
              </span>
            </div>
          </div>
        </div>
      </div>

      <FeatureBar features={result.features} model="pathnet" />
      <InferenceMetaFooter meta={result} />

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded p-5">
        <h3 className="text-[var(--muted)] text-[8px] font-mono uppercase tracking-[0.14em] mb-4 pb-2 border-b border-[var(--border)]">
          Save analysis to patient profile
        </h3>
        {saveSuccess && (
          <p className="mb-3 text-[var(--accent2)] text-xs font-mono">✔ Report saved.</p>
        )}
        {saveError && (
          <p className="mb-3 text-[var(--danger)] text-xs font-mono">✖ {saveError}</p>
        )}
        <form onSubmit={handleSaveReport} className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
          <div className="md:col-span-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="Patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="bg-[var(--bg)] border border-[var(--border)] text-xs px-3 py-2 rounded text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                placeholder="Medical record ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="bg-[var(--bg)] border border-[var(--border)] text-xs px-3 py-2 rounded text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
            <textarea
              placeholder="Clinical interpretation notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-[var(--bg)] border border-[var(--border)] text-xs px-3 py-2 rounded text-[var(--text)] focus:border-[var(--accent)] focus:outline-none font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="self-end bg-[rgba(59,142,255,0.1)] border border-[rgba(59,142,255,0.3)] text-[var(--accent)] text-xs font-bold py-3 rounded uppercase tracking-wider cursor-pointer hover:bg-[rgba(59,142,255,0.18)] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Commit Analysis'}
          </button>
        </form>
      </div>
    </div>
  );
}
