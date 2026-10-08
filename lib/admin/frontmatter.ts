// Tiny frontmatter parse/stringify (subset of YAML that gray-matter also reads).
// Supports: strings ('quoted' or plain), booleans, arrays of strings [a, 'b'].

export type FM = Record<string, unknown>;

export function parseMd(raw: string): { data: FM; body: string } {
  if (!raw.startsWith('---')) return { data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: raw };
  const head = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, '');
  const data: FM = {};
  for (const line of head.split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      const inner = val.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        : [];
    } else if (val === 'true') data[key] = true;
    else if (val === 'false') data[key] = false;
    else data[key] = val.replace(/^['"]|['"]$/g, '');
  }
  return { data, body };
}

function q(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

export function stringifyMd(data: FM, body: string, order: string[]): string {
  const keys = [...order, ...Object.keys(data).filter((k) => !order.includes(k))];
  const lines = keys
    .filter((k) => data[k] !== undefined)
    .map((k) => {
      const v = data[k];
      if (Array.isArray(v)) return `${k}: [${v.map((x) => q(String(x))).join(', ')}]`;
      if (typeof v === 'boolean') return `${k}: ${v}`;
      return `${k}: ${q(String(v ?? ''))}`;
    });
  return `---\n${lines.join('\n')}\n---\n\n${body.replace(/^\n+/, '')}`;
}
