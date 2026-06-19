import type { ModelFeature } from '@/types';
import type { ModelTab } from '@/types';

interface FeatureBarProps {
  features?: ModelFeature[];
  model?: ModelTab;
}

export default function FeatureBar({ features = [], model = 'pathnet' }: FeatureBarProps) {
  if (!features.length) return null;

  const borderTop =
    model === 'drugnet'
      ? 'border-t-[rgba(0,212,170,0.3)]'
      : 'border-t-[rgba(59,142,255,0.35)]';

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] border-t px-[22px] py-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[8px] tracking-[0.14em] text-[var(--muted)] uppercase">
          Model input features — {model.toUpperCase()}
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-[7px]">
        {features.map((feat, i) => (
          <div
            key={`${feat.key}-${i}`}
            className={`bg-[var(--bg)] border border-[var(--border)] rounded p-2 ${borderTop}`}
          >
            <div className="font-mono text-[8px] text-[var(--muted)] tracking-[0.05em] mb-1 truncate">
              {feat.key}
            </div>
            <div
              className="font-mono text-xs font-bold"
              style={{ color: model === 'drugnet' ? 'var(--accent2)' : 'var(--text)' }}
            >
              {feat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
