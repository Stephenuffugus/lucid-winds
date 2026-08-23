# HANDOFF FOR OPUS, 2026-08-24: morning review, then three games

Written by Fable at 3% budget. Execute without asking. STATUS for everything goes
at the bottom of THIS file, one line per entry, newest last.

## Rules (same as HANDOFF-OPUS-AUG23.md, plus parallel rules)
- Named files only per task. FOUND: for anything else, never fixed.
- STEP BOX per task. Spent and still red: `BLOCKED: <output>` and stop that task.
- Deploy = `git push origin add-sproing-jumper:main`, bump `?v=`, probe live with
  `?probe=$RANDOM` and grep a NEW string. A 200 is not evidence.
- Every visual change: screenshot 412x915 AND 915x412, dsf2, touch, fab hidden,
  OPEN it, write three things you see. A green gate is not a look.
- Never `x | tail` for an exit code. Never `git clean`. Never touch Steam,
  payments, the Lucid Winds economy, root index.html, satellites/chameleon*.
- No dashes in player copy. Sky Wolf Studio, singular. Never remove a game.
- ⛔ PARALLEL RULES (two-core box): up to THREE Agent subagents may EDIT in
  parallel ONLY because the three games live in three different trees
  (/workspaces/Litter_Bug, satellites/attic, satellites/puppy-dash). Gates and
  browsers run ONE AT A TIME: create `/tmp/gate.lock` with `mkdir` before any
  node gate or puppeteer run, remove it after, wait if it exists. Commits: each
  agent commits only its own tree; the main session pushes.
- ⛔ Litter Bug: edit /workspaces/Litter_Bug ONLY, push it (`env -u GITHUB_TOKEN
  -u GH_TOKEN git push`), then re-vendor from lucid-winds with
  `node scripts/vendor_satellites.mjs` and commit the vendored copy. Never hand
  edit satellites/litter-bug/.
- Survey results from Fable's four readers are in
  `/home/codespace/.claude/projects/-workspaces-lucid-winds/8db8172a-c04b-4c62-abe5-74f72d7fa9b1/subagents/workflows/wf_ff7ca3d8-d2b/journal.jsonl`
  (Litter Bug map, Attic map, Puppy Dash drop summary, today's gate results and
  open items). Read it first if it exists; if it does not, survey yourself.

## PART 1: morning review (one session, 60 min, STEP BOX 3)
Not a feature checklist. Yesterday's STATUS shows five patterns that each bit
at least once. Re-verify each against the code as it stands now:
1. **Checks that cannot fail.** For every check group added yesterday in
   `satellites/flock-the-world/check.js` (population ledger, map tap popover,
   name your vendor, notification queue, sound, audit regressions), pick ONE
   assertion, break the code it guards, confirm red, restore. Log each as
   `review: <check> bites` or `review: <check> VACUOUS`.
2. **Parsers over rendered HTML.** Any check that regexes game HTML (price
   parity, ledger rows, badge count): confirm it asserts non-empty captures.
3. **Flaky assertions.** Run `node check.js` FIVE times. Any check that flips is
   a bug in the check. Fix the check, not the game.
4. **Escape coverage.** grep every `${s.co}`, `${S.co}`, `CO()` and `escH(` site;
   every innerHTML path that carries the vendor name must go through escH.
   Count them and write the count.
5. **Looked, not gated.** Shoot the menu, a tree, the World tab, the Ledger, an
   event modal, the refusal ending, landscape and portrait, OPEN all of them,
   and list anything a gate would not catch (overlap, clipped text, unreadable
   contrast, art competing with copy).
Also run every fleet gate once: portal_ux_check, advertised_count_check,
test_inline_drift, smoke_shells, catalog.mjs. Record exit codes.
DONE: a `## Review 2026-08-24` block in STATUS with the five findings and gate
codes. Fix nothing beyond a broken CHECK; game defects go to FOUND:.

## PART 2: Puppy Dash (smaller scope, one agent, STEP BOX 6)
Source: Drive folder Github > Puppy Dash. If `satellites/puppy-dash/drop/` does
not already hold the three files, fetch them with
`mcp__claude_ai_Google_Drive__download_file_content` (base64, decode):
  1g9Y4QwyL11UwaK3RdEdeULFv73r6j2TF  PUPPY_DASH_BUILD_SPEC.md (~15 KB)
  14lheK3S9R8IndMaI8wVAy469Sgd-89pl  PUPPY_DASH_ART_BIBLE.md (~14 KB)
  1Wv63LmZHGhQr-o5j0BThiV9Ftz4FS9Vk  puppy-dash.html (~36 KB, the working game)
Read the spec first; it is the executable design. Do NOT rewrite the prototype,
extend it in place. Tasks, in order:
P1. `satellites/puppy-dash/index.html` = the prototype plus the house wrapper:
    `<meta>` viewport, `manifest.webmanifest`, the Sky Wolf embed protocol
    (copy the `{sws:'ready'}` parse-time and load-time posts and `SWS_EXIT`
    from satellites/flock-the-world/index.html verbatim), `dev-gate.js`, the
    feedback fab mounted `home:'top-right'` (painted controls are bottom-right).
    Portal card in portal/index.html with `beta:true`, cat "action", a thumb
    shot from the real title screen (`scripts/refresh_thumb.mjs`), ic 🐶.
    `node scripts/portal_ux_check.mjs` and `advertised_count_check.mjs` green;
    catalog count moves by exactly one carded, zero openable.
