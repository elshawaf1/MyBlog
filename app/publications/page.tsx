import { getPublications } from '@/lib/content';

export default function Publications() {
  const pubs = getPublications();
  const years = [...new Set(pubs.map((p) => p.year))].sort((a, b) => b - a);
  return (
    <>
      <h2>Publications</h2>
      <p><small className="muted">Edit <code>content/publications.json</code>. Set <code>"published": false</code> to hide one.</small></p>
      {years.map((y) => (
        <div key={y}>
          <h3>{y}</h3>
          {pubs.filter((p) => p.year === y).map((p) => (
            <div className="card" key={p.title}>
              <strong>{p.title}</strong>
              <div className="meta">{p.authors} · {p.venue}</div>
              <small><a href={p.link}>Link</a>{p.pdf ? <> · <a href={p.pdf}>PDF</a></> : null}</small>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
