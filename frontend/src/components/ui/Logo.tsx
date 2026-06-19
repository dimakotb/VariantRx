/** DNA helix logo from HTML prototype */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M7 4 C7 4,14 8,14 14 C14 20,21 24,21 24"
        stroke="#3B8EFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M21 4 C21 4,14 8,14 14 C14 20,7 24,7 24"
        stroke="#00D4AA"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line x1="8.5" y1="9" x2="19.5" y2="9" stroke="#3B8EFF" strokeWidth="1" opacity="0.45" />
      <line x1="8.5" y1="14" x2="19.5" y2="14" stroke="#00D4AA" strokeWidth="1" opacity="0.45" />
      <line x1="8.5" y1="19" x2="19.5" y2="19" stroke="#3B8EFF" strokeWidth="1" opacity="0.45" />
    </svg>
  );
}

export function DnaHelixEmpty({ accent = 'accent2' }: { accent?: 'accent' | 'accent2' }) {
  const stroke = accent === 'accent2' ? '#00D4AA' : '#3B8EFF';
  const stroke2 = accent === 'accent2' ? '#00D4AA' : '#3B8EFF';
  return (
    <svg className="opacity-[0.22]" width="40" height="54" viewBox="0 0 48 64" fill="none" aria-hidden>
      <path
        d="M12 4C12 4,24 12,24 32C24 52,36 60,36 60"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M36 4C36 4,24 12,24 32C24 52,12 60,12 60"
        stroke={stroke2}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={accent === 'accent2' ? 0.4 : 1}
      />
      <line x1="14" y1="14" x2="34" y2="14" stroke={stroke} strokeWidth="1.5" opacity="0.4" />
      <line x1="14" y1="26" x2="34" y2="26" stroke={stroke2} strokeWidth="1.5" opacity="0.4" />
      <line x1="14" y1="38" x2="34" y2="38" stroke={stroke} strokeWidth="1.5" opacity="0.4" />
      <line x1="14" y1="50" x2="34" y2="50" stroke={stroke2} strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}
