# Sea Battle (Statki) — Browser Game

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open-blue)](https://kachowska.github.io/sea-battle/)
[![Type](https://img.shields.io/badge/Static-HTML%2FCSS%2FJS-informational)](#)
[![Deploy](https://img.shields.io/badge/GitHub%20Pages-Auto--deploy-success)](#)

A simple, fast **Battleship** game you can play in the browser. No build tools, no dependencies — just open the page and play.

> **Live demo:** https://kachowska.github.io/sea-battle/

---

## 🎮 Gameplay

- Board **10×10**, fleet sizes: **5, 4, 3, 3, 2**.
- **Placement**
  - Drag ships from the palette onto **Your Board**.
  - Click a ship in the palette to **rotate** (H/V) before dragging.
  - Or press **Auto‑place My Ships** to place your fleet instantly.
- **Battle**
  - Click cells on **Enemy Board** to fire.
  - **Hit‑streak**: if you hit, you shoot again (classic rules).
  - When all segments of a ship are hit, it is considered **sunk**.
  - First to sink all 5 ships wins.
- **Save/Resume**
  - Game state is stored in **localStorage**. Use **Save** / **Clear Save** buttons to manage it.

> Tips: You can start playing immediately by auto‑placing ships and firing at the enemy board.

---

## ⌨️ Controls

- **Mouse**: drag & drop for placement, click to fire.
- **Click** a ship in the palette — rotate horizontally/vertically.
- **Buttons** in the top bar: **New Game**, **Auto‑place**, **Save**, **Clear Save**.

---

## 🧠 AI

- Basic “hunt” AI: after a hit, it probes neighboring cells to finish ships.
- AI also gets a **hit‑streak** — it continues shooting after a hit.

---

## 🗂️ Project structure

```
/
├─ index.html       # Page markup & UI skeleton
├─ styles.css       # Minimal styling (responsive)
├─ app.js           # Game logic (board, placement, AI, turns, saving)
└─ .github/workflows/gh-pages.yml  # Auto-deploy (optional)
```

No bundlers. No frameworks. You can open `index.html` directly in a browser.

---

## 🚀 Run locally

**Option 1: open the file**
- Double‑click `index.html`

**Option 2: tiny static server**

```bash
# Python 3
python -m http.server 8000
# open http://localhost:8000
```

---

## 🌐 Deploy

### GitHub Pages — from branch (simplest)
1. Push files to the repository root on branch `main`.
2. **Settings → Pages**: Source = **Deploy from a branch**, Branch = **main**, Folder = **/**.
3. Wait ~30–60s and open: `https://<username>.github.io/<repo>/`.

### GitHub Pages — via Actions (auto on every push)
Use the provided workflow in `.github/workflows/gh-pages.yml` (already included).

---

## 🧩 Troubleshooting

- **404 after enabling Pages** — usually cache/propagation. Refresh in ~1 min. Ensure `index.html` is in the **repo root** (not a subfolder).
- **Actions fail with “Get Pages site failed”** — check **Settings → Pages**:
  - Source: **GitHub Actions**, or switch to **Deploy from a branch**.
  - **Settings → Actions → General**: allow actions; set **Read and write** workflow permissions.
- **Nothing on the screen** — check the browser console for errors and confirm all three files `index.html`, `styles.css`, `app.js` are present.

---

## 🗺️ Roadmap

- Sound effects + subtle animations for hits & splashes.
- Smarter AI with orientation detection + heatmaps.
- Mobile UI polish (bigger tap targets, vibration feedback).

> Want to propose a feature? Open an issue or PR.

---

## 📝 License

MIT — or your preferred license. If you add a different `LICENSE` file, update this section to match.

---

## 🇵🇱 Krótko po polsku

Prosta gra **Statki** w przeglądarce. Wejdź w **Live Demo** i graj — bez instalacji.  
- Rozmieszczanie: przeciągnij, obróć kliknięciem lub użyj **Auto‑place**.  
- Walka: strzelaj w planszę przeciwnika, masz **dodatkowy ruch po trafieniu**.  
- Stan gry zapisuje się w **localStorage**.

Miłej zabawy! 🎯
