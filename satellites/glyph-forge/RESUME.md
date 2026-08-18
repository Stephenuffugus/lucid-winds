# RESUME — pick up here the moment you say "lets get started"

## ★ b17 COMBAT-DEPTH OVERHAUL — MERGED + LIVE (2026-06-29)
Everything committed, merged to `main`, pushed, and **deployed live**. Verified:
`https://stephenuffugus.github.io/glyph_forge/` serves `b17 combat-depth`.
`node test.js` green · `node sim-run.js` 47.1% (band 30-55), all Sigils in band,
**determinism PASS** · code-reviewed (zero bugs) · full 13-encounter browser
playthrough clean. The audit (Balatro/StS/Monster Train) found the core problem:
a deep scoring ENGINE with no GAME around it (flat-damage enemy, invisible
XMULT). Six tested batches A-F fixed it — full plan + v1.1 backlog in
**BUILD_PLAN.md**. What's new this build:
- **Telegraphed enemy intent** — ATTACK n / CHARGING→UNLEASH / MEND, per enemy.
- **Armor + pierce** (tier-3 + boss) — revived Hollow/Eclipse/Storm Sigil.
- **Legible engine** — live `POWER → ×XMULT [reasons] → ×fluency = N` readout.
- **3-phase Sovereign** that reads & counters your dominant element.
- **Forget-a-Glyph** deck-thin · **transmutation chase** chip · **win-free goals**.

