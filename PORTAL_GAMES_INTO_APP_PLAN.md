# PLAN — Bring portal-only external games into the main Lucid Winds GAME tab

> **Status:** ✅ BUILT 2026-06-18 (LW_VERSION `2026.06.18.01`) — awaiting Stephen's device test.
> Stephen's Q-answers: copy-paste template · first batch = Glyph Forge + Sweet Spot + Tarot Run
> (HUNCH/Brawl deferred) · dedicated `studio` / SKY WOLF STUDIOS 🐺 category (Director left it open;
> Claude recommended a dedicated section because ext games are network/iframe/Pi-hidden — `cat` is a
> one-word field so any game can be reassigned to an existing category later).
> **Author:** Claude Code · **Date:** 2026-06-17 (built 2026-06-18) · **Branch:** main
> **Goal (Stephen, verbatim):** "make the games that are only in the portal also in the
> main lucid winds games section too" + "have a simple way for me to do it" so he can add
> future games himself (he makes the thumbnails) without me hand-integrating each one.

---

## 1. The finding — there are TWO game-integration models

| Model | Where the code lives | How it mounts | Earns via | In main GAME tab? |
|---|---|---|---|---|
| **In-app modular** | this repo `/games/<id>.js` (or inline in `index.html`) | `window._gameFns[id](mountEl)` into `#fg-ag` | `_e()` / `_aw[id]` | ✅ yes (all 67) |
| **Partner / Sunbeam-SDK** | **its own codespace / origin** (github.io, vercel) | it's a separate web page; portal shows a **card that links out** | `Sunbeam` SDK → shared Firebase wallet | ❌ no |

The "games only in the portal" Stephen means are the **second kind** — the featured external
games in `portal/index.html:169-190`:

| Name | Origin (own codespace) | Notes |
|---|---|---|
| Glyph Forge | `https://stephenuffugus.github.io/glyph_forge/` | |
| Sweet Spot | `https://stephenuffugus.github.io/Sweet-Spot/` | |
| Tarot Run | `https://stephenuffugus.github.io/Tarot_Run/` | |
| Brawl | `https://stephenuffugus.github.io/BarBrawl/` | marked `soon:true` |
| HUNCH | `https://hunch-mauve.vercel.app` | marked `premium:true` |
| Shell Shuffle | `/satellites/shell-shuffle/` | in-repo satellite (not external) |
| Hue Match | `/satellites/hues/` | in-repo satellite (not external) |

These are NOT in the main app because the app mounts game files **in-process** and these are
**separate web apps on other origins**. (Confirmed first: all 67 portal `/play/` games and the
67 `G[]` registry games already match 1:1 — the main app even has one extra, `dewtrail`. So the
gap is exactly these external featured games, nothing else.)

---

## 2. Recommended approach — embed via an `ext` field (iframe)

Porting each external game into the `_G` single-file ES5 module contract is impractical
(HUNCH is a Vercel app, not a copy-paste). The realistic bridge is to **embed** the external
game in the GAME tab via an `<iframe>`, since these games already load the Sunbeam SDK and
earn into the **same** Firebase wallet (`focus-grove-fffa8`).

**Framing verified 2026-06-17** — none of the four live origins send `X-Frame-Options` or a
framing CSP (all return `200`, embeddable). GitHub Pages and that Vercel app do not block
framing, and won't for future github.io/vercel games either.

### The per-game "simple way" (what Stephen edits — ONE line + ONE thumbnail)

Add one entry to the `G[]` array (`index.html:~62513`):

```js
{id:'glyphforge', n:'Glyph Forge', i:'⚒️', cat:'studio',
 r:'Forge glyphs, hunt combos, break everything.',
 ext:'https://stephenuffugus.github.io/glyph_forge/',
 thumb:'assets/games/thumbs/glyphforge.png'}
```

…then drop the thumbnail PNG at the `thumb:` path. That's it. No code, no me.
(Thumbnails can reuse the ones that already exist at `/portal-assets/thumbs/glyph-forge.png` etc.)

### The one-time engine changes (≈4 small edits — I do these once)

1. **New category** in `G_CATS` (`index.html:62505`): `{key:'studio', label:'SKY WOLF STUDIOS', icon:'🐺'}`
   so external games group together in the picker. (Picker auto-renders categories from
   `G_CATS.forEach` at `index.html:63752`; `count=G.filter(g.cat===cat.key)` — no other change needed there.)
