'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  GhCtx,
  b64FromBytes,
  deleteFile,
  getFile,
  ghTest,
  listDir,
  putBinary,
  putFile,
} from '@/lib/admin/github';
import { parseMd, stringifyMd } from '@/lib/admin/frontmatter';
import type { FM } from '@/lib/admin/frontmatter';

type Tab = 'posts' | 'projects' | 'pubs' | 'site' | 'files';

type MdItem = { name: string; path: string; sha: string; data: FM; body: string };

type Pub = {
  title: string;
  venue: string;
  year: number;
  authors: string;
  link: string;
  pdf: string;
  published: boolean;
};

const POST_ORDER = ['title', 'date', 'tags', 'summary', 'published', 'featured'];
const PROJ_ORDER = ['title', 'summary', 'stack', 'github', 'demo', 'published', 'featured'];

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 14,
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  background: 'var(--card-bg)',
  color: 'var(--text)',
  marginTop: 4,
};

export default function Admin() {
  const [ctx, setCtx] = useState<GhCtx>({ owner: 'elshawaf1', repo: 'MyBlog', branch: 'main', token: '' });
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState<Tab>('posts');
  const [msg, setMsg] = useState('');
  const [commitUrl, setCommitUrl] = useState('');
  const [busy, setBusy] = useState(false);

  // posts / projects
  const [posts, setPosts] = useState<MdItem[]>([]);
  const [projs, setProjs] = useState<MdItem[]>([]);
  const [sel, setSel] = useState<number>(0);
  const [newSlug, setNewSlug] = useState('');

  // pubs
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [pubsSha, setPubsSha] = useState<string | undefined>(undefined);

  // site
  const [siteJson, setSiteJson] = useState<Record<string, string>>({});
  const [siteSha, setSiteSha] = useState<string | undefined>(undefined);
  const [vis, setVis] = useState<Record<string, boolean>>({});
  const [visSha, setVisSha] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('blog-admin-ctx');
      if (raw) {
        const c = JSON.parse(raw);
        setCtx((p) => ({ ...p, ...c }));
        if (c.token) setConnected(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const say = (m: string, url = '') => {
    setMsg(m);
    setCommitUrl(url);
  };

  const saveCtx = () => {
    localStorage.setItem('blog-admin-ctx', JSON.stringify(ctx));
    say('Settings saved in this browser.');
  };

  const test = async () => {
    setBusy(true);
    try {
      const r = await ghTest(ctx);
      setConnected(r.ok);
      say(r.ok ? `Connected to ${ctx.owner}/${ctx.repo}.` : `Failed: ${r.msg}`);
      if (r.ok) saveCtx();
    } catch (e) {
      say(`Failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    const cleared = { ...ctx, token: '' };
    setCtx(cleared);
    localStorage.setItem('blog-admin-ctx', JSON.stringify(cleared));
    setConnected(false);
    say('Logged out (token cleared).');
  };

  const loadMdDir = useCallback(
    async (dir: string): Promise<MdItem[]> => {
      const entries = (await listDir(ctx, dir)).filter((e) => e.name.endsWith('.md'));
      const out: MdItem[] = [];
      for (const e of entries) {
        const f = await getFile(ctx, e.path);
        if (!f) continue;
        const { data, body } = parseMd(f.text);
        out.push({ name: e.name, path: e.path, sha: f.sha, data, body });
      }
      return out.sort((a, b) => (a.name > b.name ? 1 : -1));
    },
    [ctx]
  );

  const loadPosts = useCallback(async () => {
    setBusy(true);
    try {
      setPosts(await loadMdDir('content/blog'));
      setSel(0);
      say('Posts loaded.');
    } catch (e) {
      say(`Load failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }, [loadMdDir]);

  const loadProjs = useCallback(async () => {
    setBusy(true);
    try {
      setProjs(await loadMdDir('content/projects'));
      setSel(0);
      say('Projects loaded.');
    } catch (e) {
      say(`Load failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }, [loadMdDir]);

  const loadPubs = useCallback(async () => {
    setBusy(true);
    try {
      const f = await getFile(ctx, 'content/publications.json');
      if (f) {
        setPubs(JSON.parse(f.text) as Pub[]);
        setPubsSha(f.sha);
      } else {
        setPubs([]);
        setPubsSha(undefined);
      }
      say('Publications loaded.');
    } catch (e) {
      say(`Load failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }, [ctx]);

  const loadSite = useCallback(async () => {
    setBusy(true);
    try {
      const s = await getFile(ctx, 'content/site.json');
      if (s) {
        setSiteJson(JSON.parse(s.text) as Record<string, string>);
        setSiteSha(s.sha);
      }
      const v = await getFile(ctx, 'content/visibility.json');
      if (v) {
        setVis(JSON.parse(v.text) as Record<string, boolean>);
        setVisSha(v.sha);
      }
      say('Site settings loaded.');
    } catch (e) {
      say(`Load failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }, [ctx]);

  useEffect(() => {
    if (!connected) return;
    if (tab === 'posts' && posts.length === 0) void loadPosts();
    if (tab === 'projects' && projs.length === 0) void loadProjs();
    if (tab === 'pubs' && pubs.length === 0) void loadPubs();
    if (tab === 'site' && Object.keys(siteJson).length === 0) void loadSite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, connected]);

  // ---- md item helpers ----
  const refreshMd = async (
    dir: string,
    items: MdItem[],
    setItems: (x: MdItem[]) => void,
    i: number,
    data: FM,
    body: string,
    verb: string
  ) => {
    const it = items[i];
    setBusy(true);
    try {
      const order = dir === 'content/blog' ? POST_ORDER : PROJ_ORDER;
      const url = await putFile(ctx, it.path, stringifyMd(data, body, order), it.sha, `${verb} ${it.name} via admin`);
      const f = await getFile(ctx, it.path);
      const next = [...items];
      next[i] = { ...it, sha: f?.sha ?? it.sha, data, body };
      setItems(next);
      say(`Saved ${it.name}. Redeploy runs automatically (~1 min).`, url);
    } catch (e) {
      say(`Save failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const createMd = async (dir: string, slug: string, isPost: boolean) => {
    const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    if (!clean) {
      say('Enter a slug first.');
      return;
    }
    setBusy(true);
    try {
      const path = `${dir}/${clean}.md`;
      const data: FM = isPost
        ? { title: clean, date: new Date().toISOString().slice(0, 10), tags: [], summary: '', published: false, featured: false }
        : { title: clean, summary: '', stack: [], github: '', demo: '', published: false, featured: false };
      const url = await putFile(
        ctx,
        path,
        stringifyMd(data, 'Write here.', isPost ? POST_ORDER : PROJ_ORDER),
        undefined,
        `New ${clean} via admin`
      );
      say(`Created ${path}.`, url);
      setNewSlug('');
      if (isPost) await loadPosts();
      else await loadProjs();
    } catch (e) {
      say(`Create failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const removeMd = async (dir: string, items: MdItem[], i: number) => {
    const it = items[i];
    if (!confirm(`Delete ${it.name}?`)) return;
    setBusy(true);
    try {
      await deleteFile(ctx, it.path, it.sha, `Delete ${it.name} via admin`);
      say(`Deleted ${it.name}.`);
      if (dir === 'content/blog') await loadPosts();
      else await loadProjs();
    } catch (e) {
      say(`Delete failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  // ---- pubs ----
  const savePubs = async () => {
    setBusy(true);
    try {
      const url = await putFile(ctx, 'content/publications.json', JSON.stringify(pubs, null, 2) + '\n', pubsSha, 'Update publications via admin');
      const f = await getFile(ctx, 'content/publications.json');
      setPubsSha(f?.sha);
      say(`Saved publications (${pubs.length}). Redeploy runs automatically.`, url);
    } catch (e) {
      say(`Save failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  // ---- site ----
  const saveSite = async () => {
    setBusy(true);
    try {
      const u1 = await putFile(ctx, 'content/site.json', JSON.stringify(siteJson, null, 2) + '\n', siteSha, 'Update site.json via admin');
      const s = await getFile(ctx, 'content/site.json');
      setSiteSha(s?.sha);
      say('Saved site.json.', u1);
    } catch (e) {
      say(`Save failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const saveVis = async () => {
    setBusy(true);
    try {
      const u = await putFile(ctx, 'content/visibility.json', JSON.stringify(vis, null, 2) + '\n', visSha, 'Update visibility via admin');
      const v = await getFile(ctx, 'content/visibility.json');
      setVisSha(v?.sha);
      say('Saved visibility. Hidden sections disappear after redeploy (~1 min).', u);
    } catch (e) {
      say(`Save failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  // ---- files ----
  const uploadPhoto = async (file: File) => {
    setBusy(true);
    try {
      const img = await createImageBitmap(file);
      const max = 1200;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const g = canvas.getContext('2d');
      if (!g) throw new Error('Canvas unavailable');
      g.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
      if (!blob) throw new Error('Resize failed');
      const buf = await blob.arrayBuffer();
      const cur = await getFile(ctx, 'public/photo.jpg');
      const url = await putBinary(ctx, 'public/photo.jpg', b64FromBytes(buf), cur?.sha, 'Update photo via admin');
      say(`Photo uploaded (${Math.round(buf.byteLength / 1024)} KB).`, url);
    } catch (e) {
      say(`Upload failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const uploadCv = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      say('CV is over 15 MB — please use a smaller PDF.');
      return;
    }
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const cur = await getFile(ctx, 'public/cv.pdf');
      const url = await putBinary(ctx, 'public/cv.pdf', b64FromBytes(buf), cur?.sha, 'Update CV via admin');
      say(`CV uploaded (${Math.round(buf.byteLength / 1024)} KB).`, url);
    } catch (e) {
      say(`Upload failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const items = tab === 'posts' ? posts : projs;
  const setItems = tab === 'posts' ? setPosts : setProjs;
  const dir = tab === 'posts' ? 'content/blog' : 'content/projects';
  const cur = items[sel];

  const setField = (k: string, v: unknown) => {
    if (!cur) return;
    const next = [...items];
    next[sel] = { ...cur, data: { ...cur.data, [k]: v } };
    setItems(next);
  };

  return (
    <>
      <h2>Admin</h2>
      <p><small className="muted">Manage the whole site. Saves commit to GitHub → redeploy ~1 min. Token stays in this browser only.</small></p>

      <div className="card">
        <h3>Connection</h3>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
          <label><small className="muted">Owner</small><input style={inputStyle} value={ctx.owner} onChange={(e) => setCtx({ ...ctx, owner: e.target.value })} /></label>
          <label><small className="muted">Repo</small><input style={inputStyle} value={ctx.repo} onChange={(e) => setCtx({ ...ctx, repo: e.target.value })} /></label>
          <label><small className="muted">Branch</small><input style={inputStyle} value={ctx.branch} onChange={(e) => setCtx({ ...ctx, branch: e.target.value })} /></label>
          <label><small className="muted">Token (PAT, contents:write)</small><input style={inputStyle} type="password" value={ctx.token} onChange={(e) => setCtx({ ...ctx, token: e.target.value })} placeholder="ghp_… / github_pat_…" /></label>
        </div>
        <div className="btns">
          <button className="btn solid" onClick={test} disabled={busy || !ctx.token}>Connect + save</button>
          <button className="btn" onClick={saveCtx}>Save settings</button>
          <button className="btn" onClick={logout}>Log out</button>
          <a className="btn" href="https://github.com/settings/tokens" target="_blank" rel="noopener">Get token</a>
        </div>
        <p><small className="muted">Status: {connected ? 'connected' : 'not connected'}</small></p>
      </div>

      {msg && (
        <div className="card">
          <small>{msg} {commitUrl && <><a href={commitUrl} target="_blank" rel="noopener">View commit</a></>}</small>
        </div>
      )}

      {!connected ? (
        <p><small className="muted">Paste a token and connect to manage content. Create one at GitHub → Settings → Developer settings → Personal access tokens (classic, <code>repo</code> scope; or fine-grained: contents read+write on {ctx.owner}/{ctx.repo}).</small></p>
      ) : (
        <>
          <div className="filter-bar">
            {(['posts', 'projects', 'pubs', 'site', 'files'] as Tab[]).map((t) => (
              <button key={t} className={`tag-chip${tab === t ? ' active' : ''}`} onClick={() => { setTab(t); setSel(0); }}>{t}</button>
            ))}
            <span style={{ marginLeft: 'auto' }}><small className="muted">{busy ? 'working…' : ''}</small></span>
          </div>

          {(tab === 'posts' || tab === 'projects') && (
            <>
              <div className="btns">
                <button className="btn" onClick={() => (tab === 'posts' ? loadPosts() : loadProjs())} disabled={busy}>Reload</button>
                <input
                  style={{ ...inputStyle, maxWidth: 220 }}
                  placeholder="new-slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                />
                <button className="btn" onClick={() => createMd(dir, newSlug, tab === 'posts')} disabled={busy}>+ New</button>
              </div>
              {items.length === 0 && <p><small className="muted">Nothing loaded yet — press Reload.</small></p>}
              {items.length > 0 && (
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '220px 1fr', marginTop: 12 }}>
                  <div>
                    {items.map((it, i) => (
                      <div key={it.path} className="card" style={i === sel ? { borderColor: 'var(--accent)' } : undefined}>
                        <button className="tag-chip" onClick={() => setSel(i)} style={{ marginBottom: 6 }}>{it.name}</button>
                        <div><small className="muted">{it.data.published === false ? 'hidden draft' : 'visible'}{it.data.featured === true ? ' · featured' : ''}</small></div>
                      </div>
                    ))}
                  </div>
                  {cur && (
                    <div className="card">
                      <h3>{cur.name}</h3>
                      {Object.keys(cur.data).filter((k) => typeof cur.data[k] === 'boolean').map((k) => (
                        <label key={k} style={{ display: 'block', marginTop: 6 }}>
                          <input type="checkbox" checked={cur.data[k] === true} onChange={(e) => setField(k, e.target.checked)} /> <small>{k}</small>
                        </label>
                      ))}
                      {tab === 'posts' && (
                        <>
                          <label><small className="muted">title</small><input style={inputStyle} value={String(cur.data.title ?? '')} onChange={(e) => setField('title', e.target.value)} /></label>
                          <label><small className="muted">date</small><input style={inputStyle} value={String(cur.data.date ?? '')} onChange={(e) => setField('date', e.target.value)} /></label>
                          <label><small className="muted">tags (comma)</small><input style={inputStyle} value={(cur.data.tags as string[] ?? []).join(', ')} onChange={(e) => setField('tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} /></label>
                          <label><small className="muted">summary</small><input style={inputStyle} value={String(cur.data.summary ?? '')} onChange={(e) => setField('summary', e.target.value)} /></label>
                        </>
                      )}
                      {tab === 'projects' && (
                        <>
                          <label><small className="muted">title</small><input style={inputStyle} value={String(cur.data.title ?? '')} onChange={(e) => setField('title', e.target.value)} /></label>
                          <label><small className="muted">summary</small><input style={inputStyle} value={String(cur.data.summary ?? '')} onChange={(e) => setField('summary', e.target.value)} /></label>
                          <label><small className="muted">stack (comma)</small><input style={inputStyle} value={(cur.data.stack as string[] ?? []).join(', ')} onChange={(e) => setField('stack', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} /></label>
                          <label><small className="muted">github</small><input style={inputStyle} value={String(cur.data.github ?? '')} onChange={(e) => setField('github', e.target.value)} /></label>
                          <label><small className="muted">demo</small><input style={inputStyle} value={String(cur.data.demo ?? '')} onChange={(e) => setField('demo', e.target.value)} /></label>
                        </>
                      )}
                      <label><small className="muted">body (markdown)</small><textarea style={{ ...inputStyle, minHeight: 180, fontFamily: 'monospace' }} value={cur.body} onChange={(e) => { const next = [...items]; next[sel] = { ...cur, body: e.target.value }; setItems(next); }} /></label>
                      <div className="btns">
                        <button className="btn solid" onClick={() => refreshMd(dir, items, setItems, sel, cur.data, cur.body, 'Update')} disabled={busy}>Save</button>
                        <button className="btn" onClick={() => removeMd(dir, items, sel)} disabled={busy}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {tab === 'pubs' && (
            <>
              <div className="btns">
                <button className="btn" onClick={loadPubs} disabled={busy}>Reload</button>
                <button className="btn" onClick={() => setPubs([{ title: 'New paper', venue: 'arXiv', year: new Date().getFullYear(), authors: '', link: '', pdf: '', published: true }, ...pubs])}>+ Add paper</button>
                <button className="btn solid" onClick={savePubs} disabled={busy}>Save all</button>
              </div>
              {pubs.map((p, i) => (
                <div className="card" key={i}>
                  <label><small className="muted">title</small><input style={inputStyle} value={p.title} onChange={(e) => { const n = [...pubs]; n[i] = { ...p, title: e.target.value }; setPubs(n); }} /></label>
                  <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 120px' }}>
                    <label><small className="muted">venue</small><input style={inputStyle} value={p.venue} onChange={(e) => { const n = [...pubs]; n[i] = { ...p, venue: e.target.value }; setPubs(n); }} /></label>
                    <label><small className="muted">year</small><input style={inputStyle} type="number" value={p.year} onChange={(e) => { const n = [...pubs]; n[i] = { ...p, year: Number(e.target.value) }; setPubs(n); }} /></label>
                  </div>
                  <label><small className="muted">authors</small><input style={inputStyle} value={p.authors} onChange={(e) => { const n = [...pubs]; n[i] = { ...p, authors: e.target.value }; setPubs(n); }} /></label>
                  <label><small className="muted">link</small><input style={inputStyle} value={p.link} onChange={(e) => { const n = [...pubs]; n[i] = { ...p, link: e.target.value }; setPubs(n); }} /></label>
                  <label><small className="muted">pdf</small><input style={inputStyle} value={p.pdf} onChange={(e) => { const n = [...pubs]; n[i] = { ...p, pdf: e.target.value }; setPubs(n); }} /></label>
                  <div className="btns">
                    <label><input type="checkbox" checked={p.published !== false} onChange={(e) => { const n = [...pubs]; n[i] = { ...p, published: e.target.checked }; setPubs(n); }} /> <small>published</small></label>
                    <button className="btn" onClick={() => { if (confirm('Remove this paper?')) setPubs(pubs.filter((_, j) => j !== i)); }}>Remove</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'site' && (
            <>
              <div className="btns">
                <button className="btn" onClick={loadSite} disabled={busy}>Reload</button>
                <button className="btn solid" onClick={saveSite} disabled={busy}>Save profile</button>
                <button className="btn solid" onClick={saveVis} disabled={busy}>Save sections</button>
              </div>
              <div className="card">
                <h3>Profile (site.json)</h3>
                {Object.keys(siteJson).map((k) => (
                  <label key={k}><small className="muted">{k}</small><input style={inputStyle} value={siteJson[k] ?? ''} onChange={(e) => setSiteJson({ ...siteJson, [k]: e.target.value })} /></label>
                ))}
              </div>
              <div className="card">
                <h3>Sections (visibility.json)</h3>
                {Object.keys(vis).map((k) => (
                  <label key={k} style={{ display: 'block', marginTop: 6 }}>
                    <input type="checkbox" checked={vis[k] === true} onChange={(e) => setVis({ ...vis, [k]: e.target.checked })} /> <small>{k} (show section)</small>
                  </label>
                ))}
              </div>
            </>
          )}

          {tab === 'files' && (
            <>
              <div className="card">
                <h3>Photo → public/photo.jpg</h3>
                <p><small className="muted">JPG auto-resized to ≤1200px in browser before upload.</small></p>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadPhoto(f); }} />
              </div>
              <div className="card">
                <h3>CV → public/cv.pdf</h3>
                <p><small className="muted">PDF up to 15 MB. Shown embedded on /cv + download.</small></p>
                <input type="file" accept="application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadCv(f); }} />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
