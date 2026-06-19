import type { ReactNode } from 'react';
import { useVariant } from '@/context/VariantContext';
import { useModel } from '@/context/ModelContext';
import type { Variant } from '@/types';

const CHROMOSOMES = [
  '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y',
];

const inputCls = (enabled: boolean) =>
  `w-full bg-[var(--bg)] border text-[11px] px-2.5 py-1.5 rounded font-mono transition-colors ${
    enabled
      ? 'border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none'
      : 'border-[var(--border)] text-[var(--muted2)] cursor-not-allowed opacity-70'
  }`;

export default function VariantInputForm() {
  const { selectedVariant, manualOverride, manualVariant, handleManualChange } = useVariant();
  const { resetPredictions } = useModel();

  const current = manualOverride ? manualVariant : selectedVariant;
  const enabled = manualOverride;

  const change = <K extends keyof Variant>(field: K, value: Variant[K]) => {
    handleManualChange(field, value);
    resetPredictions();
  };

  const v = (field: keyof Variant, fallback = '') => {
    if (!current) return fallback;
    const val = current[field];
    return val !== undefined && val !== null ? String(val) : fallback;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="field flex flex-col gap-1">
        <label className="text-[10px] text-[var(--muted)] font-mono tracking-[0.07em]">RS ID</label>
        <input
          type="text"
          placeholder="e.g. rs1799853"
          value={v('rsid')}
          disabled={!enabled}
          onChange={(e) => change('rsid', e.target.value)}
          className={inputCls(enabled)}
        />
      </div>
      <div className="field flex flex-col gap-1">
        <label className="text-[10px] text-[var(--muted)] font-mono tracking-[0.07em]">GENE SYMBOL</label>
        <input
          type="text"
          placeholder="e.g. CYP2C9"
          value={v('gene')}
          disabled={!enabled}
          onChange={(e) => change('gene', e.target.value)}
          className={inputCls(enabled)}
        />
      </div>

      <div className="field flex flex-col gap-1">
        <label className="text-[10px] text-[var(--muted)] font-mono tracking-[0.07em]">VARIANT TYPE</label>
        <select
          value={v('type', 'snv')}
          disabled={!enabled}
          onChange={(e) => change('type', e.target.value)}
          className={inputCls(enabled)}
        >
          <option value="snv">Single Nucleotide Variant</option>
          <option value="del">Deletion</option>
          <option value="ins">Insertion</option>
          <option value="dup">Duplication</option>
          <option value="indel">Indel</option>
        </select>
      </div>

      <div className="field flex flex-col gap-1">
        <label className="text-[10px] text-[var(--muted)] font-mono tracking-[0.07em]">ALLELE CHANGE</label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="REF"
            maxLength={4}
            value={v('ref')}
            disabled={!enabled}
            onChange={(e) => change('ref', e.target.value)}
            className={`${inputCls(enabled)} w-12 text-center uppercase`}
          />
          <span className="text-[var(--muted)] font-mono">→</span>
          <input
            type="text"
            placeholder="ALT"
            maxLength={4}
            value={v('alt')}
            disabled={!enabled}
            onChange={(e) => change('alt', e.target.value)}
            className={`${inputCls(enabled)} w-12 text-center uppercase`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="field flex flex-col gap-1">
          <label className="text-[10px] text-[var(--muted)] font-mono tracking-[0.07em]">CHROMOSOME</label>
          <select
            value={v('chrom', '')}
            disabled={!enabled}
            onChange={(e) => change('chrom', e.target.value)}
            className={inputCls(enabled)}
          >
            <option value="">—</option>
            {CHROMOSOMES.filter(Boolean).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field flex flex-col gap-1">
          <label className="text-[10px] text-[var(--muted)] font-mono tracking-[0.07em]">ASSEMBLY</label>
          <select disabled className={inputCls(false)}>
            <option>GRCh38</option>
          </select>
        </div>
      </div>

      <SectionHeader>CLINICAL CONTEXT</SectionHeader>

      <div className="field flex flex-col gap-1">
        <label className="text-[10px] text-[var(--muted)] font-mono tracking-[0.07em]">REVIEW STATUS</label>
        <select
          value={current?.rev ?? 0}
          disabled={!enabled}
          onChange={(e) => change('rev', parseInt(e.target.value, 10))}
          className={inputCls(enabled)}
        >
          <option value={4}>Practice guideline</option>
          <option value={3}>Expert panel reviewed</option>
          <option value={2}>Multiple submitters, no conflicts</option>
          <option value={1}>Single submitter</option>
          <option value={0}>No assertion criteria</option>
        </select>
      </div>

      <div className="field flex flex-col gap-1">
        <label className="text-[10px] text-[var(--muted)] font-mono tracking-[0.07em]">SUBMITTER COUNT</label>
        <input
          type="number"
          min={1}
          placeholder="e.g. 5"
          value={current?.sub ?? 1}
          disabled={!enabled}
          onChange={(e) => change('sub', Math.max(1, parseInt(e.target.value, 10) || 1))}
          className={inputCls(enabled)}
        />
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="sec-hdr flex items-center gap-1.5 -mx-[18px] px-[18px] py-2 mt-2 font-mono text-[8px] tracking-[0.16em] text-[var(--muted)] border-y border-[var(--border)]">
      {children}
    </div>
  );
}
