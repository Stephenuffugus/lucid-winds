# Tarot Run — Overnight Build Log

> Autonomous senior-director run. Human is asleep. Goal: take Tarot Run from
> "mechanically deep but visually placeholder" to "genuinely amazing, unique,
> engaging, polished" — end to end. Respecting the project's hard rules
> (never bump VERSION, don't sim-chase win%, commit as standalone calls,
> don't destroy existing depth). Live: https://stephenuffugus.github.io/Tarot_Run/

---

## ☀️ WAKE-UP SUMMARY  (read me first)

**Shipped 13 builds autonomously — B25 → B37 — all tested, committed, pushed,
and live.** Art is YOURS (per your steer), so every ounce went to PERMANENT,
non-art value: retention systems, content, real bug fixes, onboarding, depth.
A competitor-research + code-audit pass (parallel agents) set the priorities.

**The headline wins:**
- **The difficulty ladder is now real** (B25/B37) — it was fully data-defined
  but completely INERT. Now wired, selectable, 11 rungs, with tactical (not
  just stat) screws at the top.
- **Three real combat bugs fixed** (B28) — enemy Block was wiped every turn
  (Guard intents + the whole Swords *pierce* identity were doing nothing);
  Cups Resolve granted block too late; the "curse" enemy attack was secretly
  GIFTING a strong card. ⚠️ Net effect is a modest, intended difficulty bump.
- **Every run now closes a loop** (B30/B31) — a real score + itemized summary
  on win OR loss, plus a finished **Daily Spread** (one seed/day, locked
  attempt, streak, copyable spoiler-free brag).
- **Every run now feels different** (B26 per-act bestiary, B27 +8 events, B33
  opening omen, B35 suit-led drafts + 7 relics, B36 Tower dares).
- **New players get taught** (B32) — just-in-time, once-ever tutorials.

Full per-build detail + what to playtest is in **RESUME.md** (top section)
and **NEXT.md** (PART 0). Memory log: `tarot-overnight-b25-b34.md`.

_Original mission note (kept for context): the run was first scoped toward an
ART_BIBLE + procedural fallback, then you steered "work autonomously, don't
ask" + "I'll make all the art later" → all effort moved to permanent depth._

---

## Running log (timestamped, newest at bottom)

### Phase 0 — Orient  (2026-06-29, run start)
- Confirmed repo: single-file vanilla HTML/CSS/JS PWA. `index.html` (4066 lines)
  is the whole game; `data/*.json` mirror card/enemy/relic defs; `sim-*.js` +
  `test*.js` + `diag-combat.js` are the Node test/sim harness.
- Deploy: GitHub Pages serves branch `setup/project-structure` (root). Every
  push auto-deploys in ~1 min. Working/​committing on that branch (it IS the
  deploy branch).
- Read RESUME.md, NEXT.md, README, DESIGN.md, ART_DIRECTION.md, BALANCE.md.
  Project is at **B24 · THE SHADOW DECK** — a Slay-the-Spire-style tarot
  deckbuilder: 4 Patrons, 78 cards (22 Major + 56 Minor w/ authored Shadow
  faces), The Reading/Prophecy, The Chain, The Cut, 3 Acts, Merchant, relics.
- **Baseline tests GREEN:** `test-cards.js` DONE (0 err), `test.js` full fight OK,
  `diag-combat.js` TEST A–H PASS, `sim-run.js` completes (wins present).
- **Key finding:** ZERO art exists. `art-slots/` is empty; every `.card-art`,
  `.enemy-portrait`, and `.title-mark` falls back to a unicode glyph via
  `::before{content:attr(data-glyph)}`. `hydrateArt()` loads `art-slots/<slot>.png`
  if present, else leaves the placeholder. → The non-destructive win: paint
  beautiful procedural SVG into the placeholder; a dropped PNG still overrides.
- Tooling: no Chrome/rasterizer in env; installed `@resvg/resvg-js` in scratch
  so generated SVG can be rasterized to PNG and visually verified.
- Decision log → see DESIGN.md additions as they land.
