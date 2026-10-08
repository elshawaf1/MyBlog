import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const root = process.cwd();

export type Post = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  published: boolean;
  featured: boolean;
  contentHtml?: string;
};

function readDir(dir: string): string[] {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith('.md'));
}

async function mdToHtml(md: string): Promise<string> {
  const out = await remark().use(html).process(md);
  return out.toString();
}

export async function getPosts(): Promise<Post[]> {
  const files = readDir('content/blog');
  const posts: Post[] = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(root, 'content/blog', f), 'utf8');
    const { data, content } = matter(raw);
    posts.push({
      slug: f.replace(/\.md$/, ''),
      title: data.title ?? f,
      date: data.date ?? '',
      tags: data.tags ?? [],
      summary: data.summary ?? '',
      published: data.published !== false,
      featured: data.featured === true,
      contentHtml: await mdToHtml(content),
    });
  }
  return posts
    .filter((p) => p.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export type Project = {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  github: string;
  demo: string;
  published: boolean;
  featured: boolean;
  contentHtml?: string;
};

export async function getProjects(): Promise<Project[]> {
  const files = readDir('content/projects');
  const out: Project[] = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(root, 'content/projects', f), 'utf8');
    const { data, content } = matter(raw);
    out.push({
      slug: f.replace(/\.md$/, ''),
      title: data.title ?? f,
      summary: data.summary ?? '',
      stack: data.stack ?? [],
      github: data.github ?? '',
      demo: data.demo ?? '',
      published: data.published !== false,
      featured: data.featured === true,
      contentHtml: await mdToHtml(content),
    });
  }
  return out.filter((p) => p.published);
}

export type Publication = {
  title: string;
  venue: string;
  year: number;
  authors: string;
  link: string;
  pdf: string;
  published: boolean;
};

export function getPublications(): Publication[] {
  const f = path.join(root, 'content/publications.json');
  if (!fs.existsSync(f)) return [];
  const arr = JSON.parse(fs.readFileSync(f, 'utf8'));
  return arr.filter((p: Publication) => p.published !== false);
}
