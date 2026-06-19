export default function LockedOverlay({ rsid }: { rsid: string }) {
  return (
    <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded p-8 min-h-[200px] flex flex-col items-center justify-center text-center">
      <div className="absolute inset-0 bg-[rgba(10,14,26,0.84)] rounded flex flex-col items-center justify-center gap-2 p-5">
        <span className="text-xl opacity-40">🔒</span>
        <p className="font-mono text-[9px] text-[var(--muted)] tracking-[0.07em] leading-[1.6] max-w-xs">
          DrugNet requires PGx overlap data.
          <br />
          <span className="text-[var(--accent)]">{rsid}</span> is ClinVar-only — PathNet available.
        </p>
      </div>
    </div>
  );
}
