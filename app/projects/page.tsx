import { getProjects } from '@/lib/content';
import ProjectFilter from '@/components/ProjectFilter';

export default async function Projects() {
  const projects = await getProjects();
  return (
    <>
      <h2>Projects</h2>
      <ProjectFilter projects={projects.map((p) => ({
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        stack: p.stack,
        github: p.github,
        demo: p.demo,
        contentHtml: p.contentHtml ?? '',
      }))} />
    </>
  );
}
