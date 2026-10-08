const AREAS = [
  { code: 'R-01', title: 'Large Language Models', desc: 'What problem, what approach, what result. Link to papers and builds.' },
  { code: 'R-02', title: 'Vision / Multimodal', desc: 'Replace with your real areas. Keep 2–4 areas max.' },
];

export default function Research() {
  return (
    <div className="narrow">
      <div className="kicker" style={{ marginTop: 56 }}>02 / Laboratory</div>
      <h2 className="sec" style={{ marginTop: 0 }}>Research benches</h2>
      <p className="sec-sub">Active fronts — each bench feeds papers and builds.</p>
      {AREAS.map((a) => (
        <div className="card" key={a.code}>
          <div className="meta" style={{ color: 'var(--accent)' }}>◈ {a.code}</div>
          <h3>{a.title}</h3>
          <p><small className="muted">{a.desc}</small></p>
        </div>
      ))}
    </div>
  );
}