2. **`_sg(id)` mount branch** (`index.html:63928`): after the back/RULES header is built and
   before the `_gameFns[id]` lookup (~`index.html:64010`), check `gi.ext`. If present:
   inject `<iframe src=gi.ext loading="lazy" allow="fullscreen; autoplay; accelerometer; gyroscope"
   style="width:100%;height:calc(100vh - <header>);border:0;">` into `ag`, and **return early**
   (skip `_gameFns`, `_aw`, `_e` lifecycle). Keep the `gi.r` blurb row.
3. **Re-sync on exit** so sunbeams earned inside the iframe appear in the app header: when
   leaving an `ext` game (in `_xt()` / the back button / `_cp()`), call the existing wallet
   sync (`syncVaultToCloud` / whatever refreshes `hashLedger`-backed balance). Without this
   there's a refresh lag because iframe earnings go through `earnHashes`→`hashLedger`, not local `_e()`.
4. **Hide external games inside Pi Browser** (Pi forbids external content / redirects). Pi is
   detected at boot via `body.pi-browser` (added `index.html:919`, UA test `index.html:938`:
   `/PiBrowser|Pi Browser|MinePi/i`). In the picker render (`63752`) and in `_sg`, filter out
   entries with `ext` when `document.body.classList.contains('pi-browser')`. External games then
   only appear in the web/PWA build, never the Pi build.

### Optional helper (Stephen's call — Q1)

`scripts/add_external_game.js <id> <name> <icon> <url> [blurb]` that inserts the `G[]` line
(anchored, str_replace-style), bumps `LW_VERSION` (`index.html:903`), and runs `node --check`.
Lower friction than copy-paste if he's adding several. Not required — the template above works.

---

## 3. Honest tradeoffs (vs native modular games)

- **Earning is indirect but real:** embedded game earns via Sunbeam SDK into the *same* wallet,
  so sunbeams carry over — but through `earnHashes`/`hashLedger`, not the app's local `_e()`.
  Hence the re-sync-on-exit (change #3); otherwise header count lags until next sync.
- **Needs network:** embedded games won't run offline / in the installed PWA the way native games do.
- **Pi build hides them** (change #4) — they only appear in web/PWA. Acceptable: Pi compliance > catalog size.
- **Stephen keeps maintaining each game in its own codespace** — the decoupling he asked for. ✅
- **Auth:** anonymous earning works cross-origin out of the box; signed-in needs each origin in
  Firebase **authorized domains** (Console → Auth → Settings). github.io + vercel apps already
  earn in the portal today, so this is presumably already set — verify per new origin.

### Alternative considered & rejected: port each game to a `_G` module
Full native fidelity + offline, but real per-game rework (rebuild as ES5 single-file, swap its
scoring/earn/bootstrap for `_G`). Not worth it for Vercel/React-style games. Keep as an option
only if a specific game must work offline inside the Pi build.

---

## 4. Open questions for Stephen (answer → I build)

1. **Helper script or copy-paste template?** (§2 "Optional helper") — recommend copy-paste to start.
2. **First batch & ordering:** proceed with Glyph Forge / Sweet Spot / Tarot Run as the first three
   `studio` entries? HUNCH flagged premium, Brawl as "soon" (greyed, non-clickable like the portal)?
3. **Category name/icon:** "SKY WOLF STUDIOS" 🐺 — or fold external games into an existing category?
4. **Single source of truth (later):** worth having the main app + `portal/index.html` read ONE
   shared `external-games.json` so a game is added in exactly one place? Adds a boot-time fetch +
   complexity to a 6.9MB single file — recommend NOT for v1; revisit if the list grows.

---

## 5. Implementation checklist (once approved)

- [ ] Add `studio` category to `G_CATS` (`index.html:62505`)
- [ ] `_sg` iframe branch on `gi.ext` (`index.html:~64010`) + early return
- [ ] Pi-Browser filter on `ext` entries (picker render `63752` + `_sg`)
- [ ] Wallet re-sync on `ext`-game exit (`_xt`/back/`_cp`)
- [ ] Add first 3–5 `G[]` external entries
- [ ] Bump `LW_VERSION` (`index.html:903`) — NOT `_SVG_CACHE_VER` (no plant-art change)
- [ ] `node --check index.html` + `node scripts/test_g_contract.js` + `node scripts/smoke.js`
- [ ] Thumbnails (Stephen): `assets/games/thumbs/<id>.png` (or reuse `/portal-assets/thumbs/*`)
- [ ] Test in web build; confirm sunbeams earned in iframe reflect after exit; confirm hidden in Pi UA

**No app code is changed by this plan doc.** Implementation begins only after Q1–Q4 are answered.
