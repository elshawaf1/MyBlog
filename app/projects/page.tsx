import { getProjects } from '@/lib/content';
import ProjectFilter from '@/components/ProjectFilter';

export default async function Projects() {
  const projects = await getProjects();
  return (
    <div className="narrow">
      <div className="kicker" style={{ marginTop: 40 }}>Portfolio</div>
      <h2 className="sec" style={{ marginTop: 0 }}>Projects</h2>
      <p className="sec-sub">Things I built — code, demos, and write-ups.</p>
      <ProjectFilter projects={projects.map((p) => ({
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        stack: p.stack,
        github: p.github,
        demo: p.demo,
        contentHtml: p.contentHtml ?? '',
      }))} />
    </div>
  );
}
