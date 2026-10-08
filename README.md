# Minimal AI Portfolio + Blog (Next.js static, GitHub Pages)

Stanford-style: About, Research, Publications, Projects, Blog, News, CV.

## Edit content
- `config/site.ts` — name, links, email
- `config/visibility.ts` — `true/false` to show/hide whole sections
- `content/blog/*.md` — `published: false` = draft hidden, `featured: true` = on home
- `content/projects/*.md` — same flags
- `content/publications.json`, `content/news.json` — `"published": false` to hide
- `public/cv.pdf` — replace with your CV

## Run
```bash
npm install
npm run dev
npm run build  # outputs to ./out (static)
```

## Deploy to GitHub Pages
1. Push this folder as repo root to GitHub, branch `main`.
2. Repo Settings → Pages → Source: GitHub Actions.
3. Push → site live at `https://<user>.github.io/<repo>/`.
4. Project site needs `basePath`: uncomment `basePath`/`assetPrefix` in `next.config.js`.
   User site (`<user>.github.io`) needs no `basePath`.
