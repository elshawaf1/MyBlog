import visJson from '@/content/visibility.json';

// Whole-section toggles. false hides from nav + home.
export const visibility = visJson as {
  research: boolean;
  publications: boolean;
  projects: boolean;
  blog: boolean;
  cv: boolean;
};
