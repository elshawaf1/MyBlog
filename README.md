# Knowledge Vault + Blog — Ahmed Yasser

One platform, two sides: a **private knowledge vault** (notes, links, graph) and a **public blog** (published notes only). Linear/Modern dark design. No backend server, no Supabase — GitHub is the database.

## Architecture

- **`MyBlog` (this repo, public):** Next.js static site on GitHub Pages.
  Private notes never enter this repo.
- **`MyVault` (private repo):** all notes as Markdown files under `notes/<collection>/<slug>.md`.
  Only `status=published + visibility=public` notes are baked into the public build.
- **Publishing = frontmatter.** Setting `status: published` + `visibility: public`
  in the vault editor publishes on next deploy. `unlisted` = exact URL only,
  excluded from lists/feeds/sitemap. Nothing else can leak: public queries
  filter server-side at build, and private files are never checked out publicly.

## Local dev

```bash
npm install
npm run dev        # vault reads content/seed (demo notes)
```

To preview with your real vault: create `.env.local` with
`VAULT_CONTENT_DIR=/path/to/MyVault-clone` (the `notes/` parent).

## Connect the private vault (build-time)

1. Create a classic PAT (`repo` scope) at GitHub → Settings → Developer settings.
2. Add it as Actions secret `VAULT_TOKEN` on this repo.
3. The Pages workflow checks out `elshawaf1/MyVault` into `vault-content/`
   and builds the public blog from it. Without the secret, the build falls
   back to `content/seed` demo notes.

## Vault UI login

Open `/login`, paste the same PAT (stored in browser localStorage only).
The vault reads/writes note files via the GitHub REST API — every save is a commit.

## Privacy model (honest)

- Public repo + Pages = everything here is public by design.
- Vault notes live in the **private** `MyVault` repo (invite-only).
- Unlisted ≠ private: unlisted URLs are unguessable but not access-controlled;
  true privacy = `visibility: private` (never leaves the private repo).
- Never put the PAT/service keys in code; `VAULT_TOKEN` lives in Actions secrets.

## Deploy

Push to `main` → GitHub Actions → `https://elshawaf1.github.io/MyBlog/`.
Backup of the previous site: branch `backup/dark-ai-lab`, tag `v1-dark-lab`.
