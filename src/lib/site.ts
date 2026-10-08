import fs from 'fs';
import path from 'path';

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  email: string;
  github: string;
  scholar: string;
  linkedin: string;
}

const DEFAULTS: Profile = {
  name: 'Ahmed Yasser',
  role: 'AI Researcher',
  tagline: 'Notes on AI, algorithms, and building in public.',
  bio: 'I keep a personal knowledge vault of everything I learn — AI research, algorithms, and engineering notes. The polished pieces get published here.',
  email: 'you@example.com',
  github: 'https://github.com/elshawaf1',
  scholar: 'https://scholar.google.com',
  linkedin: 'https://linkedin.com/in/yourname',
};

export function getProfile(): Profile {
  try {
    const f = path.join(process.cwd(), 'content', 'profile.json');
    if (fs.existsSync(f)) return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(f, 'utf8')) };
  } catch {
    /* fall through */
  }
  return DEFAULTS;
}
