// Deterministic gradient placeholder (Medium-style) from any seed string.
export function hue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

export default function Thumb({ seed, letter, large }: { seed: string; letter: string; large?: boolean }) {
  const h = hue(seed);
  return (
    <div
      className={`thumb${large ? ' lg' : ''}`}
      aria-hidden
      style={{ background: `linear-gradient(135deg, hsl(${h} 45% 42%), hsl(${(h + 50) % 360} 55% 32%))` }}
    >
      {letter.toUpperCase()}
    </div>
  );
}
