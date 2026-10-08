import { site } from '@/config/site';
import ProfilePhoto from '@/components/ProfilePhoto';

export default function About() {
  return (
    <>
      <h2>About</h2>
      <ProfilePhoto src={site.photo} alt={site.name} />
      <p><strong>{site.name}</strong> — {site.title}, {site.tagline}.</p>
      <p>{site.bio}</p>
      <h2>Contacts</h2>
      <ul className="clean">
        <li>Email: <a href={`mailto:${site.email}`}>{site.email}</a></li>
        <li>GitHub: <a href={site.github}>{site.github}</a></li>
        <li>Scholar: <a href={site.scholar}>{site.scholar}</a></li>
        <li>LinkedIn: <a href={site.linkedin}>{site.linkedin}</a></li>
      </ul>
      <h2>Edit me</h2>
      <p><small className="muted">Edit bio + links in <code>content/site.json</code> (or via <a href="/admin">/admin</a>).</small></p>
    </>
  );
}
