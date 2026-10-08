import { site } from '@/config/site';

export default function About() {
  return (
    <>
      <h2>About</h2>
      <img className="profile" src={site.photo} alt={site.name} style={{ marginBottom: 12 }} />
      <p><strong>{site.name}</strong> — {site.title}, {site.tagline}.</p>
      <p>
        Replace this with your bio: background, current role, research interests,
        industry contributions. Keep it 3–5 sentences like Stanford faculty pages.
      </p>
      <h2>Contacts</h2>
      <ul className="clean">
        <li>Email: <a href={`mailto:${site.email}`}>{site.email}</a></li>
        <li>GitHub: <a href={site.github}>{site.github}</a></li>
        <li>Scholar: <a href={site.scholar}>{site.scholar}</a></li>
        <li>LinkedIn: <a href={site.linkedin}>{site.linkedin}</a></li>
      </ul>
      <h2>Edit me</h2>
      <p><small className="muted">Edit <code>config/site.ts</code> for name/links. Edit this file <code>app/about/page.tsx</code> for bio.</small></p>
    </>
  );
}
