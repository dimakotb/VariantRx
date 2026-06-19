import { useEffect, useState } from 'react';

interface LoadingBarProps {
  modelName: string;
  variant?: 'path' | 'drug';
}

export default function LoadingBar({ modelName, variant = 'path' }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const accent = variant === 'drug' ? 'var(--accent2)' : 'var(--accent)';

  const steps = [
    'Initializing tensor variables…',
    'Feature engineering & vectorization…',
    `Executing ${modelName} forward pass…`,
    'Computing probabilities & confidence…',
    'Rendering result cards…',
  ];

  useEffect(() => {
    setProgress(0);
    setLoadingStep(0);
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 5));
    }, 45);
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 180);
    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [modelName, steps.length]);

  return (
    <div className="flex flex-col justify-center items-center p-8 max-w-md mx-auto font-mono select-none">
      <div className="w-full bg-[var(--bg)] border border-[var(--border)] rounded p-5 space-y-3">
        <div className="flex justify-between text-[10px] uppercase tracking-wider">
          <span style={{ color: accent }} className="font-bold">
            {modelName} pipeline
          </span>
          <span className="text-[var(--muted)]">{progress}%</span>
        </div>
        <div className="w-full h-1 bg-[var(--surface2)] rounded overflow-hidden">
          <div
            className="h-full transition-all duration-75 rounded"
            style={{ width: `${progress}%`, background: accent }}
          />
        </div>
        <p className="text-[10px] text-[var(--muted)] animate-pulse">{steps[loadingStep]}</p>
      </div>
    </div>
  );
}
