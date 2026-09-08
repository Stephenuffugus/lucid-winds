# HANDOFF MARROWDEEP, the build plan for one Opus, one day and the night after it

Written by Fable 2026-09-08 from `assets/MARROWDEEP_DESIGN_SPEC.md` v1.0 (Stephen's design, 744 lines, complete
through systems, content and tuning pending). Companion files in this folder, all written the same day:

- `RULES.md`: the rules of play, complete, every gap the spec left DECIDED, every spec error CORRECTED with the
  arithmetic. **The engine is built from RULES.md, not from the spec.** Rule ids (R1.4 ...) are what gates cite.
- `proto/engine.js` and `proto/sim.mjs`: the prototype engine and its harness. ⛔ **It is a HEAD START, not a
  finished thing, and its state is whatever `node plans/marrowdeep/proto/sim.mjs --test` says today.** It was being
  written while the audit was still correcting `RULES.md`, so it spent the morning lagging them. **At 13:12 on Sep 08
  it went green: `--test` prints MD TEST OK with 350 assertions over R1 to R9, and `--table` prints TABLE OK with
  every cell inside a tenth of a point of R1.4, the two corrected cells included, and all five floor rows of R1.5.**
  Check it again yourself; it may have moved either way since. If `proto/PROTO-REPORT.md`
  exists, the tuning pass ran and its numbers are the evidence; if it does not, no tuning pass ran and BALANCE holds
  the audit's reasoned defaults, not measured ones. **P0 step 0 checks this before anything is pasted.**
- `data/*.json`: the content the spec's section 16 said was not yet written: challenge text, six bosses, twenty
  four Traits, twenty uniques, name banks, relic word lists, every blurb and card line. Verified against the copy
  law and the effect vocabulary. **The builder inlines these; it does not author content.**
- `ART-PACK-MARROWDEEP.md`: the sheets for Stephen's generator (also a Doc in 012Assets). The game ships with
  everything drawn by code; art is an upgrade, never a blocker.
- `AUDIT.md`: what five auditors and their refuters found in the spec and in RULES, and what was done with each.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-08, Fable: **plan, rules, content and audit written and pushed; nothing under `satellites/marrowdeep/`
  exists yet.** `RULES.md` is complete and carries twenty rulings from the Sep 08 audit (eleven of them blockers a
  builder could not have coded around). `data/` holds eleven verified content files. `proto/` holds the prototype
  engine and its balance harness; `proto/PROTO-REPORT.md` carries the tuned numbers if it finished, and P0 step 0
  says what to do if it did not. **Next action: P0 step 0, then step 1.**

(When Stephen's phone notes arrive, they go here VERBATIM first, numbered, then each is sorted fault / taste /
already known, and the sort says which pile; see `HANDOFF-FABLE-SEP06-EVENING.md` section 1.)

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** You may create and edit files under `satellites/marrowdeep/**` and this file. Nothing else. Not
   another satellite, not `portal/index.html`, not `scripts/`, not `music-unlocks.js`, not any other game's `sw.js`,
   not `art-asset-lists/`, not `plans/marrowdeep/RULES.md`, `proto/` or `data/` (those are READ ONLY inputs; copy
   them in), not the memory directory, not `CLAUDE.md`. If a fix seems to need a file outside the fence, it goes in
   the morning report as a request to Fable and the game works around it.
2. **Git.** `git pull --rebase --autostash origin add-sproing-jumper` before the first edit and before every push.
   Stage with `git add satellites/marrowdeep plans/marrowdeep/HANDOFF-MARROWDEEP.md`, never `git add -A`, never
   `git add .`. **Commit the moment something is green, never at the end of a phase only** (two builders stalled on
   Sep 08 with work uncommitted when the session limit hit; their trees had to be rescued by hand). Push the branch:
   `git push origin add-sproing-jumper`. **Never push to main.** Fable deploys.
3. **Studio laws that bind every line of player copy and every screen.**
   - No dash of any kind and no exclamation point in anything a player reads. Not in a name, a card, a toast, a
     button, a Hall wall line. Write around them. The content files are already clean; keep them so.
   - Every button a thumb uses is at least 48 px tall and wide as RENDERED at 375x667, proved by
     `document.elementFromPoint` at its centre landing on it. `el.click()` proves nothing and is not used in a gate.
   - The brand is **Sky Wolf Studio**, singular.
   - Runtime modules are `.js`, never `.mjs` (the host serves `.mjs` as text/plain). `.mjs` is for Node tools only.
   - Every URL the page loads carries `?v=<stamp>`; `var STAMP`, the service worker registration's `?v=`, every head
     `?v=`, the music include's `?v=`, and `sw.js` `SHELL_VERSION` are one string, bumped together. Lint asserts it.
   - Text is 0.7 rem or larger. Portrait, one hand. The bottom left 120 by 120 CSS px of every screen is empty:
     the fleet's music chip and its folded pill seat there.
   - No `Math.random`, no `Date`, no `document` between the SIM markers. The sim is the game.
   - No economy claims in copy (nothing in the portal listens for the earn message).
   - **LOOKING IS PART OF THE JOB.** A visual change is not done until you have opened the screenshot with the Read
     tool and named three things wrong in it.
4. **Never wait on a human.** Section 14 governs the run. The open questions in section 10 take the answers there.
5. **Two cores.** Every command that opens Chrome runs as `timeout 2700 flock -w 1800 /tmp/sws-gate.lock node <cmd>`.
   One browser at a time. A browser gate that fails inside the suite is rerun alone, twice; two passes alone is a
   pass and is written that way. Never run `sweep-twelve.mjs` under a flock of your own (it flocks inside; it deadlocks).

---

## 1. WHAT MARROWDEEP IS, AND WHY IT IS WORTH THE DAY

A dice and cards roguelike for one thumb. You roll a character in one tap (four stats that are dice, an Origin dealt,
a Calling chosen from three cards), take three of them into a quest of six stages, and at every stage you decide who
faces which of two challenges and who rests. The dice decide the rest; a top face explodes. The sixth stage is a boss
with three locked Aspects, each demanding a different stat, and every round it strikes the party until all three are
broken. Characters die and stay dead; a death pays Marrow, the scarce currency that makes the account permanently
stronger, and leaves a Legacy: the dead character's Calling becomes a card that deals into every future character's
choice. Survivors take a Trait and a Scar (permanent Toughness loss), so a veteran gets stronger and more fragile at
once and the player decides when to retire her for six Marrow rather than lose her for one. Gear has eight slots that
each own one mechanic; unwanted drops turn to Renown on the spot, so there is no inventory. Target numbers never rise:
difficulty at the deeper Depths comes only from structure (more Chains and Relays, two bosses, four Aspects) and
pressure (Strain that no longer clears between stages, Sigils that switch off Surge or floors for a whole quest).

Why it is worth the day: the design is unusually complete (a resolution engine with a closed form master table, a
priced affix economy, a death economy with numeric targets), which means it can be BUILT AGAINST NUMBERS: the engine
already exists in `proto/`, verified; the prototype reproduces the corrected master table and 350 rule assertions; the content is written.
What is left is the game: five screens, the tumble, the sound, the save, the polish. Stephen: "i want this game
built today."

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-08 on the branch; trust this over any doc)

Copy these, do not reinvent them. Every path below exists on `add-sproing-jumper` today.

