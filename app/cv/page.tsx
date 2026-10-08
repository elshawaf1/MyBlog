import fs from 'fs';
import path from 'path';
import { site } from '@/config/site';

export default function CV() {
  const exists = fs.existsSync(path.join(process.cwd(), 'public/cv.pdf'));

  return (
    <div className="narrow">
      <div className="kicker" style={{ marginTop: 40 }}>Résumé</div>
      <h2 className="sec" style={{ marginTop: 0 }}>CV</h2>
      <p>
        <a className="btn solid" href={site.cvPath} download>Download CV (PDF)</a>{' '}
        <a className="btn" href={site.cvPath} target="_blank" rel="noopener">Open in new tab</a>
      </p>
      {!exists && (
        <p>
          <small className="muted">
            No <code>public/cv.pdf</code> found yet — upload your CV to show it here.
          </small>
        </p>
      )}
      <iframe
        src={site.cvPath}
        title="Ahmed Yasser — CV"
        style={{ width: '100%', height: '75vh', border: '1px solid var(--border)', borderRadius: 10, marginTop: 12, background: 'var(--card-bg)' }}
      />
      <p>
        <small className="muted">
          If the preview doesn't load, use Download / Open in new tab.
        </small>
      </p>
    </div>
  );
}
