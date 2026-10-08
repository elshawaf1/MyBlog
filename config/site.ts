import siteJson from '@/content/site.json';

export const site = siteJson as {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  github: string;
  scholar: string;
  linkedin: string;
  cvPath: string;
  photo: string;
};

export type Site = typeof site;
