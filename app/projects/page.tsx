import { getProjects } from '@/lib/content';

export default async function Projects() {
  const projects = await getProjects();
  return (
    <>
      <h2>Projects</h2>
      <p><small className="muted">Add a <code>.md</code> file in <code>content/projects/</code>. Set <code>published: false</code> to hide, <code>featured: true</code> for homepage.</small></p>
      {projects.map((p) => (
        <div className="card" key={p.slug}>
          <h3>{p.title}</h3>
          <p><small className="muted">{p.summary}</small></p>
          <div className="meta">{p.stack.join(' · ')}</div>
          <small>
            {p.github && <a href={p.github}>GitHub</a>}
            {p.github && p.demo && ' · '}
            {p.demo && <a href={p.demo}>Demo</a>}
          </small>
          <div dangerouslySetInnerHTML={{ __html: p.contentHtml ?? '' }} />
        </div>
      ))}
    </>
  );
}
