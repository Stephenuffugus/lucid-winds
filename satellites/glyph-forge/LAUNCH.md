# Glyph Forge — Launch Status

**Live URL (after the one step below):** https://stephenuffugus.github.io/glyph_forge/
**Repo:** https://github.com/Stephenuffugus/glyph_forge

---

## ✅ Done (by Claude)

- File structure cleaned — PWA wiring (`manifest.json` / `sw.js`) now resolves.
- **Full depth stack shipped:** two-track engine, 7 Sigils (bless+forbid),
  6 Champions, 36 runes, 48 named fusions, 22 relics, 5 hidden transmutations.
- **Balance is sim-validated & final-tuned.** `node sim-run.js` verdict:
  *"depth systems balanced; determinism holds."* All 7 Sigils inside the
  healthy band (overall 56% optimal-AI → lower for humans), every relic
  +5..+25 pts, none dead/overpowered. The content-pack hot relics (5 at
  +31..+35, one dead at −7) were caught by the sim and re-costed. Details in
  `BALANCE.md`.
- **Synthesised audio shipped** — zero asset files, a tiny Web Audio synth
  (cast/combo/reward/hit/victory/defeat/tap) + mute button, persists, Node-safe.
- **Juice/polish shipped** — damage-pop magnitude tiers + count-up, XMULT
  screen flash/shake, chip-damage HP bar, synergy throb, modal entrance,
  tap-tooltips (fixed a real mobile bug: `title=` is dead on touch), full
  `prefers-reduced-motion` support, 44px tap targets.
- Test + sim harnesses passing every commit. Saves additive-only
  (`glyph-forge-v1` unbroken). Game looks coherent with **zero** art (styled
  glyph placeholders; art hot-loads from `art-slots/` with graceful fallback).
- Monetization funnel built in (single file, doesn't break offline):
  - **Share** button on win/lose — native share on mobile, copy-to-clipboard
    fallback. Works now. This is the viral driver (especially Daily Sigil).
  - `GF_LINKS.itch` one-line config → lights up "pay-what-you-want" CTAs on
    title/victory/defeat. Hidden until set, so it never looks broken.
- `ART_SHOTLIST.md` — 39 prompts + exact filenames, batched so you can launch
  before all art is done.
- `tools/make-icons.mjs` — auto-generates PWA icons from `title-mark.png`.
- `tools/deploy.sh` — one-command redeploy.
- Pushed to GitHub. Pages serves from `main` branch root (`.nojekyll` set).

---

## 🟢 GOING LIVE — two paths, pick either (or both)

The game is pure static files, so any web host works.

**Path A — Hostinger (your domain, survives codespace being closed):**
1. `bash tools/pack.sh` → produces `glyph-forge-hostinger.zip` + `dist/`.
2. Follow `tools/HOSTINGER-UPLOAD.md` (hPanel File Manager → upload to
   `public_html`, enable free SSL). ~5 min. This is the test-play + launch
   URL that does **not** depend on the codespace being awake.

**Path B — GitHub Pages (auto-redeploys on every push, ~20s one-time):**
1. Open: **https://github.com/Stephenuffugus/glyph_forge/settings/pages**
2. **Build and deployment → Source** → **Deploy from a branch**.
3. Branch **`main`**, folder **`/ (root)`** → **Save**.
4. ~1 min later: **https://stephenuffugus.github.io/glyph_forge/**
   After this, every `git push` (or `bash tools/deploy.sh`) auto-rebuilds it.

Either one is "the launch." A new build = re-upload `index.html` (Hostinger)
or `git push` (Pages).

---

## 💰 Make money (do right after it's live)

1. Create a free itch.io account → new project. Use **`ITCH_STORE_COPY.md`**
   (every field is filled in, copy-paste).
2. Pricing: **pay-what-you-want, suggested $4** (lets the market price it).
3. Copy your itch URL into `GF_LINKS.itch` in `index.html`, run
   `bash tools/deploy.sh "wire itch"`. The CTAs go live everywhere.
4. Post the **Daily Sigil** to social — that loop + the Share button is the
   free funnel that drives itch traffic.

---

## 🎨 Art (you, in parallel — does NOT block launch)

Work `ART_SHOTLIST.md` top-down. After **Batch A (14 images)** the whole first
act + store hero art is illustrated. Drop PNGs in `art-slots/`, run
`bash tools/deploy.sh`, refresh. When `title-mark.png` exists, tell Claude →
`npm i sharp && node tools/make-icons.mjs` generates the app icons.

---

## 🧪 Playtest sandbox (for tuning balance/abilities)

Hidden, never shown to real players (gated to localhost / `*.app.github.dev`,
or `localStorage.gfDev='1'`). On your dev URL:

- Press **` (backtick)** or tap the **⚙ dev** badge (bottom-left) to open.
- Jump to any encounter (auto-sets fluency to match — important, fluency
  drives late-game balance), Full HP / set HP / set fluency, set enemy HP,
  "Defeat enemy →" (runs the real reward flow), add any rune to hand,
  reveal/wipe codex, and a **live damage-math breakdown** that decomposes
  every spell: per-rune `(base+add)×mult×repeats`, synergy/shape/fluency
  multipliers, final. Use it to find broken combos and tune `BALANCE.md`.

It's inert in the public build, so it ships safely as-is.

## v1.1 backlog (after money starts)

- ~~SFX~~ ✅ **shipped** — synthesised Web Audio, no asset files.
- Art batches (see `ART_SHOTLIST.md`) — drop PNGs in `art-slots/`, re-pack
  or push. Does not block launch; hot-loads with graceful fallback.
- Firebase daily leaderboard (Daily Sigil already deterministic).
- Boss phase-2 mechanic (Sovereign currently just tanky).
- Sigil-spread tightening: post content-pack the band is 37% (umbra) ↔ 67%
  (void) optimal-AI — inside the sim's pass band, but a future pass could
  ease umbra's mix condition / soften order's seal. Not a blocker.
- Optional: freemium gate (free Tier 1, paid full run) once you've played enough
  to know where the gate should sit. Higher revenue ceiling than PWYW.

> **Launch-day checklist** lives in `SOCIAL.md` (alongside the X thread,
> Reddit posts, and Daily Sigil hooks). Marketing copy: `ITCH_STORE_COPY.md`,
> story/devlog: `DEVLOG.md`.