P2. Persistence: best distance, total stash, chosen animal, mute, in
    localStorage `pd_*`, read-modify-write (two tabs must not clobber).
P3. A `check.js` in the house pattern (vm + DOM stub, `ok()`/`group()`,
    watch each check fail first): CFG sanity, the four obstacles map to the
    three verbs, swept contact cannot tunnel at spdMax, jump clears a jump box
    and slide clears a slide box at the spec's margins, a lane-over obstacle
    never kills, localStorage survives reload, every button 48px real px at
    375x667 (measure in browser, not CSS).
P4. Content: two more obstacles from the bible (puddle=jump, trash can=dodge),
    the magnet power-up, a golden biscuit. Keep the rainbow poop jetpack.
P5. The economy call site `TODO[economy]` stays a TODO with a one-line stub that
    logs the run summary. ⛔ Do NOT wire Firebase or Sunbeams: that is a
    server-side mint and an economy decision for Stephen.
DONE: live behind the tester wall, 3 screenshots opened, check.js green.
Art: none yet. Log an ART-LEDGER row LISTED pointing at the bible's section 9
minimum set (about 50 frames) so Stephen can generate it.

## PART 3: Litter Bug (flagship, one agent, STEP BOX 8 per subtask)
Truth: /workspaces/Litter_Bug, in sync with origin at 0e25159. Read CLAUDE.md,
HANDOFF.md, STATUS.md, ROADMAP.md, NEXT_SESSION.md first; the repo has its own
rules and gates (scripts/, grade_sim_live.js, grade_tune.js). v1 loop: alley
HOME, three 60 s scavenge jobs for Shinies, 30 Shinies = 1 mint, BUGDEX, and
THE DUMPSTER battles built but DARK behind `?battles=1`.
L1. **Play it first, in a browser, ten minutes, and write what is wrong**
    before touching code: pacing of the three jobs, whether a mint feels
    earned, whether the bug reads at phone size, whether HOME has a reason to
    come back tomorrow. Shoot every screen. That list drives L2 to L5.
L2. **Battles go live.** Remove the `?battles=1` gate once the five seeded
    challengers beat a balanced bot at the rate the repo's own sim says they
    should. If the sim is missing, write it the way FTW's check.js botRun works.
L3. **Gameplay depth:** a daily challenger rotation by dayIndex, a win streak
    with a visible reward, a fourth scavenge job, and the BUGDEX showing grade
    distribution so the 30-Shiny mint feels like a pull.
L4. **Graphics:** the repo's ART_STYLE.md and ASSETS.md are the brief. Every
    bug part at REAL render size on a contact sheet with a black column; fix
    anything that does not read at the smallest size it is drawn. Particles and
    a hit flash on every battle exchange. Background per screen, blurred hard
    behind copy (FTW lesson: art behind text goes further back than looks right).
L5. **Build:** 48px real-px audit at 375x667 (stage scale 0.694 fooled this
    repo before), `{sws:'ready'}` on every page incl. labs, corrupt-save probe,
    no console errors, then re-vendor into lucid-winds and bump the card.
DONE per subtask: upstream pushed, vendored, live probe, shots opened, STATUS.

## PART 4: The Attic (flagship, one agent, STEP BOX 8 per subtask)
satellites/attic: 8 files, 160 KB, behind the tester wall, waiting on a NAME
(Stephen's shortlist: Dead Stock / Rummage). Do not rename; build under the
working title. v1 loop: DUST OFF (90 s wiping grime off 48 cells, 10 buried
stubs, 2 per ticket, 6/day), rummage a one-of-one fake vintage record/tape/toy,
CONDITION ladder with FACTORY SEALED at 0.383%.
A1. **Play it, ten minutes, write the list** (same as L1). It is tiny; the list
    will be long. Shoot every screen.
A2. **The collection is the game.** A SHELF screen: every object you have found,
    sortable by condition and type, with the sleeve art large, a per-object
    card (flippable like Lucid Winds' plant cards), and a share/download of the
    card. Without this the loop ends at the reveal.
A3. **A reason to return:** a daily rummage with a fixed seed (prove
    determinism the LISTDLE way: same date twice matches, different date
    differs, break the seed and watch it fail), a streak, and one "wanted"
    object per week that pays double.
A4. **Content depth:** at least double the object families (records, tapes,
    toys + comics, zines, handhelds, board games), each with its own sleeve
    renderer variation and condition tells. Names and lore procedural from the
    hash, no real brands, no real artists.
A5. **Graphics:** the attic itself as a scene (boxes, a lamp, dust in the
    beam) behind the grid; sleeve art with wear that matches the condition
    tier; a FACTORY SEALED reveal that earns the 0.383%. All at real size on a
    contact sheet first.
A6. **Build:** check.js in the house pattern (condition distribution over 60k
    draws within 10% of the ladder, daily determinism, save/corrupt save, 48px
    real px, every page posts ready), no console errors, card bump, live probe.
DONE per subtask: pushed, live, shots opened, STATUS.

## Dispatch
Main session: PART 1 first, alone, gates serialized. Then spawn three Agent
subagents (general-purpose) for PARTS 2, 3, 4 with this file as their brief and
their PART as their only scope; each writes its own STATUS lines prefixed
[PD] [LB] [AT]. Main session polls, pushes, and resolves the gate lock. Stop at
the usage reset; leave every tree committed.

## STATUS
