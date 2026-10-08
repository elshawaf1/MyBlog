/** Client-safe helpers (no node imports — usable in client components). */
export function prettyName(slug: string): string {
  return slug
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}
