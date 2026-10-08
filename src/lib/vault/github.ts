// GitHub REST client for the private vault repo (browser-side).
// Auth: classic PAT with `repo` scope. Token lives in localStorage only.

export interface VaultCtx {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

const API = 'https://api.github.com';

function headers(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export const b64enc = (s: string): string => btoa(unescape(encodeURIComponent(s)));
export const b64dec = (b: string): string =>
  decodeURIComponent(escape(atob(b.replace(/\n/g, ''))));

export const b64FromBytes = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
};

export async function testConnection(ctx: VaultCtx): Promise<{ ok: boolean; msg: string }> {
  try {
    const r = await fetch(`${API}/repos/${ctx.owner}/${ctx.repo}`, { headers: headers(ctx.token) });
    if (r.ok) {
      const j = await r.json();
      return { ok: true, msg: `Connected to ${j.full_name} (${j.private ? 'private' : 'public'}).` };
    }
    return { ok: false, msg: `GitHub ${r.status}: ${(await r.text()).slice(0, 160)}` };
  } catch (e) {
    return { ok: false, msg: String(e) };
  }
}

export interface RemoteFile {
  sha: string;
  text: string;
}

export async function getFile(ctx: VaultCtx, path: string): Promise<RemoteFile | null> {
  const r = await fetch(
    `${API}/repos/${ctx.owner}/${ctx.repo}/contents/${path}?ref=${encodeURIComponent(ctx.branch)}`,
    { headers: headers(ctx.token) }
  );
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GET ${path}: ${r.status}`);
  const j = await r.json();
  return { sha: j.sha as string, text: b64dec(j.content as string) };
}

export async function putFile(
  ctx: VaultCtx,
  path: string,
  text: string,
  sha: string | undefined,
  message: string
): Promise<string> {
  const body: Record<string, unknown> = { message, content: b64enc(text), branch: ctx.branch };
  if (sha) body.sha = sha;
  const r = await fetch(`${API}/repos/${ctx.owner}/${ctx.repo}/contents/${path}`, {
    method: 'PUT',
    headers: headers(ctx.token),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PUT ${path}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  return (j.commit?.html_url as string) ?? '';
}

export async function putBinary(
  ctx: VaultCtx,
  path: string,
  b64: string,
  sha: string | undefined,
  message: string
): Promise<string> {
  const body: Record<string, unknown> = { message, content: b64, branch: ctx.branch };
  if (sha) body.sha = sha;
  const r = await fetch(`${API}/repos/${ctx.owner}/${ctx.repo}/contents/${path}`, {
    method: 'PUT',
    headers: headers(ctx.token),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PUT ${path}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  return (j.commit?.html_url as string) ?? '';
}

export async function deleteFile(
  ctx: VaultCtx,
  path: string,
  sha: string,
  message: string
): Promise<void> {
  const r = await fetch(`${API}/repos/${ctx.owner}/${ctx.repo}/contents/${path}`, {
    method: 'DELETE',
    headers: headers(ctx.token),
    body: JSON.stringify({ message, sha, branch: ctx.branch }),
  });
  if (!r.ok) throw new Error(`DELETE ${path}: ${r.status}`);
}

export interface TreeEntry {
  path: string;
  sha: string;
}

/** All note files, single API call. */
export async function listNoteFiles(ctx: VaultCtx): Promise<TreeEntry[]> {
  const r = await fetch(
    `${API}/repos/${ctx.owner}/${ctx.repo}/git/trees/${encodeURIComponent(ctx.branch)}?recursive=1`,
    { headers: headers(ctx.token) }
  );
  if (!r.ok) throw new Error(`TREE: ${r.status}`);
  const j = await r.json();
  const tree = (j.tree ?? []) as { path: string; sha: string; type: string }[];
  return tree
    .filter((e) => e.type === 'blob' && e.path.startsWith('notes/') && e.path.endsWith('.md'))
    .map((e) => ({ path: e.path, sha: e.sha }));
}

export async function listImages(ctx: VaultCtx): Promise<TreeEntry[]> {
  const r = await fetch(
    `${API}/repos/${ctx.owner}/${ctx.repo}/git/trees/${encodeURIComponent(ctx.branch)}?recursive=1`,
    { headers: headers(ctx.token) }
  );
  if (!r.ok) throw new Error(`TREE: ${r.status}`);
  const j = await r.json();
  const tree = (j.tree ?? []) as { path: string; sha: string; type: string }[];
  return tree
    .filter(
      (e) =>
        e.type === 'blob' &&
        e.path.startsWith('images/') &&
        /\.(png|jpe?g|gif|webp|svg|pdf)$/i.test(e.path)
    )
    .map((e) => ({ path: e.path, sha: e.sha }));
}
