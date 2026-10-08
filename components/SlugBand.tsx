// Deterministic gradient band per post. Replaces Thumb with a wider,
// art-directed treatment (keeps the same hue-hash idea).
export function hue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

export default function SlugBand({ seed, tall }: { seed: string; tall?: boolean }) {
  const h = hue(seed);
  return (
    <div
      className={`slugband${tall ? ' tall' : ''}`}
      aria-hidden
      style={{
        background: `linear-gradient(120deg, hsl(${h} 60% 26%), hsl(${(h + 60) % 360} 70% 14%) 60%, #0a0b10 130%)`,
      }}
    >
      <span className="slugband-grid" aria-hidden />
      <span className="slugband-sig" aria-hidden>
        {`◈ ${seed.slice(0, 18)}`}
      </span>
    </div>
  );
}
