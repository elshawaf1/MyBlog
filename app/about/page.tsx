import { site } from '@/config/site';
import ProfilePhoto from '@/components/ProfilePhoto';

export default function About() {
  return (
    <div className="narrow">
      <div className="dossier">
        <div className="kicker">◈ Dossier / researcher</div>
        <ProfilePhoto src={site.photo} alt={site.name} />
        <h1>{site.name}</h1>
        <div className="role">{site.title} — {site.tagline}</div>
        <p className="bio">{site.bio}</p>
        <div className="btns">
          <a className="btn solid" href={`mailto:${site.email}`}>Establish contact</a>
          <a className="btn" href={site.cvPath}>CV ↓</a>
        </div>
        <div className="coords">
          <div><small>EMAIL</small><a href={`mailto:${site.email}`}>{site.email}</a></div>
          <div><small>GITHUB</small><a href={site.github}>{site.github}</a></div>
          <div><small>SCHOLAR</small><a href={site.scholar}>{site.scholar}</a></div>
          <div><small>LINKEDIN</small><a href={site.linkedin}>{site.linkedin}</a></div>
        </div>
      </div>
    </div>
  );
}
