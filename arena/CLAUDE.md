# CLAUDE.md — Working agreement for Lucid Winds · OC Arena

You are continuing work on **Lucid Winds — OC Arena**, a browser game: an original-character
creator + auto-battle simulator with a Path-of-Exile-style passive skill web and a
support-augment ("support gem") system. Read this whole file before editing.

`README.md` = product overview · `ARCHITECTURE.md` = the code map · `DEVELOPMENT.md` = copy-paste
recipes for adding content · `ROADMAP.md` = what to build next.

---

## The one rule that shapes everything

**The entire app is ONE self-contained file: `lucid-winds-arena.html`.** All HTML, CSS, and JS are
inline. No build step, no bundler, no external runtime dependencies, no network calls. This is a hard
product constraint, not an accident — the file must:

- render as an artifact inside a chat UI,
- be self-hostable and embeddable in an `<iframe>`,
- work offline on a phone.

**Do NOT** split it into modules, add a framework, add `import`/`require` in the app, pull a CDN
script, or introduce a build. If you want a library, hand-write the minimum you need inline. The only
JS files with `require` are in `test/`, and those run in Node, never in the browser.

---

## How to work in a 1,900-line single file

Editing a huge file has two failure modes we've already hit; avoid both:

1. **Creating the whole file at once fails.** When generating large HTML, build it by **appending
   chunks** with `cat >> lucid-winds-arena.html << 'EOF' … EOF` (the first chunk uses `>` to start
   fresh). ~13 chunks was the working size. For edits, prefer targeted `str_replace` over rewrites.
2. **Never rely on "it looks right."** After ANY change, run the checks (below). The combat math is
   easy to break subtly (NaN, non-terminating fights); the tests exist to catch exactly that.

## Required workflow for every change

```bash
npm run check      # compiles the inline <script> (syntax) + structural sanity
npm run stress     # 29k random fights: asserts no crash, no NaN/Inf, all terminate ≤200 rounds
npm run validate   # tree connectivity, refund invariant (0 violations), balance spread
# or all three:
npm test           # (also: ./test.sh)
```

- Touched **combat / modifiers / augments / a power / a race** → `npm run stress` is mandatory.
- Touched **the tree (nodes, edges, `buildTree`, keystones, allocation/refund)** → `npm run validate`.
- Touched **anything** → `npm run check`.
- The tests load the game headlessly by extracting its inline `<script>` (see `test/harness-core.js`);
  they never modify the game. If you add a new top-level symbol the tests should see, add its name to
  `EXPORTS` in `harness-core.js`.

Do not consider a task done until the relevant checks pass. If you change balance intentionally and a
test's *threshold* is now wrong (not a real failure), update the assertion in `test/validate.js` and
say so.

---

## Invariants you must not break

These keep fights finite and the app crash-proof. Preserve them:

- **Fights always terminate.** `simulate()` has a hard `MAX = 200` round cap and, if both fighters are
  alive at the cap, a HP%-ratio tiebreak. Any new mechanic (extra actions, revives, stuns, chains)
  must not be able to defeat this. Stuns are capped at 1; revive sources are finite (`revivesLeft`).
- **Damage floors at 1.** `hitDamage()` returns `max(1, …)`. Never let a hit resolve to 0/negative/NaN.
- **Everything is clamped.** Stats clamp to `1..160`; crit/eva/negate/accuracy have ceilings. When you
  add a stacking modifier, clamp its aggregate. Assume players will stack it to the moon.
- **Allocation stays connected.** A passive node is allocatable only if adjacent to an already-allocated
  node tracing back to the race start; a refund is allowed only if it keeps the set connected
  (`canRefund` BFS). Keep this guard — `validate` checks it (0 violations expected).
- **Persistence never throws.** `Store` feature-detects `window.storage` → `localStorage` → in-memory
  and swallows errors. Keep it non-throwing so the artifact never white-screens.
- **Saves migrate forward.** `migrateOC()` backfills new fields on old saves. If you add a field to an
  OC/power/tree, add its default there and bump `SAVE_KEY` only if the shape is truly incompatible.

---

## The mental model of the code (see ARCHITECTURE.md for detail)

Data (`RACES`, `POWERS`, `AUGMENTS`, `ARMS`, `STAND_ARCHETYPES`, built `TREE`) → **modifier pipeline** →
render.

```
node effects ─▶ aggregateMods(oc) ─▶ M (a modifier profile: statAdd, incTag, more, keystone flags…)
                     │
baseStats + buffs + M.statAdd ─▶ computeFinal(oc) ─▶ final stats
                     │
final + M + power flags + augments ─▶ deriveCombat(oc) ─▶ F (a ready-to-fight fighter)
                     │
                 simulate(ocA, ocB) ─▶ {winner, log, rounds, hpTimeline, rewards}
```

Damage uses a PoE-style **increased (additive) vs more (multiplicative)** split inside `hitDamage()`.
Tags (`physical force fire mind void` + `projectile melee area dot`) let tree nodes and augments scale
the right skills. Augments ("support gems") transform a power's proc: `extraHits`, `localInc`,
`localMore`, `addDot`, `leechThis`, `noMiss`, `cull`, `secondary`, etc. A power's **mastery tier is its
socket count** (Novice 1 → Master 4).

UI is **vanilla, no framework**: string templates + one delegated `click` listener on `document`
(`handleAct` switch on `data-act`), plus `input`/`change` listeners for `data-field`. Handlers are
attached ONCE and survive re-renders. `render()` rebuilds `#app` innerHTML; the skill-web pan/zoom
listeners are re-bound each render via `setupTree()`. Node selection updates the panel via targeted DOM
(so it doesn't reset the pan/zoom); allocate/refund does a full `render()` (state is preserved).

---

## House style

- Plain ES2019-ish JS. No TypeScript, no JSX, no framework, no new deps in the app.
- Keep the "aurora over void" aesthetic: deep indigo-black base, **race color encodes identity**, six
  arm theme colors for the tree. Respect `prefers-reduced-motion` (already handled).
- New interactive elements emit `data-act="…"` (+ `data-*`) and get a `case` in `handleAct`; inputs use
  `data-field`. Don't attach one-off listeners in render output — route through delegation.
- Mobile-first: tap targets ≥ ~40px, avoid hover-only affordances, test at ~380px wide mentally.
- Money/economy: **Aether** = creation-time budget; **Glory** = post-creation currency (training,
  mastery, augments, respec); **XP/levels** = passive skill points. Keep these three separate.
- Content lives in the big `const` tables near the top of the script — prefer adding data there over
  adding special-case logic.

## Definition of done

Feature works on mobile-width; new `data-act`s handled; saves still load (migration covers new fields);
`npm test` green (or thresholds intentionally updated); `CHANGELOG.md` noted; if you added a system,
add a short section to `ARCHITECTURE.md` and a recipe to `DEVELOPMENT.md`.