| Need | Copy from | What to take |
|---|---|---|
| The engine and the harness | `plans/marrowdeep/proto/engine.js`, `proto/sim.mjs` | The whole engine goes between the SIM markers as BALANCE through SIM, verbatim except the UMD wrapper, which the markers replace. ⛔ **After P0 the PAGE is the only implementation of the rules.** `satellites/marrowdeep/sim.js` EXTRACTS the rules out of `index.html` through the markers, the way `satellites/fathom/sim.js` does; it never imports `proto/engine.js`, and `proto/` is never loaded at runtime by anything. Copying `proto/sim.mjs` and importing the engine instead would leave two implementations that drift, which is the scar this repo carries from `games/` versus the inline copies. `sim.mjs`'s `--table` and `--test` become `sim.js`'s, reading the extracted rules; `--balance` and `--depths` are written from scratch in P3, because the prototype has no grid mode. **The only measured inheritance is `--table` and the rule assertions.** ⛔ Porting those assertions is not a five word clause: they are about 1,200 lines of ESM with hundreds of `const` and arrow lines, and they have to end up between the TEST markers as classic script, because `sim.js` composes the two blocks into a `new Function`. Budget it, or run it through a transform and say which language level the TEST block may use. |
| Single file layer order, the SIM and TEST markers | `satellites/fathom/index.html` lines 225 to 241 (the law in the comment), 1454, 2208, 2767 | `// ---- SIM_EXPORT_START ----` ... `// ---- SIM_EXPORT_END ----` around BALANCE, RNG, DATA, EFFECTS, DICE, GEN, SIM; `// ---- TEST_EXPORT_START/END ----` around TEST. Nothing between the SIM markers touches `document`, `window`, `performance`, `Date` or `Math.random`. |
| Headless runner | `satellites/fathom/sim.js` (whole file, 12 KB) | The `extract(src, a, b)` marker reader, `build(over)` with `--over=KEY=VAL` as a SOURCE substitution into the frozen BALANCE (throws on an unknown key), the `--test` shape and its exit codes. Rename the exports list. |
| Self test harness in the page | `satellites/fathom/index.html` from line 2212, `var TEST = {...}` | `assert`, `eq`, `near`, `throws`; the suite runs at `?test=1` into a panel and is exposed as `window.__TEST__`; the assertion floor, which is ONE number in ONE place, `ASSERTION_FLOOR` in section 4, and never restated. |
| The save | `satellites/fathom/index.html` lines 2176 to 2206, `var SAVE` | The read, modify, write shape and the max merge for bests. Marrowdeep's save is bigger (section 4) and the merge rule is different for the in progress quest; keep the SHAPE and the `storage` listener, not the fields. ⛔ Preserve unknown top level fields on write (the whitelist scar, section 9). |
| Service worker | `satellites/fathom/sw.js` (whole file) | `fathom` becomes `marrowdeep` everywhere. Its header comment is the host law: only delete `marrowdeep-*` caches, every fetch settles a real Response, navigations refetch with `cache:'no-cache'`, `SHELL_VERSION` and the registration `?v=` move together. |
| Manifest | `satellites/fathom/manifest.webmanifest` | Same shape, `id` and `scope` `/satellites/marrowdeep/`, portrait, `background_color` `#0c0a10`, `theme_color` `#c9a24a`. |
| Head, music hook, portal frame protocol | `satellites/fathom/index.html` lines 1 to 15 (head), 140 (`<script src="/music-unlocks.js?v=STAMP" defer>`), 2864 (`{ sws: 'game-music', on: true }`), 3036 to 3042 (`ready` at boot and on `load`; framed, the back button posts `{ sws: 'close' }`), 3071 (the registration) | Verbatim with the name changed. Marrowdeep posts `game-music` when a quest starts. |
| The `.screen` rule | `satellites/fathom/index.html` lines 70 to 76 | `position:absolute; inset:0; display:none; flex-direction:column; align-items:center; overflow-y:auto` and NO `justify-content:center` (the Sep 06 scar: centring plus scroll clips its own top on a short phone). `.spacer{flex:1 1 auto}` does the centring on screens with few rows. |
| Gate runner | `satellites/fathom/tools/check.js` (whole file) | `GATES` and `BROWSER_GATES`, `--fast` that SKIPS and says so, `SWS_NO_BROWSER=1` that refuses to say ALL GATES PASSED, stderr captured, the failing lines printed. Edit the two lists (section 5). It is CommonJS on purpose. |
| Lint | `satellites/fathom/tools/lint.mjs` (whole file) | `vm.createScript` over the real script block, no `.mjs` at runtime, every asset stamped, one stamp in every place, the copy scan (dashes, bangs), the brand, no `shadowBlur`, no font under 0.7 rem in the CSS. ⛔ That grep is HALF a gate: Fathom can afford it because its
type is drawn on a canvas and a separate rule measures the canvas font, and Marrowdeep has no canvas text at all, so
it would inherit only the weak half. The measured half moves to `test/layout.mjs`: at 375x667 and 320x568, on every
screen reached by real taps and on BOTH fixtures, every element carrying a non empty text node has
`parseFloat(getComputedStyle(el).fontSize) >= 11.2`, offenders named by id. Anything in px, inherited from a shrunken
parent or scaled by a transform is invisible to the grep and visible to this. Watch it fail by setting the RESULT
card's modifier chips to 10 px. `dupKeys` from `tools/dupkeys.mjs` at the repo root (import path `../../../tools/dupkeys.mjs`). ADD three: the copy scan runs over every string in the DATA block AND over every string the game COMPOSES at
runtime, which is where a dash actually enters (a relic name from three word lists, a wall line from a name plus an
Origin plus a Calling plus a cause, and every `lines.json` card template rendered with a real record). `sim.js
--data` generates 1,000 relic names, 1,000 character names, 200 wall lines and every card template filled, and fails
on a hyphen minus, an en dash, an em dash, a non breaking hyphen, a minus sign or an exclamation point in any of
them; watched to fail three ways, by planting each of those in a base word, in a wall line and in a card line; a `.screen` assertion (no `justify-content:center` on a rule that also scrolls); and **a drift check that the inlined DATA block still equals `data/*.json`** (re-run `tools/data.mjs` into a buffer and compare), because the moment a builder hand edits one line of content inside `index.html` the JSON files are a lie and the next `tools/data.mjs` run silently reverts the edit. |
| Browser harness | `satellites/fathom/test/harness.mjs` (whole file) | The static server that also serves the fleet's `/music-unlocks.js` family from the site root, `open()` with `isMobile, hasTouch`, `tap` (a real `pointerdown` and `pointerup` on the element under the thumb, then `click`), `centre` (rect plus `elementFromPoint`), `reporter`. ⛔ Do NOT keep Fathom's ready wait: `MD_DEV.frames() > 2` works there because `G.frames++` sits inside a
requestAnimationFrame render loop, and Marrowdeep is DOM with CSS animations and has no such loop, so the wait would
hang for its full thirty seconds on a game that booted correctly. Make readiness POSITIVE and DOM shaped: BOOT sets
`MD_DEV.ready = true` only once the title screen's nodes are in the document and one of them has a non zero rect,
and `open()` waits on `window.MD_DEV && MD_DEV.ready && MD_DEV.screen() === 'title'`. Every other wait is a
`waitForFunction` on `MD_DEV.screen()` or `MD_DEV.card()`, never a frame count and never a sleep. |
| The gates to clone | `satellites/fathom/test/boot.mjs`, `layout.mjs`, `play.mjs`, `audio.mjs` | Their header comments are the form: what is asserted, each watched to fail, and why the gate exists. `layout.mjs` holds the 120 by 120 seat check at lines 60 to 89 and the three widths. `audio.mjs` is THE EAR GATE: it renders the loudest minute through the game's own voices into an OfflineAudioContext and measures peak, rms and the share above 3 kHz. |
| Icons, thumb, shots | `satellites/fathom/tools/icons.mjs`, `thumb.mjs`, `shots.mjs` | One motif for the three icons (the maskable law is in the header: central 80 percent, radius under 50 viewBox units). The thumb from the RUNNING game, square, under 150 KB, HUD hidden. Shots at 412x915, 375x667, 320x568 by real taps; a shot tool may SEED THE SAVE and says so; a gate may not set the state it asserts (it may write a fixture to localStorage and RELOAD, which boots into it). |
| Decisions log shape | `satellites/keepsies/docs/DECISIONS.md` | Newest last, one bold line of what, one line of why. |
| Duplicate key lint | `tools/dupkeys.mjs` (repo root, READ ONLY) | Already imported by the Fathom lint. A key declared twice in an object literal is legal and the last one silently wins; the content block is one big literal. |
| Dice art in the fleet | `assets/dice/` (READ ONLY) | d6 only, locked, photographic. NOT for Marrowdeep: the five ladder dice are drawn in code as flat polygons (section 7). Do not load any image at runtime. |

Not inherited, on purpose: no shared shell, no three.js, no physics, no `bundle.js`, no images. The spec's "PWA" is
real files (`sw.js`, manifest, icons), not inline generation.

---

## 3. CORRECTIONS TO THE DESIGN (binding; each forced by arithmetic, a measurement or a studio law)

The full list with the reasoning is `RULES.md`; these are the ones a builder would otherwise trip on tonight.

1. **The master table has two wrong cells** (spec 2.3 says "permanently true, must never drift" and 15.1 says do
   not proceed until the harness matches it, which would have blocked P0 forever). d4 vs TN 4 is 25.0 percent, not
   31.3; d6 vs TN 6 is 16.7, not 22.2. When TN equals the die's top face, only the top face can pass. The corrected
   table is RULES R1.4 and the `--table` gate reproduces it; the closed form is there too. The floor table's d12
   floor 6 row is 7.75, not 7.58 (R1.5).
2. **Armor was never defined.** R3.4: a pool that absorbs Strain, full at quest start, refilled on every bench, never
   on self paid costs; distinct from "1 less from Strikes", which is boss only.
3. **Where boss Strikes land was never defined** ("deals 2 Strain to the party" kills everyone in two rounds if it
   means each). R7.4 defines three laws and rules that `attackers` is the one the spec's own boss arithmetic supports; `all` wipes a fresh party in two rounds and `spread` makes a Vanguard immune to the boss. BALANCE.STRIKE_TARGET is `attackers`.
4. **Strain at Depth I.** The spec's "Undertow: Strain does not clear between stages" implies it clears at I and II,
   which makes the bench, Mend and Warden meaningless there and makes death outside the boss impossible. R5.7 and
   R8.3: Strain persists through a quest at every Depth; Depth I and II get a Respite of BALANCE.RESPITE
   (1) per stage for everyone; III and deeper get none; between quests Strain persists unless the character
   sits the quest out or the Hall is paid for Mend.
5. **Lanternborn did nothing.** "Reveal one TN before assigning" on a game where TNs are visible. R4.6: hidden TNs
   are shown to a Lanternborn party, and the next stage's stats are previewed.
6. **Retire at 2 Marrow was a Renown to Marrow converter** (Recruit 25 Renown, Retire 2 Marrow). R2.6: retirement
   needs one quest survived; a fresh character is dismissed for nothing.
7. **Names that break the copy law:** Sure-Handed is Surehanded, Press-gang is Pressgang, Sigil-Ward is Sigil Ward
   (the slot) and Ward (the item). Nothing a player reads carries a dash.
8. **"Never more than three cards to choose from"** is a rule about DECISIONS (Callings, Traits, the locked
   Origins), not about lists you own (a Roster of eight, a wall of the dead). The drop screen shows one relic and
   three characters to put it on, which is three cards to choose from.
9. **Toll's stat, Chain's stat, Relay's bodies, Relay plus Relay, the forfeit slot, replacement mid quest,
   Withdraw:** all pinned in R5.5, R5.6, R5.10, R5.11.
10. **Sigil stacking:** no exclusion table (R9.2). **Depth IV "Vaults mandatory":** SEALED stages (R9.1).
11. **Toughness 4 is a BALANCE number**, as the spec asks; the prototype's grid is the evidence and the default is
    4 until `proto/PROTO-REPORT.md` says otherwise. The spec's own expectation is that it lands between 3 and 5.
12. **Numbers in the spec's prose that the audit measured and found wrong**, none of which change the build but all
    of which a reader would otherwise quote: the ceiling in 11.5 is 80 points at Depth V, not 64 (8 points a slot is
    the Depth III budget), plus a unique on every Relic rarity item; the average rung column in 3.3 is off in three
    of five rows (7.02, 7.54, 7.94, not 7.1, 7.6, 8.0); "+1 expected value per rung with or without Surge" in 2.1 is
    +1 exactly without and +0.87 to +0.98 with, worst at the bottom of the ladder; 8.6's "about 4 failures, about
    1.33 each" is 3.8 and 1.28 over the real 12.8 check quest; the floor table in 2.4 uses plain means while 2.3
    declares every value includes Surge, so the harness asserts the GAINS, which are identical either way; "a good
    run buys a Commission or a Scar excision" is false for both at about 35 Renown a run; and the art total in 12 is
    73 with 38 icons, not 76 and 46.
13. **The spec's 76 art assets** are not a launch dependency: every one is drawn by code tonight (section 7), and
    the sheets for Stephen's generator are the upgrade path.

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/marrowdeep/`):

```
index.html                 the whole game, single file, no build, no framework, no image
sim.js                     headless runner: --table --test --data --balance=N --depths --replay=<seed>
                           --over=KEY=VAL --watch=<seed>
