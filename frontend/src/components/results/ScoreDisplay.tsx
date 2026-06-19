import type { ModelTab } from '@/types';

interface ScoreDisplayProps {
  score: number;
  modelType?: ModelTab;
}

export default function ScoreDisplay({ score, modelType = 'pathnet' }: ScoreDisplayProps) {
  const parsedScore = parseFloat(String(score));
  let scoreColor = 'text-[var(--accent)]';
  let barColor = 'bg-[var(--accent)]';
  let scoreLabel = 'UNCERTAIN';

  if (modelType === 'pathnet') {
    if (parsedScore > 0.7) {
      scoreColor = 'text-[var(--danger)]';
      barColor = 'bg-[var(--danger)]';
      scoreLabel = 'PATHOGENIC';
    } else if (parsedScore < 0.45) {
      scoreColor = 'text-[var(--accent2)]';
      barColor = 'bg-[var(--accent2)]';
      scoreLabel = 'BENIGN';
    }
  } else if (parsedScore > 0.75) {
    scoreColor = 'text-[var(--danger)]';
    barColor = 'bg-[var(--danger)]';
    scoreLabel = 'HIGH RISK';
  } else if (parsedScore < 0.6) {
    scoreLabel = 'MODERATE';
  } else {
    scoreColor = 'text-[var(--accent2)]';
    barColor = 'bg-[var(--accent2)]';
    scoreLabel = 'STANDARD';
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded p-5 border-t-2 border-t-[rgba(59,142,255,0.35)] h-full">
      <div className="flex justify-between items-center mb-3">
        <span className="font-mono text-[8px] tracking-[0.14em] text-[var(--muted)] uppercase">
          ML inference score
        </span>
        <span className={`font-mono text-[9px] font-bold ${scoreColor}`}>{scoreLabel}</span>
      </div>
      <div className={`font-mono text-[42px] font-bold leading-none mb-3 ${scoreColor}`}>
        {parsedScore.toFixed(3)}
      </div>
      <div className="h-[3px] bg-[var(--surface2)] rounded overflow-hidden">
        <div
          className={`h-full ${barColor} rounded transition-all duration-700`}
          style={{ width: `${parsedScore * 100}%` }}
        />
      </div>
      <p className="font-mono text-[9px] text-[var(--muted2)] mt-2">Confidence interval mapped to [0,1]</p>
    </div>
  );
}
