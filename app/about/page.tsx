import { site } from '@/config/site';
import ProfilePhoto from '@/components/ProfilePhoto';

export default function About() {
  return (
    <div className="narrow">
      <div style={{ paddingTop: 48 }}>
        <ProfilePhoto src={site.photo} alt={site.name} />
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 42, letterSpacing: -1, margin: '12px 0 8px' }}>
          {site.name}
        </h1>
        <p className="sec-sub" style={{ fontSize: 17 }}>{site.title} — {site.tagline}</p>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.7 }}>{site.bio}</p>
        <div className="btns">
          <a className="btn solid" href={`mailto:${site.email}`}>Follow via email</a>
          <a className="btn" href={site.github}>GitHub</a>
          <a className="btn" href={site.scholar}>Scholar</a>
          <a className="btn" href={site.linkedin}>LinkedIn</a>
        </div>
      </div>
      <h2 className="sec">Contact</h2>
      <ul className="clean">
        <li>Email: <a href={`mailto:${site.email}`}>{site.email}</a></li>
        <li>GitHub: <a href={site.github}>{site.github}</a></li>
        <li>Scholar: <a href={site.scholar}>{site.scholar}</a></li>
        <li>LinkedIn: <a href={site.linkedin}>{site.linkedin}</a></li>
      </ul>
    </div>
  );
}
