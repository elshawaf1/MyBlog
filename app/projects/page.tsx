import { getProjects } from '@/lib/content';
import ProjectFilter from '@/components/ProjectFilter';

export default async function Projects() {
  const projects = await getProjects();
  return (
    <div className="narrow">
      <div className="kicker" style={{ marginTop: 56 }}>03 / Builds</div>
      <h2 className="sec" style={{ marginTop: 0 }}>Things from the bench</h2>
      <p className="sec-sub">Code, demos, and write-ups — filter by stack.</p>
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