sw.js                      copied from fathom, marrowdeep-* caches only
manifest.webmanifest
icon-192.png  icon-512.png  icon-maskable-512.png     from tools/icons.mjs
data/*.json                copied from plans/marrowdeep/data/ (the source of the DATA block; tools/data.mjs inlines them)
tools/check.js             the one command; prints ALL GATES PASSED
tools/lint.mjs  tools/data.mjs  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/harness.mjs  test/boot.mjs  test/play.mjs  test/layout.mjs  test/save.mjs  test/audio.mjs
docs/DECISIONS.md  docs/BUILD-NOTES.md  docs/ART_ASSETS.md  docs/shots/  docs/thumb.png
```

Layer order inside `index.html`: `BALANCE, RNG, DATA, EFFECTS, DICE, GEN, SIM, VIEW, AUDIO, INPUT, SAVE, TEST, BOOT`.
The SIM markers wrap BALANCE through SIM; the TEST markers wrap TEST. `sim.js` extracts both and runs them in Node, so
there is exactly one implementation of the rules and the bot plays the same game the thumb does.

**BALANCE (frozen; a number that must change changes here and nowhere else).** The proto's object, verbatim, with
the audit's reasoned defaults, which a tuning pass may still move: `BASE_TOUGHNESS 4`, `RESPITE 1`, `STRIKE` 1 at Depth I and II, 2 at III, 3 at IV and V, `STRIKE_TARGET
'attackers'`, `RETIRE_VESTING 3`, `SCAR_EVERY 2`, `FILLER_MAX 2`, `PRICE_INDEX`, `REST_FRACTION 1`, `SLOT_WEIGHTS` all 1, `BENCH_CLEAR 1`, `GATE_TN_WEIGHTS`, `RENOWN` per shape, `DEPTH_RENOWN_MULT`, `DEPTH_MARROW_MULT`,
`SALVAGE` by rarity, the Renown tier thresholds and weight rows, the drop weights and point budgets by Depth, the
composition tables, the stat frequency rows, the Hall prices, the Depth unlock counts, `SAVE_KEY 'lw_marrowdeep_v1'`,
`SAVE_V 1`, `GAME_ID 'marrowdeep'`.

`sim.js --over=KEY=VAL` runs any sweep against an override without editing the game. ⛔ Fathom's implementation
substitutes a numeric LITERAL and throws on anything else, so as inherited it cannot sweep the two calls this game
most needs swept: `STRIKE_TARGET` is a string and `STRIKE` and `RESPITE` are arrays by Depth. Extend it to accept a
quoted string and `KEY[i]=VAL`, keep the throw on an unknown key, and say in this section which BALANCE entries are
scalars, which are arrays by Depth and which are strings. Watch it fail with `--over=STRIKE_TARGET='all'` and
`--over=RESPITE[0]=0` and confirm the run really changed.

**RNG.** mulberry32 over a uint32 state; `mixSeed(seed, salt)`; `seedFromString`. The account save carries
`rng: { seed, n }`; the engine's `draw()` advances `n`, so a saved game resumes on the same stream. A quest is
generated from `mixSeed(account.rng.seed, depth * 1000003 + account.attempts[depth])` at the offer, where
`attempts[depth]` counts quests at that Depth that have ENDED, won or wiped, so the offer shows exactly what will be
played. A single salt over `questCount` broke R9.4 in both directions (audit): a wipe does not move `questCount`, so
the re roll after a wipe dealt back the byte identical quest, the same Sigils and the same boss; and a Depth I win
did move it, so all five offers changed at once, which is the cheap re roll R9.4 exists to forbid. VIEW's
cosmetic randomness (the tumble's face sequence, and nothing else: section 7 lists every moving element and what it
tells the player, and anything not on that list is cut) uses its OWN stream, `mixSeed(seed, 0xC0)`, so drawing never
consumes a game draw (the Jimothy two stream scar). `Math.random` does not appear in the file; TEST greps the SIM
export for it and fails.

**DATA.** The eleven content files inlined as one literal `var DATA = {...}` by `tools/data.mjs`, which reads
`data/*.json` and writes the block between `// ---- DATA_START ----` and `// ---- DATA_END ----`.
⛔ **The field contract, and it is the difference between working content and silently inert content.** The authored
files say `effects` and `text`; the engine reads `eff` and `line`. Inlining them unchanged makes all twenty uniques
and every authored Trait do NOTHING, and the engine's own unknown key guard passes vacuously because it reads
`tr.eff || []`. `tools/data.mjs` NORMALISES on the way in (`effects` to `eff`, `text` to `line`); the fence forbids
editing `data/`, so the transform belongs in the tool and nowhere else. Then `--data` asserts the RELATIONSHIP and
not the spelling: every Trait, unique, Origin, Calling and affix record compiles to at least one effect, and every
compiled effect's `k` is in the R12 vocabulary.
⛔ **`traits.json` REPLACES the engine's seeded twelve, it does not merge with them.** Eleven of its twenty four ids
are the seeded ones and the twelfth differs only by an underscore (`ninth_hour` against `ninthHour`), so a merge
gives a thirty six entry deal pool weighted double for eleven Traits and two different Ninth Hours one character can
own at once. `--data` asserts exactly twenty four distinct ids with no two differing only by case or underscore.
⛔ **The eight Origins, eight Callings, the affix table, the six Sigils and the five Depth names STAY IN THE ENGINE**
as the effect vocabulary's own source, because the engine references them throughout and section 2 says it goes in
verbatim. DATA holds the eleven authored files and nothing else.
`sim.js --data` compiles every entry and refuses an unknown effect key or `when`, a dash or a bang in any string, a
duplicate id, a boss without four Aspects on four stats, an affix key with no words, and a generated relic name with
`undefined` in it (1,000 names generated), and any mismatch in EITHER direction between the affix keys the
generator draws and the keys the word list carries.

**EFFECTS.** The one resolver of RULES R12. `EFFECTS.collect(character, ctx)` gathers every effect from Origin,
Calling, Traits and worn relics; `EFFECTS.query(list, k, ctx)` answers the engine at the moments R12 names. Nothing
else in the engine knows a Calling from a Trait.

**DICE.** `roll(die, ctx)` per R1. Returns `{ natural, floored, chain: [naturals], base, mods: [{src, v}], push,
total, surged }` so the RESULT card can show every part and the sim can log it.

**GEN.** `newCharacter(account, rng)`, `dealCallings(account, rng)`, **`newQuest(depth, seed)`** (stages, slots, sigils, bosses, all rolled at once),
where the Hall computes `seed = mixSeed(account.rng.seed, depth * 1000003 + account.attempts[depth])` and
`endQuest` increments `attempts[depth]` on a win AND on a wipe. ⛔ The signature takes a SEED, not an `rng` object:
an rng argument cannot coexist with deriving the stream from a salt, and the earlier draft gave both. No offer is
stored in the save, because it is derived. The engine ships `newQuest(seed, depth, opts)` with no account and no
attempts, so **this machinery is one of the two things genuinely missing from the prototype** and P0 step 0 says so, `newRelic(depth, slot, rarity, rng)`, `nameRelic`, `nameCharacter`.

**SIM.** `assign(quest, plan)` validates and applies an assignment (R5.6), `resolveNext(state)` resolves ONE check
and returns the RESULT (so the page can stop on every card), `endStage(state)`, `bossRound(state, plan)`,
`endQuest(state)`, `applyDrop(state, relicId, choice)`, `hall.*` (every Hall purchase, each refusing when it cannot
pay), `death(state, charId, cause)`, `retire`, `dismiss`. Every function is pure over `state` and `rng`. The quest
state carries `step` and `cursor` so the page can restore to the exact card after a reload. **The enum is
`assign | preroll | result | strike | death | drop | stageEnd | replace | boss | rewards | wipe | aftermathScar |
aftermathTrait | done`** (audit: six screens that stop and wait for CONTINUE had no state to restore into, and a
player who wiped would have landed in the Hall having never read what the wipe paid). `cursor` has a defined meaning
in each: the check index, the Aspect index, the survivor index, the drop index.
⛔ **This enum is a REQUIREMENT and the engine does not have it yet.** The engine ships nine steps
(`assign, check, stageEnd, bossAssign, bossCheck, strike, bossWon, won, lost`), three of which overlap, and five of
the prototype's assertions name them directly. Renaming and splitting them to the fourteen, and updating those five
assertions without losing the count, is a named P1 step, not something to discover at the save gate. The same
reconciliation applies to two other pairs of names that mean one thing: `pending` against the engine's
`pendingDrops`, and `recent` against its `textRing`. Pick one name each and use it everywhere. **`bossRound(state, plan)` sets the
round UP only**; every check at the boss goes through `resolveNext` like every other check and the strike is its own
transition, or the boss cannot stop on every card.
**`quest.pending`, and `save.pending` outside a quest, holds every rolled artefact the moment it is produced and
BEFORE it is painted**: the RESULT object, the drop queue as generated relics, the dealt Trait, Calling and Origin
ids. The save is written at EVERY step transition, not at stage end. Without it a reload mid RESULT restores a card
with no numbers and then skips the check, because the roll has already advanced `rng.n`, and the Trait deal is save
scummable. Three drop flows run with `quest` null (a Commission, a retired character's gear, a dead character's
gear), which is why the queue lives one level up: a reload after paying 40 Renown for a Commission would otherwise
lose the three relics and the Renown with them. Events come out on `state.events` (`roll`,
`surge`, `pass`, `fail`, `strain`, `death`, `bench`, `respite`, `break`, `strike`, `won`, `wiped`, `renown`,
`marrow`, `legacy`, `trait`, `scar`) so VIEW and AUDIO consume them without the sim knowing they exist.

**The policy** (`SIM.policy.assign(state)`, `policy.boss(state)`, `policy.push`, `policy.trait`, `policy.drop`,
`policy.hall`) is the proto's "reasonable player", kept INSIDE the SIM export so the browser gates can ask the page
what a reasonable player would tap and then tap it with real pointers. It is never called by VIEW.

**VIEW.** DOM, not canvas, for everything but the dice: screens are `.screen` panels of cards and buttons (the fleet
pattern; the layout gate measures real rects). The five dice are inline SVG symbols (a triangle, a square, a diamond,
a kite, a pentagon, each with its number) tumbled by CSS (rotate and scale, faces cycling from the cosmetic stream,
settle on the natural; a surge is a second die sliding in beside the first with a plus). Palette in section 7. DPR
aware nothing: it is DOM.

**AUDIO.** Web Audio, synthesised, nothing fetched. Voices: tumble (three to five short filtered noise ticks while
the faces cycle), settle (a wood knock, 90 ms), surge (a rising two note chime, 250 ms), pass (a low warm tone,
200 ms), fail (a dull thud, 120 ms), strain (a heartbeat thump, two hits), death (a low bell, 2.5 s decay), break
(a chain snap: a noise burst into a low thump), strike (a deep hit with a short tail), renown (a coin tick), marrow
(a hollow bone note), trait (a soft three note chord). Each voice has its own peak gain of at most 0.3 into a master
GainNode at 0.7. ⛔ A compressor is not a ceiling (Updraft, Sep 08): no lookahead, so a spike passes it whole. The
ceiling is the per voice gain, and THE EAR GATE measures it. ⛔ A tremolo or trill oscillator is never wired INTO a
gain that is also the envelope (Gerplunk's fire alarm). `MD_DEV.renderAudio(secs)` renders the loudest minute
(a boss round with three strikes, two surges, a death, a break, six tumbles) into an OfflineAudioContext through the
same functions the speaker uses and returns `{ peak, rms, highFraction }`. Sound toggle in the save. Every voice
starts behind the first `pointerdown`.

**INPUT.** Pointer events only. Assignment is tap a character then tap a card, or a card then a character. RESOLVE
is a button. No drags anywhere (a card game does not need them; a drag on a two core headless rig reads as a hold).
Three gesture rules the audit forced, because "tapping an assigned character clears it" forbade the doubling R5.6
makes MANDATORY at Relay plus Relay and at every Depth IV boss round:
(1) tapping an assigned character SELECTS it for a further seat whenever doubling is legal (checks outnumber living
deployed), and clears it only on a second tap while selected, or on the seat's own X;
(2) tapping a character onto an occupied seat REPLACES the occupant, who returns unassigned;
(3) a Relay card's seats are numbered 1 and 2, each labelled with its OWN stat glyph and TN (R5.5 rolls them
independently), filled in tap order, and tapping seat 1's portrait swaps the two.
PUSH and TWICE are NOT on the character card: they live on the pre roll strip (R5.7). Two 48 px chips do not fit on
a third of a 320 px screen, so the card that carried them went red on the layout gate at exactly the width the gate
runs.

**SAVE.** `lw_marrowdeep_v1`: `{ v, seq, account (spec 14 plus `rng`, `renownLifetime`, `freeRolls`,
`attempts[depth]`), roster: [characters], relics: {id: relic} (worn, shelved and pending only; a salvaged id is
deleted), quest: null | questState, pending: null | { kind, relics, targets }, wall: [{id, name, origin, calling,
quests, depth, cause, t}], recent: [lineId] (the last three quests' challenge lines, R10.1), sound,
seen: { how, legacies: [id] } }`. The wall merges by union on `id`, newest first by `t`. Read, modify, write on EVERY
write; `account.renownLifetime`, `questsCompleted`, and every wall entry MAX merge; the in progress `quest` carries `tab` and `beat` (a
timestamp written on every save), and another tab shows "This quest is open in another tab" with a TAKE OVER button
ONLY when the tab id differs AND `now - beat < 60000`; otherwise it adopts silently and writes its own tab id.
**The token covers the ACCOUNT, not just the quest**, because the Hall is where the money is: two tabs both sitting
in the Hall at 60 Renown, one buying a Commission and the other a Recruit, would each write 20 and the account would
have paid 40 for both. A tab that is not the holder while the heartbeat is live is READ ONLY in the Hall, every
SPEND button greyed with one line and TAKE OVER offered, exactly as it already is for a quest;
`sessionStorage` does not survive a closed tab, so without the heartbeat the ordinary way a phone player comes back
to a quest, closing the app and opening it tomorrow, charged them a takeover every single time; a `storage` event reloads the state; a wipe of the account writes
directly. ⛔ Unknown top level fields are PRESERVED on write (`Object.assign(blank(), got, sanitized)`), never
rebuilt from a whitelist. `test/save.mjs` plants a stranger field and asserts it survives a write.

**TEST.** The Fathom harness. **`ASSERTION_FLOOR` is whatever `node plans/marrowdeep/proto/sim.mjs --test` prints at P0 step 0** (350 on Sep 08 at
13:12; write the number you see, not this one), and `sim.js` exits 3 if the
count ever drops under it. This is the only place the floor is written (an earlier draft gave it in three places as
60, "the proto's count" and 120, and 120 was 168 assertions BELOW the starting point, so it was a lowering dressed
as a raise). Raise it at the end of every phase to that phase's real count and watch it fail by commenting out one
block. What it asserts is in section 5 under each phase.

**BOOT.** Registers `./sw.js?v=<stamp>` after `load`, posts `ready`, reads the save, shows the title (CONTINUE if a
save exists, BEGIN otherwise). **CONTINUE routes on three tests in order** (audit): `quest` is not null goes to the
quest at its own `step`; else `account.freeRolls > 0` goes to Creation; else the Hall. Without the middle test a
first run interrupted after one of the three free characters resumes into a Hall holding one character, no Renown, a
Recruit priced at 25 and no stray (the stray needs an EMPTY roster), with its two free rolls unreachable. `window.MD_DEV = { stamp, ready, screen, state, account, quest, card (the RESULT
card's numbers as shown), policy, renderAudio, seed(n) (sets the account rng before BEGIN; a gate may call this
because it sets a seed, not a state), fixture(save) (writes a save and RELOADS) }`.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts: change the number or the code it guards, see red, put it back,
see green, paste both lines into the ledger. A gate that drives the game through an internal feed instead of the
thumb's path is decoration. A count in a gate is written as the LAW ("at least twelve Gate lines per stat"), not as
the number in the file today. A ratio in a gate is a literal, never the constant divided out.

### P0. The engine in the page, and the gate that fails (about 1.5 hours)

0. **First, check what you inherited.** `node plans/marrowdeep/proto/sim.mjs --table` must print TABLE OK and
   `--test` must print MD TEST OK. If either is missing or red, the prototype did not finish: say so in SESSION
   STATE, and write the engine yourself from `RULES.md` (which is complete and self contained; the prototype is a
   head start, never the source of truth) with `--table` as your first gate, since the corrected table in R1.4 is
   what the engine has to reproduce. Do not paste a half written engine.
   ⛔ **The prototype was written while `RULES.md` was still being corrected by the audit, so assume it lags.**
   Before pasting, check the engine for these by name and add whatever is missing, because each is a rule the
   prototype's own gates would not have caught: `FILLER_MAX` and the affix fill of R6.2 (with `toughness` and
   `armor` repeatable and the drop to a lower budget), `benchAlly` as a Feet affix and the Ward's second Sigil,
   the Vault at 8 Renown with two relic rolls (R5.9), `PRICE_INDEX` (R8.0b), `REST_FRACTION` (R8.3),
   `questsCompleted` only at the deepest unlocked Depth (R8.4), one stock Calling always in the deal (R8.7), the
   drop screen's target row between quests (R6.7), and the three quest recently used ring for challenge lines
   (R10.1). Every one of them is a `--test` assertion you write before you write the code.
   ⛔ **Checked at 13:20 on Sep 08 and this list was already done**: both of the earlier known breaks are fixed in
   the engine (`benchAlly` is a Feet affix, `condDeadAlly` matches the word list, 25 keys against 25 word lists with
   no miss in either direction), and so are `FILLER_MAX`, `PRICE_INDEX`, `REST_FRACTION`, `RETIRE_VESTING`,
   `SCAR_EVERY`, the Vault's 8 Renown and two rolls, and the Depth IV drop row. Verify with `--test` and move on.
   **Exactly two things are genuinely missing from the prototype**, and both are named where they belong: the
   offer and `attempts[depth]` machinery (section 4 RNG and GEN), and the DORMANT fourth Aspect (R7.1).
   ⛔ And know what green does NOT cover: the prototype's assertions run against the engine's own PLACEHOLDER banks,
   never against `data/*.json` (there is no `readFile` in it). `MD TEST OK` is a statement about the rules, not
   about the eleven files. The first thing `--data` does is load the real files and rerun the R6, R7 and R10 blocks
   against them.
   Then make the `--data` gate assert the affix keys in BOTH directions, because one direction misses half the
   failures: every affix key the generator can draw has a word list, AND every word list key is a key it can draw.
1. `index.html` with the head, the layer skeleton, the markers, and the proto engine pasted between the SIM markers
   (`BALANCE` through `SIM`), the eleven data files copied to `data/` and inlined by `tools/data.mjs`, VIEW painting
   the title screen only (MARROWDEEP, the title line from `lines.json`, BEGIN, HOW), BOOT posting `ready`. `sw.js`,
   manifest, icons from `tools/icons.mjs` (one motif: a d8 seen from above, bone on ink, with a single red marrow dot
   at its centre). `var STAMP = '20260908a'`.
2. `sim.js` from Fathom's, exports renamed. `--table` (the proto's, prints TABLE OK), `--test` (the proto's
   assertions, all kept), `--data` (section 4).
3. `tools/check.js` with `lint`, `table`, `test`, `data` (node) and `boot` (browser, **title screen only**: loads
   clean over the static server, `ready` posted from inside an iframe, `document.title` is MARROWDEEP, the stamp is
   in the HTML, BEGIN is present and 48 px and reachable by `elementFromPoint`, and one pixel inside the TITLE's own
   die motif is not the background colour). The BEGIN to creation assertion belongs to P1's boot gate, because P0
   step 1 builds the title screen only and a gate must never ask for a screen its own phase forbids.
4. Watch each new gate fail once, with a recipe that actually bites. ⛔ NOT "set a surge threshold to die minus 2":
   R1.2's cap is implemented inside the threshold function itself (`Math.max(die - surgeMinus, die - 1)`), so that
   edit changes nothing and d4 against TN 3 stays at 50.1 against 50.2, inside the gate's own tolerance. It was
   measured. Use instead: **`table`**, return `die - 2` from INSIDE `surgeThreshold`, past the `Math.max`, and watch
   d4 against TN 3 move from 50.1 to about 56; or raise the floor cap by one and watch the d12 floor 6 gain leave
   1.25. **`data`**, plant a hyphen in one Gate line, and separately rename one `eff` back to `effects` and watch the
   compile assertion catch the inert record. **`boot`**, remove the BEGIN handler. Put every one back and paste both
   columns into the ledger.
5. **Commit "marrowdeep P0: the engine in the page, five gates" and push.**

Ends with: `docs/shots/p0-title.png` at 375x667. Open it. Name three things wrong.

### P1. One whole quest at Depth I, on the phone, by taps (about 4 hours; the game exists when this is green)

1. **Creation.** ROLL: four dice tumble and settle (the natural is the stat's die size shown as the die shape, so a
   d12 settles as a big pentagon reading 12), the Origin card turns, three Calling cards deal in; tap one; the name
   appears; KEEP. REDEAL under the cards (greyed until Renown allows). **BEGIN runs creation three times**
   (`account.freeRolls` 3, R2.1): a new account has no Renown and Recruit costs 25, so the three free bodies are the
   only way the first quest is a party rather than one character alone at a boss.
2. **The Hall and Deploy, minimum.** Renown and Marrow counters, one Depth I offer card (Sigils, the boss's name and
   three stat glyphs), DEPLOY. The Deploy screen is in THIS phase, not P2, with its order numbers on the ticks:
   party order is the DEPLOY tap order (R13.5) and it decides boss resolution, Herald, Hearthborn and every last
   check, so an auto deployed party silently freezes it to roster order and the seam gate in step 10 taps a screen
   that would not exist. GO.
3. **The Quest screen.** Stage title and count; two challenge cards (shape icon, stat glyph(s), TN, reward, tags, the
   line); three character cards (portrait, name, four small dice, Strain pips over Toughness, Armor pips). Tap a
   character then a card (or the reverse) to assign; a Relay card holds two; the bench is whoever is left and the
   card says BENCH. (PUSH and TWICE are NOT on the character card, they are on the pre roll strip in step 4); the Vault and Open cards ask for
   the stat with four glyph buttons. RESOLVE when every slot is filled.
4. **The pre roll strip and the RESULT card**, one per check (R5.7). The strip first: the character, the stat die,
   the TN, the consequence glyph for that stat, a PUSH chip and a TWICE chip when either is available, and ROLL. A
   Chain's second check gets its own strip, so a player decides to Push it having seen the first. A modifier worth
   nothing in this cell prints as "no effect" (R13.16). Then the RESULT card: the character, the challenge, the die tumbling and settling on the natural,
   the surge die sliding in, the floor shown as a raised face, every modifier as a chip with its source, the total
   against the TN, PASS or FAIL in the stat's colour, the Strain taken with a pip filling, the consequence line
   (Ambush, Blindness, contagion), and CONTINUE; REROLL beside it when a reroll is available. Nothing advances on a
   timer. **Stop here and feel test:** shoot `docs/shots/p1-result-surge.png` mid surge at 375x667. Open it. If the
   surge does not read as the best moment of the game, fix the tumble, the slide and the chime before building on.
5. **Stage end sheet:** who benched and what cleared, Respite, Renown earned, then the drop screen(s) (one relic,
   the three characters as small cards with their current item in that slot and the delta, TAKE RENOWN, TO THE SHELF
   when it applies), NEXT. Replacement offer when someone died (P2 wires the roster; P1 offers RECRUIT only when
   Renown allows and CONTINUE SHORT HANDED).
6. **The boss.** Three Aspect cards with hit point pips, stat glyph, TN and the line; three character cards; round
   counter; the party Strain bar. Assign, RESOLVE, the RESULT cards, then the STRIKE animation (each unbroken Aspect
   flashes, the struck cards shake, pips fill), next round. Break: the Aspect card cracks to bone. Win: the boss card
   falls away, the rewards sheet. Death mid quest: the character card goes to bone, one line, CONTINUE.
7. **Aftermath, minimum.** Won: rewards, drops, then per survivor the Scar line and three Trait cards, pick one.
   Lost: the wipe card with the salvage line. Then the Hall. Every quest the account plays advances
   `questsCompleted` on a win, and the tier.
8. `sim.js --test` grows with the page's needs: `resolveNext` stops after one check; `step` and `cursor` round trip
   through JSON; the events list for a stage names every roll; the policy never assigns a dead character; a Push that
   would kill is refused; the offer's quest equals the played quest for the same seed.
9. `sim.js --replay=<seed>`: plays one whole Depth I quest headless with the policy from a fresh tier 1 account and
   prints the final account JSON and the roll log.
10. `test/play.mjs` (browser, real taps at 375x667, THE SEAM GATE). ⛔ It runs a SET of seeds, not one: a single
    Depth I quest can easily contain no Vault, no Toll, no Relay, no Ambush, no contagion, no hidden TN, no death
    and no boss retarget, so one seed proves the seam only for the shapes that seed happened to deal. Choose the
    smallest set of seeds that between them deal all six shapes, both sources of a hidden TN (a WITS failure and
    Blindfold), an Ambush consumed, a NERVE contagion landing on a third party, a mid stage death and a boss
    retarget; the gate collects the shape and event names it actually saw from `state.events` and FAILS naming what
    it never saw, so a future content change that stops dealing a shape turns it red instead of quietly shrinking
    it. For each seed: `MD_DEV.seed(<seed>)` on the title; BEGIN; then three
    times ROLL, the first Calling, KEEP; DEPLOY three; GO; then for every stage asks `MD_DEV.policy.assign(state)` and makes those
    assignments with real taps on the character and challenge cards (the gate taps what the policy says; the page
    never calls the policy itself), RESOLVE, CONTINUE through every RESULT card reading each card's numbers off the
    DOM, TAKE RENOWN on every drop, NEXT; the boss the same way with `policy.boss`; the first Trait card for each
    survivor; the Hall. Asserts: every RESULT card's total equals the sim's roll log entry for that step (the seam:
    the page's answer equals the sim's for the same tuple); the final account JSON on the page equals
    `sim.js --replay=20260908` byte for byte (Renown, Marrow, roster, wall); the quest ended in `won` or `wiped`,
    and whichever it was, the Hall shows it; no console error anywhere on the path. Watch it fail by adding 1 to
    the page's Renown display.
11. `test/layout.mjs` (P1 subset): title, creation, Hall, Quest with a Relay stage, RESULT, boss, Trait pick, at
    375x667, 320x568 and 412x915 (states reached by real taps from a seeded save written by `MD_DEV.fixture` and a
    reload): every button 48 px and on top; the bottom left 120 by 120 empty on every screen; the two challenge cards
    and three character cards all fully inside the viewport with nothing scrolled off at 320x568.
12. **Commit after each of 1, 4, 6, 7 and 10 is green. Push each time.**

Ends with: `p1-creation.png`, `p1-quest.png`, `p1-result-surge.png`, `p1-boss-strike.png`, `p1-trait.png`. Three
faults each, written in the ledger.

### P2. The account: Roster, Character, the Hall's shelves, death and the wall (about 4 hours)

1. **Roster.** Up to eight cards; DEPLOY from the offer marks three (a character with Toughness 0 or less shows
   "Needs Toughness" and cannot be marked); tap through to Character.
2. **Character.** Portrait, Origin and Calling blurbs, four big dice, eight slot tiles (glyph, the item's name and
   points, empty tiles say the slot's mechanic in two words: "Floors", "Toughness", "Die steps", "Positioning",
   "Surplus", "Rerolls", "Wards", "Oddities"), Traits, Scars, Toughness and Strain and Armor, RETIRE (or DISMISS for
   a character with no quest survived), EXCISE A SCAR, and on a tile: MOVE TO (a roster sheet) and TAKE RENOWN.
3. **The Hall's two sheets.** SPEND RENOWN: Reforge (pick a character, a tile, a line), Commission (pick a slot;
   three relics on the drop screen, keep one), Recruit, Redeal (only on a character with no quest yet), Mend, Excise,
   Ward Shelf slot. SPEND MARROW: Raise a creation floor (a stat), Roster slot, Legacy slot, Unlock an Origin (three
   cards, pick one), Consecrate a Legacy (the Legacy list, tap one). Every button shows its price and greys when the
   account cannot pay; every purchase is a SIM `hall.*` call that refuses when it cannot pay, and TEST asserts each
   refusal.
4. **The Ward Shelf.** A row of Ward cards (a bought but empty slot is an empty tile that says "empty"), tap a Ward
   then a deployed character to swap it in; the swapped out Ward returns to the shelf.
5. **Death and Legacy, complete.** The death moment (card to bone, the line, CONTINUE), the Legacy card shown once in
   the Hall, THE WALL (every line newest first, scrolling, nothing tappable), the Legacy deal into creation (R8.7),
   consecration.
6. **Replacement mid quest** from the roster (R5.10).
7. **The gear salvage of the dead** (R6.8) and the wipe salvage line.
8. `sim.js --test` grows: every Hall purchase pays and refuses; MOVE TO between two characters; the shelf swap; the
   Legacy deal with a consecrated card, with two Legacy slots and a pool of one, with an empty pool; the wall line
   for a death, a retirement, a dismissal (none); replacement from the roster only when the reserve is deployable;
   dead gear offered to survivors; wipe salvage equals the SALVAGE sum. Floor raised to the real count at the end of the phase, never to a number below where it started.
9. `test/save.mjs` (browser): reload on a RESULT card restores the same card with the SAME numbers (the roll is in
   `quest.pending`, not re derived, so this is only true if the save was written at the step transition); reload on
   a drop screen restores the drop; reload on a Trait pick restores the same three cards, twenty times over, so the
   deal cannot be save scummed; reload mid Commission still holds its three relics and has not spent the Renown
   twice; a stranger field planted in the save
   survives a write; two tabs inside the heartbeat window: the second shows the takeover card and TAKE
   OVER adopts the quest; a second tab opened after the heartbeat has lapsed adopts silently with no card; and
   `account.renownLifetime` never goes backwards across the two tabs (Renown ITSELF goes backwards constantly and
   correctly, every time the Hall is paid, so asserting on Renown would be asserting a falsehood).
10. **Two fixtures, not one.** `MD_DEV.fixture(save)` writes a save and RELOADS, so the page BOOTS into the state
    rather than being set into it. FRESH is a new account. **LATE** is the one that finds the breaks: eight roster
    characters, one with four Traits, three Scars and eight relics worn, five Depths unlocked with their offers
    showing, six Ward Shelf slots filled, a two hundred line wall, and Renown and Marrow both at five figures so the
    counters are at their widest. Every layout assertion and every shot runs on BOTH. Every screen that will
    actually overflow is a late game screen, and a suite that only ever boots a fresh account never sees one.
10b. `test/layout.mjs` complete: every screen and every sheet, every button, every BACK; the shelf row inside its
    parent's rect (the scroll row in a flex column scar); the wall scrolls and its first line is under the counters
    at 320x568; the `.pin` footer's rect on screen at 320x568 with the body scrolled to its end; a three card deal's
    cards at least 260 px wide at 320; and the Depth IV boss with FOUR Aspect cards at 320x568 from a fixture, with
    a shot of it opened and three faults named.
11. **Commit after each of 1, 3, 5 and 9 is green. Push.**

Ends with: `p2-roster.png`, `p2-character.png`, `p2-hall-renown.png`, `p2-wall.png`, `p2-death.png`. Three faults each.

### P3. The Depths, Sigils, the ear, the shell, and the polish (about 4 hours; where the first day may stop)

1. **Depths II to V** from BALANCE (R9.1): the eight stage shapes, two bosses, the fourth Aspect, SEALED stages,
   Relic only drops, no replacement. Unlocks by `questsCompleted`. The offer cards for every unlocked Depth.
2. **Sigils** on the offer and in play: the six effects (R9.2), Wards immune and partial (R9.3), the Sigil marks on
   the Quest screen's title row for the whole quest.
3. **AUDIO**, every voice of section 4, `game-music` posted at GO.
4. **HOW** (six lines from `lines.json`), shown once before the first quest and from the title; sound toggle;
   reduced motion (no tumble, the die settles at once).
5. `sim.js --balance=2000`: 200 accounts, ten quests each at Depth I with the policy, asserting as a LAW (a smoke
   alarm, not a pin): per character death between 8 and 20 percent, at least one death between 25 and 50, **wipe
   between 0.5 and 6**, Renown per quest between 25 and 50, Marrow per quest between 0.8 and 2.5.
   ⛔⛔ Those bands are asserted over the PRE BOSS stages only, and the whole quest numbers are PRINTED beside them
   and never asserted, until Stephen answers Director call 1. Two independent simulations say the boss as specified
   costs far more than any whole quest band the spec states, and a harness that fails on a number nobody has ruled
   on teaches the next reader to ignore it.
   ⛔ The wipe band is NOT the spec's 8 percent, because the spec's three death numbers cannot all be true at once
   (audit): with at least one death at 35 percent and a full wipe at 8, the expected deaths per run are at least
   0.27 + 0.24 = 0.51, which forces a per character rate of at least 17 percent, above the stated 12 to 15, and
   above the 0.4 Legacies a run that the whole Marrow income is built on. Anchor on the two that the economy needs
   (0.4 Legacies and 35 percent at least one death) and the third is derived: per character 13.3 percent and a full
   wipe at **2.5 percent or less**. Tuning to the printed 8 would be tuning to a point that does not exist. Watch it fail with
   `--over=BASE_TOUGHNESS=1`. `sim.js --depths`: 200 quests generated at each of II to V with the policy playing
   them, and **the first assertion is that the Depth is WINNABLE**, a win rate above zero at each of II to V, naming
   the Depth that failed (as specified, IV and V were 0 wins in 200 with every character dead, and no gate in the
   plan looked for it); then every stage has two slots, every Depth IV and V boss has four Aspects on four stats, every SEALED stage
   ends only on a passed Vault or a wipe, Depth V never offers replacement, and **no Depth V drop is
   Common while the Relic share over 2000 drops sits between 10 and 20 percent** (R6.1b; an earlier draft asserted
   "all Relic rarity", which is the spec prose R6.1b overturned, so the gate would have enforced the error).
6. `test/audio.mjs`: THE EAR GATE. `renderAudio(60)`: peak under 0.9, rms between 0.02 and 0.12, and the share
   above 3 kHz under **the value you MEASURE plus a stated margin**, with one line in the file saying what was
   measured and when. The inherited gate sits at 0.10 and its header says why: that band is where an alarm lives,
   and the scar behind it is a sibling game's tremolo reading as a fire alarm in his house. Marrowdeep's palette is
   brighter (a chain snap, a coin tick, a chime), so the ceiling may honestly move, but it moves to a number
   somebody measured, never to a round one somebody liked. Also assert and the death bell's tail longer than 1.5 s (measured, not asserted from the constant). Watch it fail
   by setting the strike voice's gain to 1.0.
7. `tools/shots.mjs`: title, creation, quest, pre roll, result mid surge, boss mid strike, Hall, wall, at the three
   widths and **on both fixtures** (P2 step 10), plus a `--thumb` mode that composites a 90 px disc at the last
   tapped point, so a control sitting under the pad that just pressed it shows up in the shot. That is the Gerplunk
   scar: a ring passed every look pass because no shot had a thumb in it, and on glass it sat under the pad.
   Open all. `tools/thumb.mjs`: the boss screen mid strike, HUD hidden, square, under 150 KB, to `docs/thumb.png`.
8. `ART_ASSETS.md` (section 7's list, what is drawn by code and what a sheet would replace), `BUILD-NOTES.md`, the
   morning report (section 15).
9. **Commit after each of 1, 3, 5 and 6 is green. Push.**

Ends with: every shot opened, three faults each, the thumb, the morning report at the top of section 15.

---

## 6. THE SCREENS (portrait, one hand, 48 px rendered at 375 wide, the bottom left 120 by 120 empty)

Palette and type in section 7. Every screen is a `.screen` panel (section 2's rule). Buttons 56 px tall, full width
minus margins, at most two side by side. Cards are 12 px radius, one pixel bone border at 0.35 alpha, ink fill.

**Four laws that hold across every screen, each forced by the audit:**
- **A way out of everything.** Every screen but the Title and the Hall, and every sheet (SPEND RENOWN, SPEND MARROW,
  the gear tile sheet, MOVE TO, the takeover card), carries a 48 px BACK or CLOSE in its TOP row, never in the
  bottom left 120 by 120. Each screen pushes a history entry and `popstate` runs that screen's BACK; the Quest and
  Boss screens re push, so the system back gesture is a no op inside a quest and closing the app is a resume, never
  a withdraw. Creation's BACK cancels and spends nothing (the Recruit charge lands at KEEP). Without this the Marrow
  sheet was a room with no door and Android's back gesture closed the whole game from every screen.
- **The pinned footer.** A `.screen` may carry ONE `.pin` footer outside the scroll region
  (`display:flex; flex-direction:column`, `.body{flex:1 1 auto; overflow-y:auto}`, `.pin{flex:none}`), and the
  layout gate asserts the footer's rect is on screen at 320x568 with the body scrolled to its end. The eighth button
  under the fold is a scar this fleet already has.
- **A three card DEAL is three full width cards stacked**, scrolled if it needs to be: the Callings, the Traits, the
  locked Origins, the Commission's three relics. Three cards in a row at 320 wide are 93 px, about thirteen
  characters a line at the 0.7 rem floor, so a Trait's own text wraps to five lines on the screen the spec calls the
  thrill of the game. Only the Ward shelf and the character row are horizontal.
- **Party order is visible and settable.** The Deploy tick renders its order number, 1, 2 or 3, in tap order, and
  un ticking renumbers the rest. It decides boss resolution order, Herald's "previous check", Hearthborn's tie and
  every `lastOfStage`, so a player who builds a Herald has to be able to see it.

- **Title.** MARROWDEEP in bone, letter spaced, 2.2 rem; the title line under it (0.85 rem, muted); BEGIN or
  CONTINUE; HOW; a Sound toggle. Bottom left empty.
- **Creation.** Shown three times in a row on a new account (R2.1), and from the Hall on a Recruit. Four die tiles in a row (each 72 px, the stat glyph above, the die shape with its size inside; they
  tumble on ROLL), the Origin card under them (name, blurb), three Calling cards (name, blurb, a Legacy card also
  carries the `cards.legacy` line from `lines.json`, which is its only source), the name line, KEEP (56 px) and REDEAL (48 px, price shown).
- **Hall.** Counters top (Renown left, Marrow right, glyph and number, 1 rem). When no character can be deployed and
  Renown is under 25 the Recruit button reads TAKE IN A STRAY and costs nothing (R8.0): without it a first quest wipe
  ends the account, at the spec's own eight percent wipe rate. The offers: **one card at a time with < and >
  paging, deepest first**, each carrying the Depth name and blurb, its Sigil marks with names, the boss name or
  names with their stat glyphs, and DEPLOY. Five stacked offer cards are about 790 px, which does not fit a 568 px
  phone, and five dealt choices break the pillar that never deals more than three; paged, the deal is one card and the arrows are the
  control (not a swipe: section 4 bans drags, and a drag on the headless rig reads as a hold). In the `.pin` footer, **two rows of two** 48 px buttons: ROSTER and THE WALL,
  then RENOWN and MARROW; the WARD SHELF row when a slot is owned. ⛔ Not one row of four: the chip's seat takes the
  bottom left 120 px and the screen's own padding takes 40 more, which leaves 160 px at 320 wide, and four 48 px
  buttons need 192 before a single gap. The gate that asserts 48 px and the gate that asserts the empty corner would
  have contradicted each other on this screen. The chip's
  corner stays empty.
- **Deploy.** The roster as small cards, each tick showing its order number 1, 2 or 3 in tap order (un ticking
  renumbers the rest), with one muted line saying the order is the acting order. Three ticks then GO (56 px); GO
  also enables at one or two ticks when the roster cannot fill three, and the offer card says short handed (R8.0). A
  card that cannot go says why.
- **Roster.** Cards 88 px tall: portrait, name, Origin and Calling, four small dice, Strain over Toughness as pips,
  Scars as small marks. Tap for Character. BACK.
- **Character.** Portrait (96 px), name, blurbs, four big dice (64 px) with stat glyphs, the eight tiles in two rows
  of four (each 72 px), Traits as chips, Scars, the numbers line, RETIRE or DISMISS, EXCISE A SCAR. Tap a tile for
  its sheet: the item's affix lines, MOVE TO, TAKE RENOWN, or the empty slot's mechanic line.
- **Quest.** Top row: Depth and stage ("Verge, stage 3 of 6"), the Sigil marks, and **the lantern line** (the next
  stage's two stat glyphs) whenever any deployed character is Lanternborn, which is R4.6's whole effect and had
  nowhere to appear. **The drop screen may also run at quest start**, before stage 1, because Ashwalker is one of
  the four Origins a new account starts with and R4.2 rolls it a free relic there. **The stage end sheet ends with
  the replacement offer** (RESERVE, RECRUIT, CONTINUE SHORT HANDED) before NEXT whenever anyone died. Two challenge cards side by side
  (each at least 150 px tall: shape icon top left, stat glyph(s) top right, TN large in the centre, the reward line,
  the tags line, the text line, the assigned portrait(s) at the bottom; a Relay card has two portrait seats). Three
  character cards in a row under them (each: portrait, name, four small dice, Strain pips, Armor pips, and BENCH in
  muted when unassigned; NO push or twice chips here, they are on the pre roll strip). RESOLVE (56 px) at the bottom above the
  chip's corner: it sits bottom RIGHT, full width minus the left 130 px.
- **Pre roll.** A veil over the Quest screen, one per check, the step before the roll: the portrait, the stat die,
  the TN, the consequence glyph for that stat, the PUSH and TWICE chips when either is available (full width, 56 px,
  which is why they are here and not on a 93 px character card), and ROLL. A modifier worth nothing in this cell
  reads "no effect" (R13.16).
- **Result.** A veil over the Quest screen. The check's card: character portrait and name, the challenge line, the
  big die (96 px) tumbling then settling, the surge die sliding in from the right with a plus, the modifier chips,
  "TOTAL 9 against TN 5", PASS or FAIL, the Strain line, the consequence line, and **at the boss a damage line**
  ("4 to Grasping Chains, 2 pips left"), because at the boss the damage IS the outcome and the stat consequences do
  not apply. CONTINUE (56 px), REROLL beside it when offered (48 px, names its source: "Gambler").
- **Stage end.** A sheet: the bench line, the Respite line, the Renown line, then NEXT; the drop screens interleave
  before NEXT.
- **Drop.** The relic card (name in its rarity colour, slot glyph, the affix lines, the unique line), the three
  deployed as small cards each with its current item in that slot and a delta ("+2" in green, "worse" in muted),
  TAKE RENOWN (48 px, the number on it), TO THE SHELF when it applies.
- **Boss.** The boss name and intro line top; three (four at Depth IV and V) Aspect cards in a row (name, stat
  glyph, TN, hit point pips, the line, and **up to three portrait seats drawn like a Relay's**, because every
  character is assigned to an Aspect and doubling up is allowed, so without seats the screen cannot show who is on
  what; broken ones turn to bone with a crack); the party Strain bar under them
  (bone filling with marrow red); round counter; three character cards; RESOLVE. At 320 wide four Aspect cards are
  two rows of two.
- **Aftermath.** The boss falls (the cards drop off the bottom), the rewards sheet (Renown, Marrow if any, drops),
  then per survivor: the Scar line ("<name> carries another Scar. Toughness 3.") and three Trait cards, KEEP. The
  wipe card: "The Verge keeps them.", the salvage line, the Legacies made, CONTINUE.
- **The Wall.** A scrolling list of lines, newest first: "Vessa Orn. Fenwise Zealot. Four quests. Drowned at the
  Gate." Nothing tappable. BACK.
- **HOW.** Six lines. GOT IT. It shows itself once, at the Hall, the first time the Hall opens, which is AFTER the
  three free characters have been rolled: six rules in front of a player who has not yet thrown a die is the exact
  opposite of the spec's first pillar. GOT IT returns to whatever opened it, and `seen.how` is written when GOT IT
  is tapped, never before.

Every framed page posts `ready`. There is one page, so once.

---

## 7. ART (what the game ships with tonight, what Stephen can make this month)

**Visual direction (the spec's, pinned):** flat vector, tight palette, no perspective, no animation heavier than a die
tumble and a number pop. **Every moving thing on the screen is on this list, and it says what it tells the player:**
the tumble (a roll is under way), the surge die sliding in (a second die was added), a Strain pip filling (Strain
landed), an Aspect card cracking to bone (it broke), a character card going to bone (they died), the party bar
filling (how close the party is). Nothing else moves. A drifting particle over the RESULT card competes with the one
thing the whole screen exists to say, which is which number beat which number; the studio law is that decoration is
not neutral, it is cover for the wrong side. The shot pass names any motion it cannot find on this list. Identity comes from names and numbers; art is shared by slot; NEVER per item.

**Palette:** ink `#0c0a10` (the ground), bone `#e6dcc6` (text, dice), marrow `#a8322e` (Strain, death, the party bar),
brass `#c9a24a` (Renown, Relic rarity, the title accent), lantern `#e8b45c` (highlights), stone `#3a3742` (card
borders at low alpha, muted text `#8d8798`). Stats: MIGHT ember `#c8553d`, GRACE tide `#5fb3a1`, WITS violet
`#8f7bd6`, NERVE brass `#d9b24c`. Rarity borders: common stone, uncommon `#6fa86c`, rare `#5b8fd6`, Relic brass.
Depths tint the Quest screen's top row: Verge bone, Hollows tide, Undertow violet, The Silt ember, Marrowdeep marrow.

**Drawn by code tonight, all as inline SVG symbols (no image loads):**
- 5 die shapes: d4 triangle, d6 square, d8 diamond, d10 kite, d12 pentagon; the size inside in bone; 1.5 px stroke.
- 4 stat glyphs: MIGHT a closed fist as three bars, GRACE a leaning line with a dot, WITS an eye as a lens, NERVE a
  flame in a ring. 24 px, one colour each.
- 6 shape icons: Gate (a door), Chain (two links), Relay (two hands), Vault (a keyhole), Toll (a coin with a cut),
  Open (an arch).
- 8 slot glyphs, 6 Sigil marks, 9 status icons (Strain a drop, Armor a plate, Scar a line, Renown a laurel, Marrow a
  bone, Surge a burst, Floor a step, Push a hand, Bench a stool).
- 8 Origin portraits as silhouettes (a head and shoulders in eight distinct outlines: hooded, helmed, braided,
  bare, lantern held up, salt crusted, marked, plain) recoloured by Calling (the Calling's tint at 0.6 over the
  silhouette, and one overlay mark per Calling).
- Boss Aspect art: the Aspect's card is its name and stat glyph over a large faint shape icon in the boss's own
  tint; no creature art.

**The sheets for Stephen (in `ART-PACK-MARROWDEEP.md`, a Doc in 012Assets):** the four stat glyphs and five dice on
one sheet; the eight portraits on one sheet; the icon set (shapes, slots, Sigils, status) on one sheet; six boss
sheets of three Aspect plates each; the icon mark. Each lands in `satellites/marrowdeep/art-drop/` and Fable cuts it.
`docs/ART_ASSETS.md` lists every symbol the code draws with its id, so a cut file replaces a symbol one for one.

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit; the build makes every line true first)

Card Fable adds to `portal/index.html` after review, in the fresh block after Gerplunk:

```
{nm:"Marrowdeep", ds:"Roll a party of dice, decide who faces what, and bury the ones who fall; their callings come back as cards.", cat:"card", url:"/satellites/marrowdeep/?v=<stamp>", ic:"🦴", thumb:"/portal-assets/thumbs/marrowdeep.png?v=<stamp>", beta:true, fresh:true},
```

`beta:true` is what puts it on the In Development tab and draws the badge; the twelve night games do it exactly
this way and **none of them includes `dev-gate.js`**, so Marrowdeep does not either (the gate script is for the
older in development satellites, `aura-off` and `burrow-bowl` among them, and adding it would put a tester key
between Stephen and his own game).

⛔ The category is `card`, not `strategy` or `dice`. The portal's tab list (`CATS`, `portal/index.html` around line
1344) is `action puzzle card creative word math`, and a row whose `cat` is not one of those is reachable only from
All, New and Favorites. Four existing rows already carry `board`, `party`, `dice` and `pattern` and are invisible on
every category tab; that is the Aug 16 scar the comment above `CATS` records, and Marrowdeep is not joining them.

Must be true first: `docs/thumb.png` exists under 150 KB; the live URL answers with the stamp in its HTML;
`tools/check.js` prints ALL GATES PASSED; the seam gate passed with real taps; every shot exists and was opened; the
description above has no dashes (it does not). Fable also adds `marrowdeep` to `scripts/fleet/ci-twelve.mjs` and
`sweep-twelve.mjs` (the TWELVE lists are hardcoded; the builder cannot touch them), so the cloud gate runs it.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- **A probe that cannot fail is not evidence.** Every gate is watched red once. A gate that sets the state it then
  asserts never booted into it: write a fixture and RELOAD. A gate that measures the empty screen (a layout gate on a
  Quest with no assignment) misses the chips; assign first, then measure.
- **A count is not a law.** "Twenty Gate lines per stat" in a gate is red the day content grows. Assert "at least
  twelve" and say why twelve (a quest draws at most six Gates per stat without repeating).
- **`el.click()` proves the handler, not the thumb.** `elementFromPoint` at the centre, 48 px rendered, three widths.
- **Two tabs clobber a save read once and written wholesale.** Read, modify, write; max the bests; the `storage`
  event; the takeover card for the in progress quest.
- **A save rebuilt from a whitelist deletes every field it does not know** (Strata's journal, Airworthy's medals,
  both Sep 06). Preserve unknown fields; plant one in the save gate.
- **A duplicate key in an object literal is legal and the last one silently wins.** The DATA block is one literal;
  `dupKeys` runs over it in lint.
- **`.screen{justify-content:center}` with `overflow-y:auto` clips its own top** on a 568 px phone (four games,
  Sep 06). Use the spacer.
- **A scroll row in a flex column shrinks to nothing when the column overflows** while its children still report full
  rects (Litter Bug, Sep 05). `flex:none` on the shelf row and the Trait card row; the gate asserts the child's rect
  is inside its parent's.
- **The fleet's music chip chases free space** and follows anything you put in its corner. The bottom left 120 by 120
  is not yours on any screen; RESOLVE sits to the right of it.
- **The eighth button under the fold** (Whistlestop, Sep 07): at 320x568 the Hall's four buttons plus the shelf row
  plus two offer cards will not fit; the offers scroll, the buttons are pinned. The layout gate measures the pinned
  row at 320x568.
- **Measure `visualViewport`, never `innerHeight`**, and never compare an overflow against `innerWidth` or
  `scrollWidth`: `innerWidth` follows the LAYOUT viewport, so mobile Chrome widens it to hold wide content and the
  comparison always reads clean (that is how a sibling game shipped 31 px of overflow with a green gate). Every
  overflow assertion compares against the DEVICE WIDTH the gate set, 320, 375 or 412, and the music chip's seat box
  reads `visualViewport.height` where it exists. The inherited `layout.mjs` builds that box from `innerHeight`,
  which is harmless headless and wrong on a phone with a URL bar.
- **pointer-events:none text is invisible to a probe** and to the chip's seat search. Keep prose in normal flow.
- **A fresh GainNode's gain is ONE.** Three games clipped green on Sep 07. Every voice sets its gain; the ear gate
  measures the peak.
- **A tremolo wired into an envelope gain is a smoke alarm.** Separate nodes for the envelope and the modulation.
- **Under headless Chrome on two cores the page runs a few frames a second**, so a tap's down and up land a frame
  apart and read as a hold: `tap` dispatches both synchronously. `waitForFunction` on `MD_DEV.screen()` or
  `MD_DEV.card()`, never `sleep`.
- **A green gate under contention is a coin.** Alone, twice.
- **The stamp lives in six places in the file plus `sw.js` plus, after listing, the portal row** (url and thumb
  `?v=`). Lint reads the file's places; Fable bumps the row at deploy.
- **A gate can pin the bug.** When a fix turns a gate red, ask whether the assertion held the law or the old string.
- **A note that says a thing was tried is not a note that says why it failed.** DECISIONS lines carry the why.
- **Never claim hand painted art, never claim an economy.** Copy has no money in it and no "art" in it.
- **Disk.** 2.9 GB free on the morning of Sep 08. Scratch under `/tmp/claude-1000/...`, delete raw shots that are
  not evidence after reading them, commit nothing over a few hundred KB.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The smallest reasonable choice is the builder's, logged in `docs/DECISIONS.md` with one line of why. Anything about
money, price, tone or the brand is Stephen's and gets skipped, not guessed. RULES.md has already made the rulings
below; the builder implements them as written and does not relitigate them; Stephen may overturn any of them.

**Director calls, open (each with what the build does meanwhile):**

1. **THE BOSS CLOCK, and it is the biggest call on the list.** At the spec's Strike of 2 the boss kills the whole
   party: a 20,000 quest simulation measured an 81 percent per character death rate and a 78 percent full wipe
   against targets of 12 to 15 and 8. The same run found that the spec's own section 8.6 numbers describe the PRE
   BOSS stages exactly (13.45, 31.50, 1.47 percent, 0.404 Legacies), so the boss was never costed at all. Built at
   Strike 1 for Depth I and II, which leaves Toughness at the spec's 4. But a second, independent simulation says
   **no single lever fixes it**: the softest configuration measured still kills a character in one run of six and
   wipes one party in seven AT THE BOSS ALONE, on top of the 13 percent the five stages before it already cost. The
   seven measured configurations are the table in R7.4. So the call is not which number to nudge, it is which of two
   things is true: either the boss is much softer than three Aspects of 3/3/4 at Strike 2, or a whole quest is meant
   to cost two to three times what section 8.6 says and the four to seven quest career goes with it. The spec's own
   boss prose ("it will cost a character") points at the second. Play it and say which. Until then the harness
   asserts the pre boss numbers, which match 8.6 exactly, and reports the whole quest numbers without failing.
   ⛔⛔ Depth IV and V are worse than untuned, they are **unwinnable as specified**: a third auditor drove the
   policy through 200 quests at each and got **0 wins in 200 with 600 of 600 characters dead**, because four
   Aspects of 21 hit points need about seven rounds and a Strike of 3 kills a Toughness 4 character in two. Built
   with the fourth Aspect DORMANT until one of the first three breaks, so three bodies always face three Aspects.
   The alternative, one line either way, is that an unfaced Aspect strikes one character rather than all of them.
1b. **BASE_TOUGHNESS.** Built at 4, the spec's number, and the prototype's grid confirms or moves it in
   PROTO-REPORT.md; the spec expects 3 to 5.
1c. **SCAR_EVERY 2** (R2.5). One Scar per quest against Toughness 4 is a wall at four quests and a mean career of
   2.83, not the spec's 4 to 7, and it pushes Marrow income to about 3.6 a quest against the spec's own 1.5. A Scar
   every second quest puts the career near five and a half and makes the spec's number right. Set it to 1 for the
   spec's literal reading.
1d. **The spec's three death numbers cannot all be true** (P3.5). Anchoring on 0.4 Legacies and 35 percent at least
   one death derives a full wipe of 2.5 percent, not 8. The harness bands follow the derived number. Play it; the number is
   one line in BALANCE.
2. **Where Strikes land** (R7.4). Built as `attackers`, the only law the spec's own boss example survives. The other two are one string away in BALANCE.
3. **Respite at Depth I and II** (R5.7). Built as 1 per stage. Zero makes the Verge an Undertow.
4. **Withdraw mid quest.** Not built (R5.11). The death economy assumes full commitment; a Withdraw at the stage
   end sheet is a small build if he wants a coward's door.
5. **The Gate TN band.** 4 or 5 at 50/50 as the spec says (R5.5). Widening to 3 to 6 makes hidden TNs and
   Lanternborn matter more; one BALANCE row.
6. **A Legacy is the same ability with the dead one's name on it** (R8.7). If he wants a Legacy to carry a memento
   (one Trait of the dead), it is one field and one deal rule.
7. **Prices.** Every Renown and Marrow price is the spec's. His.
7b. **RETIRE_VESTING 3 and the unproven death** (R2.6, R8.5, both audit corrections). The spec's flat "Retire pays
   2 plus one per Trait" made recruiting and retiring rookies the fastest Marrow in the game, six times the design's
   own rate and safer than a veteran; and an unproven death paid 3 Marrow at Depth V, so a mid quest Recruit could
   be fed to the boss at every stage end. Built so that every Marrow passes through one survived quest. If he wants
   the spec's numbers back it is two lines in BALANCE, and the exploit comes back with them.
7c. **Depth V rarity** (R6.1). The spec's section 9 says Relic rarity only; its own tables 11.3 and 11.4 give
   Depth V three rarities at 0 / 45 / 40 / 15. Built on the tables, because the prose reading exhausts the twenty
   uniques in four quests and makes the Vault's "+1 tier" a no op. One BALANCE row either way.
7e. **The real pacing is about ten times faster than the spec's prose says.** Multiply the spec's own session
   lengths by its own unlock counts and a wipe rate: Depth II lands about twenty minutes in, Depth III about an
   hour (the spec says "roughly hour 10"), Depth IV about three hours, Depth V about six, after which no new
   structure exists at all (the spec says "hour 200"). The retire or run decision first bites at quest four or
   five, about twenty five minutes in, not quest fifteen. Nothing in the build depends on the prose, and the unlock
   counts are left exactly as written because moving them retunes everything else. The call is what happens after
   six hours: a sixth Depth, or a reason to replay Depth V (the Sigil offer, which now re rolls per Depth, is the
   natural candidate).
7f. **The price index** (R8.0b). Renown income multiplies 5.1 times across the Depths while every price the spec
   prints is a constant, so a Depth V run would buy six Commissions and four Scar excisions. Prices are indexed by
   the deepest Depth completed. Set the row to all ones for the spec's printed prices.
7g. **REST_FRACTION** (R8.3). A character left at home clears all of its Strain, which is the spec's reading, and it
   means Mend stops being bought at the second roster slot. Half a rest keeps Mend alive all game. One number.
7h. **The challenge banks are half to a quarter of the spec's own target** (about 40 per stat per shape). The
   recently used ring across three quests (R10.1) hides most of it; growing the banks is authoring, and the files
   are `plans/marrowdeep/data/challenges-*.json`.
7d. **A finite Marrow tree.** Every Marrow purchase but Consecrate is finite: about 98 Marrow buys all of it, around
   quest 50 to 65, which is where Depth V opens. After that the retire or run decision the spec calls the endgame
   hook pays nothing and running every veteran to death is always right. A repeatable sink (a second consecration
   slot, or Excise payable in Marrow) is a design call and nothing tonight depends on it.
8. **The name.** MARROWDEEP is the spec's working title; the folder and the keys are `marrowdeep` and stay so
   whatever the display name becomes.
9. **Sound.** Nobody has heard it. `docs/shots/p3-loud-minute.wav` is rendered for his ear (never measured).
10. **Sigil stacking.** No exclusion table (R9.2). Marrowdeep at Depth V can deal Hollow Air with Shivering.

---

## 11. STEPHEN ONLY

- The art sheets (section 7) in his generator, whenever; the game does not wait on them.
- The portal listing is Fable's, after review; the deploy is Fable's.
- The phone: Pixel 9, a whole Depth I quest, one death, one retirement, the wall.

---

## 12. HONEST SIZING (one Opus, two cores)

| Phase | Hours | What exists when it is green |
|---|---|---|
| P0 | 1.5 | The engine in the page, five gates, the title |
| P1 | 5 | A whole Depth I quest by taps, the seam gate, creation, the pre roll strip, boss, aftermath |
| P2 | 4 | Roster, Character, the Hall's shelves, death and the wall, the save gate |
| P3 | 4 | Depths II to V, Sigils, the ear, the shell, shots, thumb |

About fifteen hours, and honestly it is the wide end of a range: the audit added thirty one rulings after the first
sizing, and while most are one line in the engine, the pre roll strip, the drop screen's two target rows, the stray
and the three free rolls are each a small piece of screen. "Built today" for one builder on this box is P0 through
P2 by the evening (a playable,
saveable, complete Depth I game with the whole account loop) and P3 through the night. A session limit or a
codespace stop in the middle costs nothing that was committed. The prototype, the content and the rules were built
today so that none of the fourteen hours is spent deciding.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

(empty; the builder pastes here)

---

## 14. THE OVERNIGHT PROTOCOL (how an unattended run behaves)

1. **Never wait on a human.** Every question that would have gone to Stephen becomes the smallest reasonable choice,
   logged in `docs/DECISIONS.md` as one line of what and one line of why. The open questions in section 10 take the
   answers written there.
2. **Phases run back to back.** P0, P1, P2, P3. A phase ends only with its ledger box full. There is no pause between
   phases and no pause for feel beyond the one the plan orders (P1 step 4).
3. **A red gate after three honest attempts is BLOCKED, not fixed by force.** Write `BLOCKED: <gate>` in SESSION
   STATE with the last thirty lines of its output and the three things tried, then move to the next subsystem that
   does not depend on it. Never weaken a threshold, shrink a sample, delete an assertion or comment out a check to get
   green. A gate that was made to pass is worse than a red one, because the morning reader trusts it.
4. **Two cores.** Gates one at a time, under the lock. The browser gates flake under contention: a failure in the
   suite is rerun alone, twice; two passes alone is a pass and is written that way. No helper agents for judgement
   calls, never in parallel with a gate.
5. **Commit and push after every green subsystem.** Small commits, each with gates green, each pushed to the branch.
   A day's work that sits uncommitted in a dead session did not happen.
6. **Context is a resource.** When the session is running long: finish the subsystem in hand, gates, commit, push,
   SESSION STATE with the exact next action (file, function, step number), the morning report, stop. The next session
   opens with the same prompt and resumes from SESSION STATE. Never start a subsystem you cannot finish and commit
   inside the context you have left.
7. **Screenshots still happen.** Shoot from where the player stands, open with the Read tool, name three faults,
   write them down. The faults are the reader's first list.
8. **The design is not edited.** A number that has to change changes in BALANCE; a rule that has to change is a
   DECISIONS line and a note in the morning report, and RULES.md stands until Fable edits it.
9. **Nothing leaves the fence.** Section 0.
10. **Disk.** Section 9, last bullet.

---

## 15. THE MORNING REPORT (write it before you stop, most recent on top, keep every one)

```
### Morning report, <date and time>
Phases: P0 <done|partial|not started> (<commit>), P1 ..., P2 ..., P3 ...
Gates: <the last full tools/check.js summary line, and which gates were skipped in fast mode if any>
Play it: <what is playable right now and how to reach it: the screen path from boot to a won or lost quest>
Look at: <five docs/shots/ files worth opening first, one line each on what is wrong in them>
Decided without you: <the three most consequential DECISIONS.md lines, verbatim>
Blocked: <each BLOCKED gate with one line of why, or "none">
For Fable: <anything outside the fence, or "nothing">
For Stephen: <which open questions the build's choices leaned on, and the phone checklist to run>
Next action: <file, function, step, the first thing the next session does>
```