### ☐ PLAYTEST b17 TOMORROW (Pixel 9) — bring notes per item
Pull-to-refresh; the title strip must read **`b17 combat-depth`** (else it's stale).
- [ ] **Intent** — do ATTACK/CHARGING→UNLEASH/MEND read clearly? Do you find
      yourself *deciding* (race the charge vs build) instead of auto-nuking?
- [ ] **The breakdown line** under the gold number — is it legible on the phone?
      Does watching `POWER → ×XMULT [3 Fire] → fluency` teach you the engine?
- [ ] **Armor** (tier-3/boss show `⛊N`) — does the `−N armor` / `⛊ pierced!`
      feedback make sense? Does it push you to hit bigger / use Hollow/Eclipse?
- [ ] **The Sovereign** (the big one) — fair or a brick wall? It reads your most-
      used element and shows `⟁ counters X` after 66% HP; does bringing a second
      line feel possible & satisfying, or does it feel like a gotcha? (Tune target.)
- [ ] **Forget a Glyph** (reward option) — useful? Did you excise a sealed dead-draw?
- [ ] **Transmutation chase** (`⚗ name N/3` chip) — does it make you chase a triad?
- [ ] **New goals** in the Codex (Detonator/Alchemist/Wayfarer) — reachable & motivating?
- [ ] Overall: more fun / more to think about than b16? Anything that feels bad?

### ☐ WORK QUEUE — when notes arrive (in order)
1. **Triage b17 notes** → each a tested fix (gate every commit on `node test.js`
   green with `&&`, then `node sim-run.js`). Likely first lever: **boss difficulty**
   (the counter + armor + phase-3 escalation may be too steep — soften via the
   `×0.6/×0.9` dampen, boss HP/armor, or gate the counter to higher Ascension).
2. **v1.1 backlog** (BUILD_PLAN.md): full status system (Vulnerable/Weak/Poison),
   burn DoT, attrition/heal-cut, champion-path accumulate, final relic/Sigil re-tune
   (the sim's "tuning needed" = that known relic-spread debt, not a regression).
3. Local Playwright UI-play harness exists for headless verify: `gf-*.mjs`
   (gitignored; `NODE_PATH` not needed — run from repo root; chromium installed).

---

> (Below: the prior b16 phone-playtest checklist — superseded by the b17 list
> above, kept for reference.)

> Paused mid playtest-iterate loop (user took a break). Everything
> committed/pushed/saved, b16 live. Walk the two checklists below.

## ☐ A · PLAYTEST CHECKLIST — do this on the Pixel 9 during the break
Play `https://stephenuffugus.github.io/glyph_forge/` (chip should read
`b16 codex-dock+bigger`; pull-to-refresh if not). Note anything per item:

- [ ] **Install it** (Chrome ⋮ → Install app → open from home icon).
      Does it run truly immersive — no bars at all, ever? (the durable fix)
- [ ] **Size** — hand cards / text / buttons: too small still, good, or
      too big now? (it's a single dial I can turn either way)
- [ ] **Codex dock** — `✦ Codex` (bottom-left) opens a panel over the top
      while hand stays visible/tappable. Right height (60%)? Useful?
      Does "Ready from your hand" update live as you stage/draw?
- [ ] **Recall** — the old Recall button is gone (tap a staged rune's slot
      to return it). Fine, or want one-tap "recall all" back?
- [ ] **b11 apprentice (the retention fix — most important)** on a *fresh*
      run / Ascension 0: do rewards rail toward one element, and does the
      gold coach line *teach* the 3-mono play without nagging? Is it
      followable? Does it fade after you win / climb Ascension?
- [ ] **Field Guide value** — does it actually help you find/repeat strong
      combos, or just clutter?
- [ ] Anything else that feels bad on the phone (feel, pacing, clarity).

## ☐ B · WORK QUEUE — when we resume, in order
1. **Triage playtest notes** → each becomes one tested fix (gate every
   commit on `node test.js` green with `&&`, then `node sim-run.js`).
2. **Tune from A**: `--ui` dial / hand columns (size); `#guide-panel`
   height %; restore one-tap Recall if wanted. (All quick number-turns.)
3. **Validate or iterate b11 apprentice** — the sim says deck-rail+teach
   together = ~+6pts D7 (fully rescues Lapsed, partial Casual). Confirm it
   *feels* right on device; if the coach annoys or doesn't land, iterate
   the surface (see [retention-cliff-finding] in memory + tools/retention-sim.js).
4. **Then back to the cash roadmap** (the actual goal): P1 boss phase-2 +
   deck-thinning, P3 tighten weak Sigils (re-sim each via
   `node tools/retention-sim.js`), P4 paid gate once retention proven.
5. Non-blocking: real icon art → overwrite `art-slots/icon-{192,512}.png`
   (placeholder from `node tools/make-icons.mjs`); ART_SHOTLIST.md.

---

**Status: BUILD COMPLETE & SAFE + in playtest-iterate loop.** `node test.js`
green, `node sim-run.js` verdict *"depth systems balanced; determinism holds"*,
all committed & pushed to `main`. Build stamp on the title strip:
**`2026-05-19 · b16 codex-dock+bigger`** (bump `GF_BUILD` in index.html + the
`CACHE` in sw.js every deploy; PWA auto-updates within ~60s; note GitHub
Pages CDN edge can lag ~30-60s behind the build — re-curl, not a failure).

**Playtest-loop builds since b11:** b12/b14 = Pixel-9 bottom-bar saga
(b12 re-added `viewport-fit=cover` — WRONG for Android Chrome tabs, which
don't expose `env(safe-area-inset-bottom)` for the 3-button nav; b14
removed cover so Chrome sizes page above the bar + hard 56px floor). b13 =
in-run **Field Guide** (✦ HUD btn → read-only overlay: discovered fusions
+ which are buildable from current hand; no undiscovered spoilers). b15 =
**tap-to-fullscreen** (`gfGoFullscreen` on pointerdown, Android Chrome
hides nav+URL bars) + `mobile-web-app-capable` meta; THE real fix is
Add-to-Home-Screen (manifest `display:fullscreen` → true immersive).
b16 = Recall→`✦ Codex` in cast-row (per-slot tap still recalls);
Field Guide now a DOCKABLE panel (`#guide-panel`, 60% top, hand+cast
stay live under it, refreshes from renderGame) not a modal; bigger UI
(hand 5→4 cols, font/btn bumps, single `--ui` dial in :root for
tuning). All UI/CSS/listener only, sims byte-identical (resolveSpell
untouched). AWAITING playtest read: size dial, panel-height %, whether
to restore a one-tap Recall.

**LIVE & always-on:** GitHub Pages (repo public) →
`https://stephenuffugus.github.io/glyph_forge/`, auto-deploys every push.

**b11 shipped (retention work):** `tools/retention-sim.js` (demographic
retention model — engine-real win rates, paired causal A/B) showed ~80% of
modelled installs never win → early-frustration cliff. Built the sim-backed
fix: **Apprentice Inscription** = `runHelp()`-gated deck-rail (DR) + a
`#spell-coach` line teaching the 3-mono fusion (P2). Full at Ascension 0 /
pre-first-win, off at A≥3 (vets untouched, balance sim byte-identical).
Modelled lift ≈ +6pts D7. AWAITING phone-playtest notes on feel/readability.
Open playtest note: cards need to be larger / easier to read (lands w/ art).

### Picking up in the morning — first things
1. The user will have **test-played more** → ask for / expect notes; turn each
   into a tested fix (gate every commit on `node test.js` green BEFORE
   `git commit` — use `&&`, never `;`, that mistake pushed a broken commit
   once this session, fixed in 97c1514).
2. **Card list is ready (the user asked for this):** `ART_CARDLIST.csv`
   (Google-Drive-ready → opens as a Sheet, has a Status column) +
   `ART_CARDLIST.md`. 36 cards + 8 enemies + 3 brand = 47 assets; 6
   content-pack runes flagged as needing fresh art direction. Regenerate
   after any content change: `node tools/cardlist.mjs`. To get it to Drive:
   download the CSV from the VS Code explorer (right-click → Download) and
   upload to Drive, or pull from the repo.
3. Recent session work (committed): balance tune, audio, juice (A/B/C),
   marketing+docs, **meta-progression spine** (Ascension ladder + Daily
   streak/score + Codex Mastery — additive, sim-inert), mobile fixes
   (dropped viewport-fit=cover; 100svh; cast-row clearance — fixed Pixel 9
   bottom-button clipping), build stamp + SW auto-update.

## Done & shipped (committed/pushed)
- All 6 deep-design phases (two-track engine, Sigils, relics, Champion, Rune
  Web, counter-boss). Content pack: 36 runes, 48 combos, 7 Sigils, 6
  Champions, 22 relics, 5 transmutations.
- **Balance tuned to clean verdict.** The 5 content-pack OP relics (+31..+35)
  + dead Low Lantern (−7.3) were sim-flagged and re-costed → every relic now
  Δ +5..+25, none dead/overpowered, determinism PASS. See `BALANCE.md`.
- **Synthesised Web Audio** (`GFAudio` IIFE, no asset files, mute button,
  Node-safe — inert in test/sim). Hooks: cast/combo/reward/hit/victory/
  defeat/tap.
- **Juice/polish** (3 batches): motion/haptic helpers + reduced-motion +
  44px taps; damage tiers + count-up + XMULT flash/shake + chip-damage HP
  bar; tap-tooltips (fixed real mobile bug) + slot/synergy/modal anims +
  relic rarity tokens.
- **Static-host deploy:** `tools/pack.sh` → `dist/` + `glyph-forge-hostinger.zip`
  + `tools/HOSTINGER-UPLOAD.md`. Test-play works regardless of codespace uptime.
- **Marketing + docs:** `ITCH_STORE_COPY.md` (rewritten), `DEVLOG.md`,
  `SOCIAL.md` (X/Reddit/Daily hooks/press/launch checklist), `LAUNCH.md`,
  `README.md`, `GAME_DESIGN_DEEP.md`, `BALANCE.md` — all synced to shipped.

## Meta-progression spine — SHIPPED (P0 of the cash roadmap)
Additive, sim-inert (Ascension modifiers only at run construction; tier 0 =
byte-identical to the validated game). Ascension ladder (6 tiers, unlock by
clearing your top tier), Ascension picker in the Sigil modal, title
progression strip, Daily Sigil streak+score (in win/defeat/share), Codex
Mastery track (11 seals, zero power). Saves auto-migrate (deep-merge).

## ▶ NEXT — cash roadmap (P0 done; user picks order)
- **P1** Boss phase-2 mechanic + deck-thinning reward (fairness/fun: losses
  feel earned, runs become sculptable).
- **P2** Teach the ceiling: surface the strong xmult/mono lines so players
  find the depth (sim: AI defaults to 52%-win retrigger; xmult/mono win 70%+
  but are under-discovered).
- **P3** Tighten Sigil spread (umbra 37% / zephyr 45% ↔ void 67%): ease the
  weak Sigils' seals/boons so first-run choice isn't a trap. Re-sim.
- **P4** (after retention proven) paid gate — Ascension/endless or full-run
  unlock.

## ▶ Launch/ops (anytime)
1. **Test-play — PERMANENT LINK IS LIVE.** GitHub Pages enabled 2026-05-19
   (repo made PUBLIC, Settings→Pages→main→/root). Always-on, codespace-
   independent, auto-deploys every push to `main` within ~1 min:
   **`https://stephenuffugus.github.io/glyph_forge/`**
   Verify a deploy: `gh api repos/Stephenuffugus/glyph_forge/pages/builds/latest`
   + `curl -s -L .../glyph_forge/ | grep GF_BUILD`. Codespace dev URL
   (`...app.github.dev`) is now only a scratch loop while awake.
   PWA is now INSTALLABLE: `art-slots/icon-{192,512}.png` generated by the
   zero-dep `node tools/make-icons.mjs` (placeholder ink+gilt rune; real art
   can overwrite same paths). Install (Chrome ⋮ → Install app) → manifest
   `display:fullscreen` = true-immersive, the durable bottom-bar fix.
2. **Publish / promote.** `LAUNCH.md` go-live; itch via `ITCH_STORE_COPY.md`
   (set `GF_LINKS.itch`); `SOCIAL.md` copy-paste, lead with Daily Sigil.
3. **Art** (non-blocking): `ART_SHOTLIST.md` → drop PNGs in `art-slots/`.

## Discipline that must hold every commit
Single `<script>`; `node test.js` + `node sim-run.js` green; save key
`glyph-forge-v1` additive-only; baseline byte-identical with no Sigil/relics;
deterministic daily; `dist/` + zip are gitignored build artifacts. Commit per
coherent batch with the Co-Authored-By trailer.

## v1.1 backlog (post-money — see LAUNCH.md)
Boss phase-2; Sigil-spread tightening (37%↔67% optimal-AI, inside pass band);
deck-thinning; Firebase Daily leaderboard; optional freemium gate.
