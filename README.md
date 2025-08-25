# Sea Battle — Static Demo

A minimal Battleship (Sea Battle) demo ready for GitHub Pages / Netlify / Vercel.

**Features**

- 10×10 board, ships [5,4,3,3,2]
- Optional drag & drop placement (or click “Auto-place My Ships”)
- Turn-based fight with *hit-streak* (you/AI shoot again after a hit)
- Reveal sunk ships (all segments become `hit`)
- Basic “hunt” AI (chases around last hit)
- Score counters, final dialog, and **localStorage** save

## Run locally

Open `index.html` in a browser, or with a tiny static server:

```bash
# Python 3
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages (main branch)

1. Create a new repo (e.g., `Statki`).
2. Add these files to the repo root and push `main`.
3. In repo settings → Pages: **Source: `Deploy from a branch`** → **Branch: `main`** → **Folder: `/ (root)`** → Save.
4. Your site will be available at `https://<username>.github.io/<repo>/`.

### Or deploy with GitHub Actions

Add `.github/workflows/gh-pages.yml`:

```yaml
name: Deploy static site to GitHub Pages
on:
  push:
    branches: [ "main" ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - uses: actions/deploy-pages@v4
```

## Netlify / Vercel

- **Netlify**: drag the folder to the Netlify dashboard → set build to “None”, publish directory “/”.
- **Vercel**: “Add New Project” → import repo → framework “Other” → output directory “/”.

Good luck & have fun!
