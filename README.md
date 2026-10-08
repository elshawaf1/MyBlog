# Minimal AI Portfolio + Blog (Next.js static, GitHub Pages)

Stanford-style: About, Research, Publications, Projects, Blog, CV. Admin at `/admin`.

## Edit content
- `content/site.json` — name, bio, links, email
- `content/visibility.json` — `true/false` to show/hide whole sections
- `content/blog/*.md` — `published: false` = draft hidden, `featured: true` = on home
- `content/projects/*.md` — same flags
- `content/publications.json` — `"published": false` to hide
- `public/cv.pdf` — replace with your CV (shown embedded + download)
- `public/photo.jpg` — your photo (shown on home + about)

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
