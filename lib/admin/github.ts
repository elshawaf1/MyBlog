// Minimal GitHub REST helper for the static /admin portal (client-side only).
// Auth: fine-grained or classic PAT with contents:write on this repo.

export type GhCtx = { owner: string; repo: string; branch: string; token: string };

const API = 'https://api.github.com';

function headers(token: string) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export const b64enc = (s: string) => btoa(unescape(encodeURIComponent(s)));
export const b64dec = (b: string) => decodeURIComponent(escape(atob(b.replace(/\n/g, ''))));

export const b64FromBytes = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

export async function ghTest(ctx: GhCtx): Promise<{ ok: boolean; msg: string }> {
  const r = await fetch(`${API}/repos/${ctx.owner}/${ctx.repo}`, { headers: headers(ctx.token) });
  if (r.ok) return { ok: true, msg: 'Connected.' };
  return { ok: false, msg: `GitHub ${r.status}: ${(await r.text()).slice(0, 160)}` };
}

export type GhFile = { sha: string; text: string };

export async function getFile(ctx: GhCtx, path: string): Promise<GhFile | null> {
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
  ctx: GhCtx,
  path: string,
  text: string,
  sha: string | undefined,
  message: string
): Promise<string> {
  const body: Record<string, unknown> = {
    message,
    content: b64enc(text),
    branch: ctx.branch,
  };
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
  ctx: GhCtx,
  path: string,
  b64: string,
  sha: string | undefined,
  message: string
): Promise<string> {
  const body: Record<string, unknown> = {
    message,
    content: b64,
    branch: ctx.branch,
  };
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

export async function deleteFile(ctx: GhCtx, path: string, sha: string, message: string): Promise<void> {
  const r = await fetch(`${API}/repos/${ctx.owner}/${ctx.repo}/contents/${path}`, {
    method: 'DELETE',
    headers: headers(ctx.token),
    body: JSON.stringify({ message, sha, branch: ctx.branch }),
  });
  if (!r.ok) throw new Error(`DELETE ${path}: ${r.status}`);
}

export type DirEntry = { name: string; path: string; sha: string };

export async function listDir(ctx: GhCtx, dir: string): Promise<DirEntry[]> {
  const r = await fetch(
    `${API}/repos/${ctx.owner}/${ctx.repo}/contents/${dir}?ref=${encodeURIComponent(ctx.branch)}`,
    { headers: headers(ctx.token) }
  );
  if (r.status === 404) return [];
  if (!r.ok) throw new Error(`LIST ${dir}: ${r.status}`);
  const j = await r.json();
  if (!Array.isArray(j)) return [];
  return j.filter((e) => e.type === 'file').map((e) => ({ name: e.name, path: e.path, sha: e.sha }));
}
