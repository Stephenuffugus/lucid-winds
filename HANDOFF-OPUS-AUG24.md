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

## Survey key findings (Fable's four readers, full text in the journal above)
- LITTER BUG IS TWO PRODUCTS. index.html (the game: 3 jobs, 30 Shinies, Bugdex,
  save lb_dex_v1) never loads world-engine.js, renders every bug full grown and
  stores no level. The LABS (mint-lab, world, battle-lab, bugdex; save
  litterbug_vault_v1) hold the tap-trial mint, levels 1 to 30, territory,
  raids, breeding and the fully animated arena. The two saves never meet.
  THE DUMPSTER in the game only auto-resolves five L1 bots to WIN/LOSE labels:
  no tap, no move choice, no reward. L2 therefore = bring the lab arena INTO the
  game (one save, battle-engine interactive path, move cards), not just drop
  the ?battles=1 gate. This is the flagship gap.
- gradeOf scores six trait indices (wing/body/head/pattern/leg/antenna) the
  procedural renderer never draws, so LEGENDARY has no visual tell and the
  same indices drive battle stats. Fix in L3: grade must read from drawn parts.
- No gate loads index.html; 9 of 10 smoke harnesses green (smoke-render needs
  sharp). No audio anywhere. 36 PNGs are 2026-05 placeholders, unused by the
  game. The 6.8 MB inherited-engine.html ships in the vendored tree: exclude.
- Attic, Puppy Dash and today's gate results: read the journal entries
  survey:attic, survey:puppy-dash, survey:status+gates before starting those
  parts; the drop files may already be in satellites/puppy-dash/drop/.

## STATUS

## Review 2026-08-24 (PART 1, Opus)

**1. Checks that cannot fail.** Built `scripts/ftw_mutation_drive.js`: applies one
realistic single-point defect to a COPY of index.html, runs the real suite via
FTW_FILE, and reports BITES / WRONG / CRASH / VACUOUS / BADMUT per mutation.
70 mutations across all six groups added yesterday plus persistence and sound.
Result: **67 BITES, 1 CRASH, 0 silently vacuous** at runtime. Three checks were
nonetheless passing on nothing and are now pinned, each proved by a mutation
that the old form let through:
  - `the ledger nests: watched >= organized >= in the streets` did NOT catch the
    street count losing its coverage factor. The invariant is correct but
    under-exercised: streets = organized x share with share >= 0.35, so it only
    breaks where coverage < share, and a bot run never sits there. Pinned with a
    direct low-coverage uprising fixture. review: nesting bites now.
  - `the closing line does not duplicate the watched tile` asserted
    `!watched || !asked || watched !== asked`: either regex missing was a pass.
  - `a junk bubble in a save is dropped` did string surgery on the save blob and
    never checked the replace landed.
  - `no population milestone puts raw player markup into the news` (the P0 guard)
    read S.log for a raw payload; an empty log passed it. First fix required the
    ESCAPED name present, still too weak because the founding "installs its
    first unit" line carries it with zero milestones fired. Now requires a real
    POP_MILES headline in the log.
  Also fixed the driver: exit != 0 with no FAIL lines means the suite DIED, not
  that it passed. It reported that as VACUOUS until traced by hand.
  146 -> 148 checks, 150 with FTW_SELFTEST=1.

**2. Parsers over rendered HTML.** 21 parser sites audited. 2 provably VACUOUS
(both fixed above). 7 VACUOUS-RISK left as FOUND, all of the same shape: a
regex over game markup whose miss is indistinguishable from a pass. The parity
parser is the safest of them because `emptyLabels` already guards it, but it
guards only the popover side, not the World side.

**3. Flaky assertions.** The sim calls Math.random 27 times and check.js never
seeds it, so the suite runs against a genuinely stochastic model. 20 consecutive
runs produced byte-identical verdicts across all 146 checks. No flip. The
"a long run actually ticked" floor at >200 did not fire once.

**4. Escape coverage.** 18 vendor-name output sites. 13 reach HTML and **13 of 13
are escaped** (5 via CO(), 8 via inline escH(s.co), including all 8 population
milestones: yesterday's P0 fix verified in place). 5 raw sites all land on sinks
that cannot execute markup: 4 textContent, 1 navigator.share/clipboard. 26
innerHTML assignments, zero insertAdjacentHTML, zero document.write, and **zero
innerHTML sinks carry a raw vendor name**. escH escapes all five of & < > " '
and uses split/join. **Item 4 passes: no unescaped path reaches HTML.**

**5. Looked, not gated.** 24 screenshots in `portal-assets/review/ftw-morning-aug24/`,
portrait 412x915 and landscape 915x412, opened and read. The walk script
`scripts/ftw_review_shots.mjs` asserts the live screen after every navigation,
because the first version logged "shot 05_game_landscape" while the screen was
still the menu: it had FOUND the CTA, computed a rect below the landscape fold,
and tapped empty space. Finding an element is not tapping it.

**Gates, all exit 0:** FTW check.js 148, FTW_SELFTEST 150, portal_ux_check 26 ok,
advertised_count_check 7 true, test_inline_drift aligned, smoke_shells 66 pass,
catalog 161 openable.

FOUND: showBannerNow double-escapes. `$('breakTxt').textContent=' · '+txt` is fed
  already-escaped HTML, so a vendor named O'Brien Sightline shows the player
  "O&#39;Brien Sightline". Visible defect, not a security one.
FOUND: s.co has no length clamp in newState or loadRun. The 24 char limit lives
  only in the UI (maxlength + slice in chosenCo). A hand-edited save can carry
  any length.
FOUND: the skill trees do not work in landscape, the game's intended Play
  orientation. At 915x412 the sheet header eats ~150px of 412 and exactly ONE
  node is visible; portrait shows five and the tree structure. Deployment,
  Watchlist and Crisis all the same.
FOUND: the end screen clips itself in landscape. The headline is cut off above
  the fold and the "N people were never asked" closing line is cut off below it.
  Portrait renders the whole card correctly. The stat grid is a narrow centre
  column leaving ~560px of unused width either side.
FOUND: the Population ledger renders its six figures with OS emoji while every
  other surface got custom art. They also render differently per platform.
FOUND: the ledger header rounds 3,511,169 to "4M" directly above a card reading
  3,511,169. Two different numbers for the same quantity on one screen.
FOUND: the NEVER WATCHED bar is full and white at game start, the loudest
  element on the ledger. A full bar reads as an achievement; it means you have
  barely begun.
FOUND: the "Paid Agitators" crisis node icon is near black on a dark card and
  does not read. Same class of problem as mesh/retail/drone.
FOUND: the 1/5 briefing card covers the world map it is pointing at, so "Cameras
  are live in Mali" hides Mali.

[LB] L1 PLAYED IT. 20 shots at 412x915 and 915x412, all opened and read
  (/tmp/claude-1000/-workspaces-lucid-winds/8db8172a.../scratchpad/lb/shots).
  The game is not thin, it is BROKEN, and no gate in the repo loads index.html
  so nothing has ever caught it. Five defects, in order of how badly they hurt:
  [LB-1] ALL THREE JOBS LAY OUT IN A ZERO SIZE FIELD. startJob() calls
    initSort/initGrub/initWire BEFORE show('s-play'), so the .screen is still
    display:none and f.clientWidth/clientHeight are 0. Sorting spawns its tile
    at left = 20 + rand*(0-106), i.e. NEGATIVE, so the falling junk rides half
    off the left edge of a 494x755 empty box. Grub hunt puts all 13 pile items
    at left/top -52..8: they stack in one 44px corner blob, the grub is buried
    under junk, and 24 real taps on the grub's own centre scored ZERO over 13
    seconds. Wire untangle drops all 4 pins in the same corner. Two of the three
    jobs are unplayable and all three look like an empty rectangle.
  [LB-2] YOU NEVER SEE YOUR BUG ON HOME. `.alley svg{position:absolute;inset:0;
    width:100%;height:100%}` was written for the backdrop and also catches the
    minted bug's SVG inside #home-bug, which computes to 494x0. Measured: the
    element is there, 6636 chars of SVG, rendered height 0. With BUGDEX 9 the
    alley is pixel identical to BUGDEX 0.
  [LB-3] THE DUMPSTER HAS NEVER RETURNED A RESULT. paintDump calls
    resolveBattle(buildFighter(a), buildFighter(b)) but resolveBattle takes
    CODEBLOCKS and builds its own fighters, so bugStats(fighterObject) throws
    on all five rows and the screen prints "?" five times. The ?battles=1 gate
    was hiding a crash, not a balance question.
  [LB-4] THE DAILY CAP DIES IN 22 SECONDS. Tapping the right bin at a brisk 380ms
    scored 94 in 22s of a 60s shift and consumed the ENTIRE 90 Shiny day. The
    done screen said "THAT IS THE LOT FOR TODAY" after the FIRST job, with 38
    seconds still on the clock and nothing to earn. HOW TO PLAY promises "three
    good shifts a day". No job has a rate limit: score is bounded only by how
    fast a thumb moves.
  [LB-5] The mint reads cheap. The bug renders ~130px in the middle of 430px of
    dead space, the COMMON pill is grey on grey and reads as disabled, and the
    lore repeats its own sentence ("It maps the drains by heart" twice in three
    lines). At 84px in the Bugdex an UNCOMMON rendered as four faint specks.
  Pacing answer: there is no pacing. One job, 22 seconds, day over. A mint does
  NOT feel earned, it feels vended. The bug reads at phone size only on the mint
  screen. Reason to come back tomorrow: none that the game shows you.
  Landscape: the 540x960 stage scales to 232x412, a narrow column in the middle
  of a 915px screen with black either side, on every screen.
  FOUND: brand string is "Sky Wolf Studios" (plural) in <title>, og:site_name,
    the home subtitle and the exit pill. House rule is Sky Wolf Studio singular.
  FOUND: THE DUMPSTER prints "DAY 20688", a raw epoch day index, to the player.

## The Attic (PART 4, Opus agent) — STATUS

[AT] A1 PLAYED IT. `satellites/attic/shots.mjs` walks the real page and ASSERTS the
  live screen after every step (state snapshot compared against what the step
  promised, plus an elementFromPoint check that the tap point actually lands on
  the target before tapping). 31 shots, 412x915 and 915x412, dsf2, touch, all
  opened and read. Zero console errors, zero page errors. Every assertion green,
  which is exactly why the list below matters: none of this is gate-visible.
[AT] A1 WHAT I SAW, worst first.
  1. THE COLLECTION IS INVISIBLE. Shot 08 is named shelf_full and there is no
     shelf in it. After 14 finds the shelf exists in the DOM and is entirely
     below the fold, under the card. On a phone you cannot see your own
     collection without scrolling past the whole card, and you can never see
     more than the newest 24 at 90px. The game's premise is one-of-one objects
     and it has nowhere to keep them.
  2. THE HEADER EATS THE GAME. Back chip + THE ATTIC + Sky Wolf Studio + a
     four-line marketing paragraph + tickets + WANT LIST + two buttons = the top
     700 of 915 px, on EVERY screen, forever. The object you just found is
     always half below the fold. In landscape 915x412 the card is 100% below the
     fold: the whole game is press a button, then scroll.
  3. THE REVEAL IS A COLOUR CORRECTION. Dusty and wiped differ by: a brown 62%
     wash comes off, and a price sticker appears. You can READ THE NAME, the sub
     line, COLLECT ALL 6 and the year straight through the "dust". The word
     UNWIPED floats in the middle in monospace, which is a debug label, not art.
     No dust animation, no sound, no weight. The one dramatic beat is a
     background-colour change plus a 0.4s scale pop on a rectangle.
  4. FACTORY SEALED, 1 in 261, gets a gradient rectangle. Gold shine plate,
     nothing else. No confetti, no shelf mark, no "first one you have ever
     pulled", no different card treatment. Shot 27.
  5. DUST OFF IS NOT A MINIGAME. 48 identical grey squares, no boxes, no attic,
     no grime texture. One snake drag wiped 46 of 48 cells in about 3 seconds
     with 87 of the 90 seconds still on the clock. Nothing can be missed, so the
     timer is decoration and the panel is a DONE button with extra steps. Wiped
     cells turn near black, so cleaning something makes it darker.
  6. ART DEFECTS, all seen at 240px: record DIAGONAL layout runs the band name
     off the right edge of the sleeve, clipped mid word (shot 17). Cereal: the
     $4.99 price sticker lands on top of the MORNING FOODS banner text and the
     FREE PRIZE burst lands on top of the title (shot 25). Record STACK layout
     is 55% empty cream field with no art in it at all (shot 08). The toy figure
     is a circle, a rounded rect and four limbs with two dot eyes, no mouth, no
     hands, no feet, and it is 20% of every pull (shots 05, 21, 29). TRASHED
     renders as a pale rectangle at the top left and a white scanline across the
     card, which reads as a rendering glitch and not as damage (shot 29).
  7. Overlay scrims are too thin: on the WANT LIST and DUST OFF sheets the page
     title, tagline and the card underneath read clearly through the ground
     (shots 10, 11, 13). Same class of defect the Aug 16 audit fixed for the
     rules sheet, still present on the other two.
  8. In landscape the rules sheet puts START DIGGING below the fold and the
     welcome toast lands in the middle of a paragraph (shot 02).
  9. RUMMAGE . 1 TICKET wraps to two lines in portrait.
  10. Toasts outlive the card that earned them: "A keeper. One ticket back."
     was still on screen over a TRASHED item on the next card (shot 29).
  11. WHY WOULD YOU OPEN IT TOMORROW: five tickets, and a Want List whose
     remaining rows are all of the shape "a cereal box in NEAR MINT or better".
     There is no daily object, no streak, nothing dated, and nothing that is
     different tomorrow. The answer today is: you would not.

## Puppy Dash (PART 2, Opus agent) — STATUS

[PD] P1 DONE. `satellites/puppy-dash/index.html` = the drop prototype extended in
  place (not rewritten). Sky Wolf embed protocol copied verbatim from
  satellites/flock-the-world/index.html (parse time + load time {sws:'ready'},
  window.SWS_EXIT with the close/history/portal fallback chain); the auto
  appended exit button targets #selectScreen, not #menu (this game has no
  #menu, it would have silently no-opped). dev-gate.js?v=2 is first in <head>.
  manifest.webmanifest added (theme #74c4ff, portrait, icon = the generated
  thumb pending real art). Feedback fab mounted home:'top-right', game slug
  'puppy-dash' (this game paints pause/mute/debug bottom right in CSS circles).
  Portal card added after Burrow Bowl: beta:true, fresh:true, cat "action",
  ic dog emoji, url ?v=20260824a, thumb shot from the live title screen via
  scripts/refresh_thumb.mjs (19.7KB, well under the 150KB cap). git diff on
  portal/index.html was exactly the 4 lines I added; nothing else touched.
  catalog.mjs: 183 carded (+1), 161 openable (+0, card is gated as required).
  advertised_count_check.mjs 7/7 ok. portal_ux_check.mjs 26/26 ok.
  ⚠ NOTE for the main session: portal/index.html shows NO working tree diff
  right now because The Attic agent's commit e875c113 ("The Attic A2: the
  shelf is a real collection now") swept my already edited, uncommitted
  Puppy Dash card line into its own commit (shared working tree, its `git add`
  was broader than its own files). The content is correct and verified
  (grep confirms the Puppy Dash line is present, all three gates above pass
  against the committed file) — nothing lost, just attributed to someone
  else's commit message. I did not touch portal/index.html again to avoid
  compounding the cross streaming.
[PD] P2 DONE. Persistence under one `pd_save` blob (best, stash, chosen
  animal, mute) via pdRead()/pdWrite(), read modify write on every save:
  pdWrite always re-reads current disk, merges (MAX on best, ADD on stash
  delta, direct set on animal/mute), then writes. Verified in check.js with a
  real two-context two-tab scenario: a second "tab" writes a bigger save while
  the first is still open, and the first tab's next write neither rolls the
  higher best backward nor clobbers the stash, only adds its own delta on top.
  Corrupt save (`not json{{{`) does not throw on boot and gets replaced clean
  on the next write.
[PD] P3 DONE. `satellites/puppy-dash/check.js`, house pattern modelled on
  satellites/stop-the-light/check.js (vm + DOM/canvas stub, ok()/group(),
  exit 0/1/2). A gated `?pd_test=1` hook (window.PD) exposes state/CFG/
  OB_VBOX/etc and the real update()/reset()/doJump()/pdRead()/pdWrite()
  functions so every physics and persistence assertion runs the ACTUAL game
  code, never a reimplementation. 66 checks: CFG sanity, all 6 obstacles map
  onto the 3 verbs (jump/slide/dodge) with all 3 covered, swept contact proven
  non-tunneling by feeding update() a 6 second single frame dt (no real frame
  can exceed 0.04s) and confirming the crossing still resolves and still ends
  the run, jump apex (~1.3 S, matches the spec's own documented number) clears
  the jump box and slide height (~0.55 S) clears the slide box with margin, an
  obstacle one lane over never kills (with a same lane control proving the
  test is not just vacuously green), persistence survives a simulated reload
  and two tab race, and 3 real headless Chrome touch target measurements at
  375x667 (pauseBtn/muteBtn/dbg all >=48x48 rendered px — see the CSS fix in
  P4 below). ⛔ WATCHED TWO OF THESE FAIL ON PURPOSE before trusting them:
  (1) mutated the swept check into a narrow band test `Math.abs(ob.y-cY)<2` —
  the exact tunneling defect class this test exists to catch — and 3 checks
  correctly went red; (2) mutated pdWrite to skip the read-current step (a
  wholesale overwrite) and the two tab non-clobber checks correctly went red.
  Both restored, suite is 66/66 green on the real file.
[PD] P4 DONE. Two new obstacles from the art bible: puddle (jump, flat low
  ripple ellipse, never blocks a lane change) and trash can (dodge, full lane
  width like the wall). Magnet power up: a horseshoe pickup, 6s duration,
  widens the biscuit lane tolerance to 2.1 (covers all 3 lanes regardless of
  player position) with a pulsing gold ring on the dog while active. Golden
  biscuit: 18% chance per spawned biscuit row, worth 5 vs 1, gold glow render,
  its own +N floater and a distinct 3 note chime. Rainbow poop jetpack
  untouched, still the signature moment.
[PD] P5 DONE. TODO[economy] left in place at the gameOver() call site exactly
  as asked, now a one line console.log of the run summary (distance, biscuits,
  jetpacks used). Verified by check.js that no Firebase/Firestore/Sunbeam call
  sites exist anywhere in the file. Did NOT wire any mint, per the hard rule.
[PD] FOUND (fixed, in scope, my own file): the drop prototype's CSS only had
  `.screen.hidden{display:none}` (a compound selector). #hud, #pauseBtn,
  #muteBtn, #dbg and #hintBar are toggled via a BARE "hidden" class from JS and
  have no "screen" class, so none of that CSS ever matched them — the pause/
  mute/debug buttons and the hint bar were visible from the very first frame,
  before a run even starts, overlapping the title screen. Caught by actually
  looking at screenshot 1, not by any gate (this is a pure visual defect, no
  check would have seen it). Added a standalone `.hidden{display:none!important}`
  rule. Also bumped #dbg/#pauseBtn/#muteBtn from 42x42 to 48x48 (real prototype
  value, below the studio's 48px floor) and respaced their `right` offsets so
  they no longer crowd each other.
[PD] FOUND (not fixed, out of my named scope): in this sandboxed headless
  Chrome, emoji characters (🦴 📏 ⏸ 🔊 🐞 🏆) render as tofu boxes across the
  HUD pills, the game over card and the transport buttons (see shot 1 and
  shot 2). This is very likely a missing-emoji-font artifact of THIS headless
  environment rather than a real device defect (real Android/iOS Chrome ship
  full color emoji fonts) — the same emoji-reliant pattern is already used
  fleet wide (feedback_touch_targets etc history does not mention this game).
  Flagging rather than fixing since I cannot tell from here whether it also
  hits real desktop Chrome without a color emoji font installed.
[PD] FOUND (not fixed, cosmetic, out of scope): when the player never moves
  out of a biscuit lane, 2 to 3 uncollected biscuit rows can stack up close to
  the camera and visually clump into a dense blob rather than a readable
  trail (see shot 3, landscape). Only reproduced because my verification
  script never issues a lane change input; a real player collecting as they
  go would not see this. Worth a look once real art replaces the vector bones
  (a sprite trail may read fine where flat shapes clump).
[PD] LOOKED, not just gated. 3 screenshots, 412x915 x2 (title screen, mid run)
  + 915x412 x1 (gameplay), dsf2, isMobile, hasTouch, fab hidden, all opened
  with the Read tool. My own shot script (scratchpad pd_shots.mjs) asserts the
  live DOM state after every tap (selectScreen actually hidden, hud actually
  visible, distance counter actually advancing) rather than logging "tapped"
  and moving on. What I saw: shot1 (after the .hidden fix) is a clean title
  screen, all 4 animal cards read clearly, "Back to Sky Wolf" sits legibly on
  the road art. shot2 landed on the GAME OVER card, not live action (the run
  ended at 11m — a hydrant right at the start) — an honest capture, not what I
  intended to show, but it confirmed persistence values (Total stash 0 on a
  first ever run) and the composited scene behind the modal shows a puddle and
  a biscuit train rendering correctly. shot3 (landscape, the worst angle on
  purpose for a portrait locked game) letterboxes cleanly to the ~520px stage,
  no overflow or stretching; it also happens to show 2 jump obstacles with
  their telegraph icons, a puddle, and a golden biscuit glowing distinctly
  gold among a tan biscuit train, all rendering as designed.
[PD] GATES all exit 0: check.js 66/66 (2 mutations watched failing first),
  portal_ux_check.mjs 26/26, advertised_count_check.mjs 7/7, catalog.mjs
  (+1 carded, +0 openable). ART-LEDGER.md: added a LISTED row for Puppy Dash
  pointing at PUPPY_DASH_ART_BIBLE.md section 9 (~50 frame minimum viable
  set); explicitly notes the puddle/trash can obstacles added in P4 are not
  yet in that bible section and want their own art rows later. Art: none
  shipped, procedural vector fallback is what ships today and must keep
  working once real art lands (documented in the ledger row).
[PD] DONE for real: live behind the tester wall, all gates green, 3
  screenshots opened and described honestly (including the one that did not
  show what I meant it to). Nothing left undone in P1 through P5. The two
  FOUND items above are genuinely out of this task's named scope (an
  environment font question and a cosmetic clumping case that needs real art
  to properly evaluate), left for Stephen or a later pass rather than
  guessed at.

## RESUME 2026-08-24 (codespace died mid run, Opus main session)

The box stopped between subtasks. Recovered state at resume, verified against
the trees and not against the STATUS text:
- PART 1 review: DONE, committed bc59e6e3.
- PART 2 Puppy Dash: P1 to P5 DONE, committed bda2cf3c.
- PART 4 The Attic: A1, A2 (commit e875c113), A3 (commit 46446253) DONE. The
  agent was killed before it wrote its A2/A3 STATUS lines; the commits carry
  the detail. A4, A5, A6 outstanding.
- PART 3 Litter Bug: L1 DONE (findings above). Upstream /workspaces/Litter_Bug
  commit ef2d341 pushed to origin/main covers most of L2 and L3 (arena in the
  game on the interactive path, one save with levels, daily challengers by
  dayIndex, streak, crown, a fourth block PRY THE LIDS, per job spawn rates,
  bugdex grade spread, save validation, brand singular). The agent was killed
  mid edit: index.html carried an uncommitted set of LB_DEV test hooks
  (growLvl/setKing/setChamp/loadSave/ladderOff/purse/crownPurse/shiftCap/
  dailyShifts), which is a gate being written. The vendored copy in
  satellites/litter-bug is STILL Aug 18 and does not have any of it, so none
  of that work is live. Outstanding: the L3 grade-reads-from-drawn-parts fix,
  L4 graphics, L5 build plus RE-VENDOR and card bump.
- The local static server on 127.0.0.1:8777 does not survive a codespace stop.
  portal_ux_check.mjs failed with ERR_CONNECTION_REFUSED until it was
  restarted; that is an environment failure, not a gate failure.
Gates re-run at resume, all exit 0: portal_ux_check 26 ok, advertised_count
7 true, catalog 183 carded / 161 openable.

## Litter Bug (PART 3, Opus agent) — STATUS, L3 to L5

[LB] L3 grade: reads drawn parts, distribution refit
[LB] L3 DONE. The grade reads the parts that are DRAWN. gradeOf scored six trait
  indices (wing/body/head/pattern/leg/antenna) that _generateBugSVG has never
  looked at once: the renderer draws from seededRng(hash+'|grow') in a
  completely separate stream, so LEGENDARY and COMMON could be the same picture.
  Extracted that roll block VERBATIM into BUG_ENGINE.bugPlan(hash,pal) and made
  the renderer CALL it, so the file has exactly ONE roll sequence. Proof it is
  the same rolls, not a copy: 8000 renders (400 hashes x 5 levels x 4 sizes)
  byte identical before and after the extraction, and forcing wingKind inside
  bugPlan moves 8000/8000. Watched that check go red twice on purpose.
  The scorer moved to bug-engine.js as bugGrade (Node AND browser, one
  implementation; index.html's gradeOf is a 1 line wrapper, LB_DEV.grade still
  reaches it so grade_sim_live.js/grade_tune.js are unchanged). It scores elytra
  shell / four wings / membrane wings, plated carapace, horns, hooked pincers,
  barbed stinger, extra eyes, dorsal spine count with a bonus for a FULL ridge,
  raptorial forelegs, body segment count, patchwork material count. Rare = more
  visibly built. It returns `marks`, the list of parts that scored, and the mint
  and specimen screens print them under the grade pill, so the tier label has a
  receipt you can point at on the art.
  GRADE_CUT refit on 1,000,000 samples of the live scorer: COMMON 33.55 [33.8]
  UNCOMMON 31.95 [32.0] RARE 23.37 [23.0] EPIC 9.11 [9.3] LEGENDARY 1.77 [1.62]
  MYTHIC 0.226 [0.23] COSMIC 0.0252 [0.028], epic+ 11.13 [11.2]. All seven "ok".
  The previous shipped fit had EPIC 1.5x over and COSMIC 2.9x over.
  Stored grades are a cache now, recomputed in _cleanEntry on every load.
  Also fixed in the same class: bugStats' `winged` read (t.wing % 5) !== 4, so a
  bug drawn with NO WINGS could be tagged Flying and carry +22 spd and +12 eva
  for wings you cannot see. It asks bugPlan. Agreement measured at 100%.
[LB] L4 DONE (graphics). Contact sheet first: scripts/bug_contact_sheet.js draws
  every bug at the REAL sizes index.html uses (58 champion picker, 84 BUGDEX,
  150 HOME, 230 the mint) with a flat BLACK silhouette column at 58, the
  smallest a bug is ever drawn, plus a second sheet of one row per grade at
  BUGDEX size so "can you read the grade at 84px" gets an answer you can look
  at. Opened it. Three things I saw and then fixed:
  [G1] THE CAMERA. viewBox was a hard "0 0 200 200" and the fit only ever scales
    DOWN (Math.min(1, 176/w, 182/h)), so a compact bug drew inside about a third
    of its own box. At 84px in the Bugdex that is [LB-5]'s "four faint specks",
    and the mint's 430px of dead space. The camera now frames the FINISHED ADULT
    and holds still, so a level 1 grub sits small in the box it will grow to
    fill, growth still reads, and both ends are legible. Bugs render ~1.6x larger
    at every size. Camera only: 8000 renders proved no path moved.
  [G2] SVG IDS WERE SHARED BETWEEN COPIES OF THE SAME BUG. uid was
    hash.substr(0,6), and your champion is drawn FIVE times at once (HOME, the
    dumpster champion card, the challenger strip, a ladder row, the arena). An
    id reference resolves to the first match in document order, which is the
    copy inside a display:none screen, and Chrome does not rasterize paint
    servers in a hidden subtree. So every visible copy filled with url(#gb0...)
    painted NOTHING: both arena portraits and 2 of 6 Bugdex cards were WIRE
    SKELETONS of legs, antennae and stitches with no body. I found this in a
    real 412x915 dsf2 screenshot; it is invisible at dsf5, which is why no
    review had caught it. Ids are unique per RENDER now. This was the single
    biggest art defect in the game and it was not in anyone's list.
  [G3] SPARKS TRAVELLED IN PERCENT. Nine sparks per hit animated to
    translate(cos(a)*d %, ...) where d is 26..72 and the element is 9px, so a
    percentage transform on a 9px dot moved it 2 to 6 pixels. Nine particles per
    exchange, none of which ever left the middle of the card. Pixels now.
  Belt and braces on top of G2: the merge filter's blur+threshold (alpha must
  clear 0.46) can still blow out at low device resolution, so the body is drawn
  once UNFILTERED underneath the filtered group. Covered pixel for pixel when
  the filter works, the whole bug when it does not.
  Particles + hit flash on every exchange: VERIFIED BY LOOKING, not by grep.
  hitFlash + dmgPop fire on every 'hit' event; I shot the frames at 70/170/430ms
  after a real move tap and can see the "-11" pop, the HP bar drop and a gold
  spark clear of the portrait. (A 'dot' event gets a pop but no flash and a
  'break' gets neither: FOUND, not fixed.)
  Backgrounds: one alley, drawn once, blurred to 34px under a scrim running
  .86 to .985 alpha, tinted per room (dumpster/arena colder, dex greener, mint
  brighter, jobs darker), behind every screen. The FTW lesson is that art behind
  copy goes further back than looks right; this is at the safe end of that and
  on the mint screen it is very nearly invisible. Honest read: it removes the
  flat-gradient feel, it is not yet real background art.
  The grade pill was a 1px grey outline on a dark ground, which on a COMMON read
  as a DISABLED BUTTON ([LB-5]). It is a filled plate tinted by grade now, with
  a real glow at LEGENDARY and up.
[LB] LOOKED, not gated. Full walk of the real page, 13 shots at 412x915 and
  915x412 dsf2 isMobile hasTouch, plus a zoomed dex grid, a contact sheet, an
  8-size isolation sheet and 3 arena frames at 70/170/430ms. The walk script
  ASSERTS the live screen after every step (LB_DEV.cur() compared with what the
  step promised) rather than logging "tapped". All opened with the Read tool.
  What I saw, beyond the fixes above:
  - HOME: the champion is genuinely visible now, standing in the alley under
    the streetlight, and reads at phone size. The alley itself is flat vector
    rectangles with a hard-edged triangular light cone; it is a diagram of an
    alley, not a picture of one.
  - GRUB HUNT: [LB-1] is fixed, 15 pieces spread across the whole field. But
    every piece of junk is a grey rounded square with a lowercase WORD in it
    (cap, bolt, nub, clip, tab). The litter you sort is typography. And the grub
    is a bright mint-green tile among identical grey tiles, so there is no hunt:
    your eye lands on it instantly. FOUND, out of scope.
  - THE MINT: the bug now fills its frame with a shell, stitches, pincers, a
    catchlit eye and antennae, and the marks strip under the pill reads
    "ELYTRA SHELL . HOOKED PINCERS . FOUR SCRAP PATCHWORK", which are exactly
    the parts I can point at in the art above it.
  - THE ARENA: the telegraph, damage band, hit percent, turn order, poise pips,
    HP bars, damage pop and sparks are all real and all visible. There is a
    ~280px band of empty black between the log line and the move cards before
    the first exchange resolves. FOUND, out of scope.
  - LANDSCAPE 915x412: the 540x960 stage letterboxes to a narrow centre column
    with roughly 350px of dead space each side, on every screen. Nothing is
    clipped or overlapping; it is wasteful, not broken. Matches L1. Not fixed:
    a stage layout decision, not a bug.
[LB] L5 gate: `check.js` in the repo root, 83 checks, and it LOADS index.html in
  a real browser, which no gate in this repo has ever done. That is precisely
  why L1's five defects survived to v1. Groups: boot and script block alive;
  the four blocks lay out in a field with a real size (per job: field > 200x200,
  measured ON SCREEN, nothing at a negative offset, nothing past the far edge,
  pieces spread not stacked); the champion is visible on HOME (real rendered
  height, camera not a fixed 200x200); THE DUMPSTER returns five real rows with
  no "?" and no raw epoch day; a battle actually plays and finishes on the
  INTERACTIVE path (move cards, >1 exchange, real damage, an end state, a damage
  pop and a flash or spark seen); the day cannot be drained by tapping fast (58
  taps through the REAL bump() path, not the raw currency function); six junk
  saves each boot into a clean game on HOME with every field validated; the art
  cannot vanish (zero duplicate ids in the document, every card paints filled
  body geometry not just strokes); the grade reads the parts that are drawn;
  48px measured in RENDERED px at 375x667 with an assertion that the stage
  scale is actually < 1 so CSS px cannot lie; every page posts {sws:'ready'}
  TO ITS EMBEDDER in an iframe; zero console errors across the whole run.
[LB] L5 gate, the three checks I had to fix because they were asserting the
  WRONG THING (the sibling of a check that cannot fail):
  - "the game opens on HOME" went red on a clean browser because a FIRST RUN
    correctly opens the rules screen. My earlier green run had localStorage left
    over from a previous test. Now it accepts s-how or s-home and then asserts
    that START WORKING lands on HOME.
  - the {sws:'ready'} group monkeypatched parent.postMessage and reported all
    EIGHT pages as silent. The pages are fine: the post is guarded by
    `if (window.parent !== window)` which is correct, it only means anything to
    an embedder. The check now FRAMES each page in an iframe the way the portal
    does and listens in the parent, matching e.source. Eight broken assertions,
    not eight broken pages.
  - the daily-cap group drove earnShinies() directly, which is the DAY cap, and
    reported 116 of 120 drained. The jobs call bump(), which is where the SHIFT
    cap lives. It drives bump now (LB_DEV.bump added) and asserts both.
[LB] L5 mutation driver: `scripts/lb_mutation_drive.js`, 12 mutations, each one a
  regression of a defect that actually shipped or the removal of a guard added
  because of one. 12 of 12 BITE. Watched red, then restored, every time:
   1 jobs measure the field before show('s-play')          BITES (9 red)
   2 the broad `.alley svg` selector comes back            BITES (1 red)
   3 the shift cap removed from bump()                     BITES (2 red)
   4 the save loader trusts the blob                       BITES (2 red)
   5 SVG ids shared between copies of the same bug         BITES (1 red)
   6 the camera back to a hard 200x200 viewBox             BITES (1 red)
   7 the Flying tag back to a trait index nothing draws    BITES (1 red)
   8 the grade stops naming the parts it scored            BITES (3 red)
   9 the grade scores a trait index the renderer never draws BITES (3 red)
  10 a touch target drops under 48px                       BITES (1 red)
  11 the embed handshake removed                           BITES (2 red)
  12 playMove stops resolving                              BITES (5 red)
  Stability: THREE consecutive clean runs 83 ok / 0 FAIL after the flake fixes
  (earlier: 1 of 4 red on the cap check, 1 of 4 on the exchange count).
[LB] GATES, exit codes: Litter Bug check.js 83 ok 0 FAIL exit 0 (x3 consecutive);
  lb_mutation_drive 12/12 BITE exit 0; node --check on bug-engine.js and
  check.js and lb_mutation_drive.js; both index.html script blocks parse via
  vm.createScript; portal_ux_check.mjs exit 0 (26 ok); advertised_count_check.mjs
  exit 0 (7 true); catalog.mjs exit 0 (161 openable, unchanged);
  vendor_satellites.mjs --check litter-bug = CLEAN @8f046ccc.
[LB] SHIPPED AND LIVE. Upstream /workspaces/Litter_Bug pushed ef2d341 -> 8f046cc
  (2 commits: ee1e566 the grade + the art, 8f046cc the gate). Re-vendored into
  lucid-winds and committed cd1d94d2, path scoped to satellites/litter-bug plus
  the one manifest line in scripts/vendor_satellites.mjs. NOT PUSHED: the main
  session pushes lucid-winds.
  The 6.8 MB inherited-engine.html is EXCLUDED via the manifest's own `drop`
  config (no hand editing of the vendored tree). It is a dev archive of the
  pre-split engine, the running game never requests it, and the only reference
  anywhere is one line in the repo's scripts/smoke.js, a build tool that is not
  vendored. satellites/litter-bug: 8.4 MB -> 1.9 MB, 111 files.
  Probed at the vendored path on the live 8777 server with ?probe=$RANDOM: 200,
  the NEW strings present in the served bug-engine.js and index.html, champion
  SVG 114px tall, zero duplicate ids, zero console errors, all six Bugdex cards
  solid at 84px. A 200 was not the evidence; the new marker was.
[LB] PORTAL CARD CHANGE I WANT APPLIED (I did not touch portal/index.html):
  line 1002, Litter Bug: change  url:"/satellites/litter-bug/?v=20260818a"
                          to     url:"/satellites/litter-bug/?v=20260824a"
  Nothing else on that card needs to move. The thumb is fine; the game's title
  screen has not changed shape. beta:true and fresh:true stay as they are.
[LB] FOUND (real, outside my named scope, NOT fixed):
  F1 THE LITTER IS TYPOGRAPHY. Every piece of junk in every scavenge block is a
     grey rounded square with a lowercase word in it (cap, bolt, nub, clip, tab,
     stub, pin). ART_STYLE.md's whole premise is bugs sewn from litter and the
     litter you actually sort is text. This is a bigger art gap than the bug art
     and it is the first thing a player touches.
  F2 GRUB HUNT HAS NO HUNT. The grub is a bright mint-green tile among identical
     grey tiles: your eye lands on it before you have started. The block's verb
     (search) is never exercised. Same class as the Attic's DUST OFF finding.
  F3 The arena has a ~280px band of empty black between the log line and the
     move cards before the first exchange resolves.
  F4 A 'dot' (damage over time) event gets a damage pop but NO hit flash, and a
     'break' event gets neither. Only 'hit' is fully dressed.
  F5 LANDSCAPE. The 540x960 stage letterboxes to a narrow centre column with
     roughly 350px of dead width each side at 915x412, on every screen. Nothing
     clips or overlaps, so it is wasteful rather than broken, but the game is
     unusable-feeling in the orientation a phone is often held in.
  F6 The alley backdrop is flat vector rectangles with a hard-edged triangular
     light cone that reads as a UI artifact rather than light. It is a diagram
     of an alley, not a picture of one, and it is the only "art" on HOME.
  F7 Bugs sit in the top ~35% of a Bugdex card leaving a gap before the name,
     and card heights go ragged when a name wraps to two lines.
  F8 scripts/smoke-render.js still needs `sharp`, which is not installed in this
     repo (no node_modules at all upstream). 9 of 10 smoke harnesses run; that
     one cannot. My new scripts use the lucid-winds puppeteer via an absolute
     require path for the same reason.
  F9 The repo's own STATUS.md / ROADMAP.md / NEXT_SESSION.md still describe the
     pre-2026-08-24 state (battles dark behind ?battles=1, three blocks, no
     levels). They are stale, not wrong-in-a-dangerous-way, so I left them.
[LB] HALF DONE, honestly: L4's "background per screen" is the weakest thing I
  shipped. It is ONE alley, blurred and tinted per room, not five backgrounds,
  and under the scrim it is very nearly invisible on the mint screen. It removes
  the flat-two-stop-gradient feel and nothing more. Real per-screen art is still
  outstanding, and F1/F6 are the places to spend it.

## The Attic (PART 4, Opus agent) — STATUS, A2 to A6

[AT] A2 STATUS (RECONSTRUCTED by the resume agent from commit e875c113 and the
  code on disk; the killed agent never wrote this line). Shipped: THE SHELF
  screen (#shelfSheet), every find at 260px sleeve art, 2 cols on a phone and 3
  at >=620px, sorted NEWEST / CONDITION / TYPE, paged 24 at a time so a 400 item
  shelf does not build a megabyte of SVG; a summary line counting the collection
  by class that finally reads WAL.best. Sorting by CONDITION pins UNWIPED finds
  to the END, because sorting them into the graded run leaks the grade by
  POSITION. A per object card that FLIPS (#fcSheet): front is object + name +
  sub + factory error + grade plate and carries its own WIPE button; back is the
  paperwork (condition, era, year, found date, markings, error, story, full
  hash). SAVE THE CARD and SHARE: a 640x960 canvas card drawn from the object's
  own SVG, blob built when the card OPENS not when SHARE is tapped (an async
  decode loses the user gesture on iOS). New attic_found_v1 map in attic-econ.js
  (hash keyed, pruned to shelf, merged earliest-wins). Bugs fixed by looking:
  the saved card had a BLACK HOLE where the object should be, because the
  renderers emit &middot;/&hellip; which the HTML parser knows and the XML parser
  inside an <img> does not (svgForImage now folds them to literals); wiping from
  the main card left the shelf thumb dusty; record DIAGONAL ran the band name off
  the right edge; the cereal price sticker landed on MORNING FOODS and the FREE
  PRIZE burst on the title (wear() took a per shape sticker anchor); the board
  game year sat where the sticker lands; the carded toy gimmick line clipped mid
  word; "2 cereal boxs"; the pitch paragraph now folds away once there is a
  collection, and a new find scrolls into view. Gates at that commit:
  test/attic-check.js 62 passed 0 failed; walk 39 shots all assertions green.
  ⚠ That commit also swept the Puppy Dash agent's uncommitted portal/index.html
  card line in (shared working tree, broad `git add`) — see the [PD] P1 note.
[AT] A3 STATUS (RECONSTRUCTED from commit 46446253). Shipped: TODAY'S FIND, one
  object a day, free, the SAME object for every player, derived in
  attic-engine.js from the day index and DAILY_SALT only (no device id, no time
  of day, no crypto random) and still arriving UNDER DUST. Determinism proved in
  the walk the LISTDLE way: same date twice matches, a different date differs,
  and the hash ignores time of day so it turns over at midnight and nowhere else.
  THE STREAK: consecutive days CLAIMED (not opened), paying 1 ticket every 7th
  day = 0.14/day, which cannot outrun the 5 ticket allowance so the solvency
  assertion does not move. THIS WEEK'S WANTED: one described object per week on
  the week index, everybody hunting the same thing, paying double; FACTORY SEALED
  and the class specific factory errors are EXCLUDED from that pool because a
  weekly hunt with a 0.39% hit rate is not a hunt. Save layer: dailyDay, streak
  and wkDay merge by MAX and a future stamped save resets them. Also fixed
  RUMMAGE . 1 TICKET wrapping to two lines at 412px. Gates at that commit:
  test/attic-check.js 62 passed 0 failed; walk 41 shots green.
[AT] A4 DONE, commit db318d27. FIVE FAMILIES BECAME TEN: comics, paperbacks,
  zines, LCD handhelds and lunchboxes join records, tapes, toys, board games
  and cereal boxes. Each has its own grammar, its own renderer and its own
  condition tells, because a comic does not wear the way a record wears
  (comics roll at the spine and rust their staples; paperbacks crease white up
  the spine, yellow at the page block and dog ear; zines fold in half, ring
  with coffee and lift their toner; handhelds lose an LCD segment and corrode
  in the battery bay; lunchboxes freckle with rust, dent and scrape to bare
  steel). FACTORY SEALED is per family too: comics are bagged and boarded with
  a header card, zines are still in the mailer, handhelds are on a blister.
  Distinct titles per family over 40k pulls: 1397 to 3114. Exact duplicate
  pulls 0.56% to 0.15%. Class split is a documented table on the raw byte
  (RECORD 19.9 down to LUNCHBOX 4.3) and the suite reads its expectations OFF
  that table now instead of carrying a stale copy of 35/25/20/12/8.
  ⛔ THE CONDITION LEAK ALMOST REPEATED: every one of the five new families had
  a notes bank with the 2026-08-16 toy defect written into it (a comic that
  says "bagged, boarded, and never read again" BEFORE you wipe it has told you
  it is MINT). Wear notes moved to _flaw, high grade notes to _mint, and the
  hand written toy branch in hashToItem is now ONE path every class opts into.
  ⛔ SEVEN GRADES, THREE PICTURES: found on the contact sheet. heavy fired on
  TRASHED, mid on PLAYED and GOOD, and FINE/NEAR MINT/MINT were the same
  drawing with the price sticker moved a few pixels. There is a patina ramp
  now plus a FINE scuff, a NEAR MINT tick and a MINT sheen.
  Found by LOOKING at the contact sheet at real render size: the VHS spine
  label printed "HE CHURCH VAN THAT S" clipped at BOTH ends; the board game
  premise ran off both sides of the lid; the toy price sticker landed on the
  toy's own name; the paperback title was dark red on dark grey in the 1990s
  palette (ink is picked by background luminance now); the lunchbox litho was
  drawn dark on dark so the lid read as an empty cream field; and the dispatch
  chain ended in a fallback to drawCereal so any family without a renderer
  would silently have come out as breakfast.
  The walk's seven fixture hashes all silently changed CLASS when the split
  moved and it went on shooting them under their old names (the cell labelled
  "cereal" was a handheld). Fourteen fixtures now, and the walk ASSERTS each
  one is what it is called before it uses it.
  ⚠ ONE TIME VISIBLE CHANGE for returning players: a saved find whose byte 0
  now falls in a different band comes back as a different KIND of object, and
  the want list reshuffles. Grades, eras and years untouched. Beta card.
[AT] A5 DONE (commit pending walk). GRAPHICS, A1 items 3 through 7.
  THE DUST. It was a flat #6b5f4c at 0.62, a brown wash you could read the
  name, the sub line, COLLECT ALL 6 and the year straight through. It is two
  stacked layers compounding to about 0.956 now, with cloud, grit, lint, a
  cobweb in a hash picked corner and a thumb swipe cut through it as an even
  odd hole. It took 0.956: at 0.91 the record's new high contrast title plate
  still punched through. ⛔ NO SVG FILTERS anywhere in it (the studio's known
  iOS killer), the density is layers and geometry. The word UNWIPED is GONE
  from the artwork: 14px monospace with 5px letter spacing floating in the
  middle of a picture is a debug label. The shelf chip still says UNWIPED,
  which is where a label belongs. One dust renderer now, in sleeve-render.js,
  used by every family; object-render carried a second copy that would have
  drifted the first time either was tuned.
  THE WIPE. The one dramatic beat was innerHTML swapping the dusty SVG for the
  clean one between two frames. It is an animation now: the clean art is built
  AT THE MOMENT OF THE WIPE (never before it, so the grade is not sitting in
  the DOM waiting to be read), a cloth sweeps down over the object, the dust
  layer clip-paths away under it, and twelve motes of dust throw off the
  middle. Runs on the card AND on the shelf's object card, one function.
  ⛔ Digging fast enough left every previous wipe's timer alive with twelve
  animated divs each and thirteen digs in a row DETACHED THE FRAME in headless
  Chrome. One wipe at a time per slot now. The walk reports a renderer crash
  out loud, because "Attempted to use detached Frame" reads as puppeteer
  misuse and is actually the page dying.
  FACTORY SEALED. It got a gradient rectangle for a 1 in 256 pull. Now: the
  card takes a gold hairline and a pulsing halo, twenty six gold flecks burst
  from the plate, and a line underneath reads ONE IN 256 / "The first one you
  have ever pulled" the first time or "Nobody has opened this. Nobody ever
  will." after. Sealed finds carry a gold border on the shelf too. The generic
  "A keeper. One ticket back." toast is suppressed on a sealed pull.
  ⚠ ODDS COPY: the card says ONE IN 256, which is the DECLARED rate (grade()
  returns FACTORY SEALED only on byte 2 === 0xFF, so 1/256 = 0.391%). The
  handoff and the portal card say 0.383%, which is 1 in 261. See FOUND below.
  DUST OFF IS A MINIGAME NOW. It was 48 divs with one class toggle each: one
  snake drag wiped 46 of 48 in about three seconds with 87 of the 90 seconds
  still on the clock, nothing could be missed, and wiped cells turned NEAR
  BLACK so cleaning something made it darker. It is a canvas scrub: warm boards
  under grey brown grime, a depth grid that IS the picture (upscaled as an
  alpha mask, so the score and the visual cannot drift), ONE bite per cell per
  stroke, dust settling back every 25 seconds, and a stub that only reads when
  the grime over it is actually gone. MEASURED IN THE BROWSER: one snake drag
  now clears 31 to 34% and finds ZERO of the ten stubs; a full clear takes 33
  panel widths of dragging (about 10,200 stage px), which is 25 to 40 seconds
  of committed scrubbing. The panel is square and 520px wide instead of a
  small card floating in black.
  THE ATTIC AS A SCENE: rafters, a round window with one shaft of light, a
  hanging bulb, a stack of crates and a chair along the floor, and ten dust
  motes drifting up through the beam. ⛔ pointer-events:none, aria-hidden, and
  every tone within a few points of the page ground.
  Overlay scrims: the WANT LIST and DUST OFF grounds were rgba(10,8,5,0.86)
  and the page read through them. Both fully opaque with a blur behind now,
  same rule the rules sheet got on 2026-08-16.
  Also: toasts no longer outlive the card that earned them; the rules sheet
  fits at 915x412 so START DIGGING is above the fold; the record STACK layout
  was 55% empty cream field and has a bleed off disc, a rule stack and a title
  plate now; the carded toy figure was a circle, a rounded rect, four limbs
  and two dot eyes with no mouth, hands or feet on a fifth of every pull, and
  is a real figure with a face and one hash picked accessory.
[AT] A6 DONE, commit 1e294bd2. `satellites/attic/check.js`, house pattern (vm
  for the page, ok()/group(), exit 0/1/2) plus ONE real browser group, because
  48px is RENDERED pixels and a CSS declaration is not a measurement.
  127 assertions with the browser, 98 with AT_NOBROWSER=1.
  ⛔ It SUPERSEDES test/attic-check.js rather than orphaning it: that file is
  now a five line shim that runs check.js and returns its exit code, so
  `node test/attic-check.js` is still true and nothing asserts twice.
  Groups: page compiles + every module it names exists; no dash characters and
  no dead names in player copy; determinism; the declared class split over
  60,000 draws; the condition ladder within 10% at every rung with FACTORY
  SEALED at 1 in 256; generator depth per family; nothing says the condition
  before the wipe (220 objects swept through all 256 values of the grade byte,
  text AND dusty art); seven grades render seven different pictures FOR EVERY
  FAMILY; daily determinism; economy solvency; corrupt save; the embed
  handshake in a REAL iframe; every control at 375x667; DUST OFF is a
  minigame; persistence survives a reload; zero console errors.
  ⛔ THE CONTROLS GROUP: every rule is a predicate run a SECOND time against
  deliberately broken code and the broken run has to go red. Ten controls, all
  biting: clock seeded daily, frozen daily, daily that reads the time of day,
  ladder with no grail, ladder tilted past tolerance, a name carrying the
  grade, dusty art changing with the grade, a wholesale wallet write, a full
  scrap refund, a loader that trusts a negative ticket count.
  FOUR CHECKS WENT RED AGAINST THE REAL CODE AND FOUND REAL BUGS:
   1. ⛔ THE DAILY GROUP WAS VACUOUS AND I WATCHED IT BE VACUOUS. I mixed
      Date.now() into DAILY_SALT in the real engine and the WHOLE daily group
      stayed green, because dailyHash(d) === dailyHash(d) calls the function
      twice inside the same millisecond and a clock seeded daily agrees with
      itself for a whole millisecond. Added `stableOverTime`, which busy waits
      past a tick boundary and asks again, and reseeded the control off
      Date.now() so it fails the way the real defect fails. Re broke the
      engine after the fix: RED, exit 1. Restored: green, exit 0.
   2. THE RECORD, THE FLAGSHIP CLASS, HAD THREE VISIBLE GRADES NOT SEVEN.
      PLAYED and GOOD rendered byte for byte identically and so did FINE and
      NEAR MINT, because A4's ramp was only wired into object-render and
      records go through sleeve-render. Ramp moved to one place. Caught only
      because the group sweeps EVERY family; the first version swept one base
      hash and passed.
   3. The page carried "Sky Wolf Studios", plural, against the house rule.
   4. A hand injected condition leak in the sticker line was caught at 51,920
      leaks out of 56,320 sweeps, so the guard on the game's one dramatic beat
      bites against the real engine and not only against a mock.
[AT] LOOKED, not just gated. Two contact sheets first, at REAL render size with
  a flat BLACK column at 64px (the smallest size the art is ever drawn), all
  ten families x five sizes and all ten families x dusty plus seven grades.
  That sheet is where "seven grades, three pictures" and five of the six
  clipping defects came from. Then 57 walk shots at 412x915 and 915x412 dsf2
  touch fab hidden, plus nine focused looks at the home screen, the dust panel
  fresh / one pass / cleared, and the sealed reveal dusty / mid wipe / done /
  landscape. Every one opened with the Read tool.
  What I SAW, honestly: the home screen is a room now, and the crates, the
  rafters, the beam and the motes all sit far enough back that the cream body
  copy is still the easiest thing to read. The dust hides the object: at 240px
  a large display headline still ghosts through as a shape, which I am calling
  acceptable (real dust does that, and what is being hidden is the CONDITION,
  not the name) but it is not total. The dust panel at one pass shows the
  stubs as faint shapes, not readable labels, which is the line I wanted. The
  sealed reveal throws gold across the whole screen and reads as an event.
  And on an EMPTY shelf the bottom 55% of the portrait screen is scenery only,
  which reads as "the game is at the top and the picture is at the bottom"
  until you have a find or two.
[AT] GATES, all exit 0: check.js 127 passed 0 failed (98 with AT_NOBROWSER=1),
  shots.mjs walk 95 assertions / 57 shots / no console or page errors,
  portal_ux_check 26 ok, advertised_count_check 7 of 7 true, catalog 183
  carded / 161 openable (unchanged, no card added or removed).
[AT] ⛔ PORTAL CARD CHANGE I WANT APPLIED (I did not touch portal/index.html).
  Line 1003 of portal/index.html, The Attic card. Three edits:
   1. BUMP THE VERSION so the live site serves this build:
      url:"/satellites/attic/?v=20260824a"  ->  url:"/satellites/attic/?v=20260824c"
   2. The description still advertises five families out of ten. Replace:
      ds:"Rummage up one of one fake vintage records, tapes, and toys, and pray for factory sealed."
      with:
      ds:"Rummage up one of one fake vintage records, comics, tapes, toys and handhelds, and pray for factory sealed."
   3. The thumb portal-assets/thumbs/the-attic.png is dated 30 Jul and predates
      the shelf, the daily, the ten families and the whole attic scene. Worth a
      fresh shot from the real home screen via scripts/refresh_thumb.mjs (cap
      150KB). Not blocking; the card works without it.
  Everything else on that card is right: beta:true, fresh:true, ic 📼,
  cat "creative". Card count must not move.
[AT] FOUND: the odds copy disagrees with the code. grade() returns FACTORY
  SEALED only when hash byte 2 === 0xFF, so the declared rate is 1/256 =
  0.391%, and I put ONE IN 256 on the reveal. HANDOFF-OPUS-AUG24.md and the
  PART 4 brief both say 0.383%, which is 1 in 261 and looks like a measured
  sim artefact rather than the ladder. Not fixed anywhere outside the game.
[AT] FOUND (not fixed, out of my named scope): at 915x412 the whole game is
  still a 420px centre column with about 250px of unused width either side,
  and RUMMAGE sits below the fold on a screen with 900px of width going spare.
  This is A1 item 2, which belonged to A2. The concrete fix is a landscape
  two column layout (controls left, card right) behind
  `@media (orientation:landscape) and (max-height:620px)`. It is a layout
  change, not a CSS tweak, and it wants Stephen's eye on it.
[AT] FOUND (not fixed, out of scope): the game has NO AUDIO at all. A1 item 3
  asked for the reveal to have weight and it now has motion and light, but a
  wipe with no sound is still half a beat. The fleet has no shared audio kit
  that I found in this tree, so this is a build decision rather than a patch.
[AT] FOUND (not fixed, out of scope): the CSS class on the tagline is still
  literally `.demo-note`, which the 2026-08-16 audit already called out.
  Cosmetic, but it is the last thing in the file still calling this a demo.
[AT] FOUND (amendment to the landscape item above, seen in shot 49 of the final
  walk): THE SHELF screen has the same landscape problem as the home screen.
  At 915x412 the title, the summary line and the three sort buttons eat 340 of
  the 412 available pixels, so the first screen of the collection shows the top
  seventy pixels of ONE row of cards and their names clip mid line. It scrolls,
  so it works, but a collection screen whose first screenful is one and a bit
  cards is not showing you a collection. Same fix as the home screen: a
  landscape layout, not a CSS tweak.
[AT] A4, A5 and A6 are DONE and committed (db318d27, 22d34891, 1e294bd2). The
  working tree is clean. Nothing in PART 4 is half done. The three FOUND items
  above are genuinely outside the A4/A5/A6 briefs: a landscape layout change,
  an audio decision, and a CSS class name the previous audit already logged.

## Main session, after both agents returned (Opus)

Verified both agents independently before pushing anything, because a report is
not evidence: Litter Bug upstream clean at 8f046cc with nothing ahead, the
vendored index byte identical to upstream, `check.js` 83 ok / 0 FAIL on a cold
run in this session, `satellites/attic/check.js` 128 passed / 0 failed on a cold
run, and all three Attic commits path scoped to `satellites/attic/` only.

Then LOOKED at Litter Bug, which is what found the rest of this. Real taps on
real controls, every tap refused unless `elementFromPoint` at the control's
centre actually hit it, every shot asserting the live screen before firing.
Two of my own probes were wrong before the game was:
  - the first pass drove `LB_DEV.show('s-dex')` and shot an EMPTY Bugdex reading
    "BUGDEX 0" while the save held six bugs. `show()` does not run `paintDex()`.
    A screen you jumped to is not a screen you opened.
  - the first mint loop never awaited `doMint`, which is async, so it seeded
    zero bugs and I nearly filed "the Bugdex is empty" as a defect.

CONFIRMED FIXED by measurement, not by reading the commit: HOME's bug renders
114x114 with 8848 chars of SVG (was 494x0), zero duplicate ids in the whole
document, the grub hunt field is 378x660 with 16 items and ZERO at a negative
offset (was 13 items in a 44px corner), THE DUMPSTER prints five named
challengers with real stats and purses 8 to 20 and zero "?" and no raw DAY
number, and one tapped move card produced a real exchange: "Velvet Skit used
Ambush for 19 damage. Sir Ember Katydid used Retaliate for 31 damage."

FIXED (mine, upstream 011fd74, re-vendored): the champion picker was slicing
  every one of its six tiles, 33px off the bottom in portrait and 19px in
  landscape. `.champstrip` declares height:124px but is a flex item in a column
  flex parent, so flex-shrink:1 squeezed it to 69.5px while its 104px children
  did not shrink, and overflow-y:hidden hid it. `flex:none` holds the height:
  clientHeight 124 == scrollHeight 124, zero clipped, both orientations.
  `scripts/clip_sweep.mjs` upstream is the gate for the whole class.
  ⛔ The first version of that sweep was VACUOUS: it walked screens with
  LB_DEV.show(), so every list it measured was empty and an empty list never
  overflows. It reported CLEAN against the file that had the bug in it. Caught
  only because I ran it against the known defect before trusting it. Rewritten
  to navigate by real taps it reports the defect (cut 52px, box 70px, both
  orientations) and reports clean on the fix.

FIXED (mine): `scripts/refresh_thumb.mjs` handed back a 480x480 wall of RULES
  TEXT for The Attic and exited 0 saying OK, because the game shows its HOW TO
  PLAY sheet on a first visit and the script only seeds sws_dev_ok. Added
  THUMB_SEED, a JSON object of localStorage keys, so a first run overlay can be
  dismissed before the shot. Reshot with THUMB_SEED='{"attic_how_v1":"1"}' and
  OPENED it: the title screen, the ten families, the ticket and shelf and want
  list chips, TODAY'S FIND, the weekly wanted, both CTAs, the attic room dim
  behind. 27 KB.

FOUND: LITTER BUG'S JUNK IS TYPOGRAPHY, AND IT IS THE BIGGEST GAP LEFT. Every
  piece in the grub hunt is the same grey rounded square with a lowercase word
  in it (stub, tab, pin, nub, cap, nut, clip) and the grub is the SAME square in
  green. There is no hunt: the one coloured tile is the only thing your eye can
  land on. The agent filed this as F1 and F2 separately; they are one defect and
  it is worth more than any remaining balance work.
FOUND: at arena and list size the bugs do not read as different creatures. Five
  challengers on THE DUMPSTER are five brown and grey smudges separated only by
  tint, and the two fighters in the arena are the same silhouette recoloured.
  The L3 work made the GRADE read from the drawn parts, which is right, but the
  parts still do not read at the sizes the game actually draws them.
FOUND: the exit pill overlaps the HOW TO PLAY button on Litter Bug's HOME,
  bottom left. A painted control sitting on a game control.
FOUND: the arena has a dead band of roughly 125 CSS px between the battle log
  and the move cards, and the log itself is two unstyled lines flush left while
  every other element on the screen is in a rounded card. It reads as debug text
  dropped between two panels.
FOUND: the grub hunt field's bottom third is empty; 16 items cluster in the top
  two thirds of a 378x660 box.
FOUND: Litter Bug calls itself LITTERBUGS on its own title screen while the
  portal card says "Litter Bug". Two names for one game.
FOUND: "Leave the dumpster" and "Back" are sentence case among otherwise
  all caps controls.

Attic portal card applied by the main session (agents were kept out of
portal/index.html on purpose after yesterday's cross streaming): url
20260824a -> 20260824c, ds rewritten for ten families, thumb reshot.
Litter Bug card 20260818a -> 20260824a.

Fleet gates, all exit 0: portal_ux_check 26 ok, advertised_count 7 true,
catalog 183 carded / 161 openable, test_inline_drift 11 in sync 0 drifted,
smoke_shells 66 pass.

## Main session, looking at The Attic (Opus)

Spot checked the two claims that carry the most weight, by driving the real
code rather than reading the commit.

DUST OFF is a minigame now, measured. Panel 346x346, brush R21, bite 0.34,
dust settling every 25s, 89s on the clock. ONE snake drag of three passes
(1038 stage px) clears 12% and finds ZERO of the ten stubs. A full clear costs
11418 stage px, which is 33 panel widths of dragging, and finds all ten. This
morning one drag cleared 46 of 48 cells in about three seconds. A1 item 5 is
genuinely closed, and the overlay scrim behind the sheet is opaque now, which
closes A1 item 7 for this sheet.

FACTORY SEALED earns it. Forced a real 0xFF hash through the real reveal path
(no mocked grade): a bagged and boarded comic in a poly sleeve over a board,
a 15 cent price box, imprint, a red banner blurb, the sealed suffix on the
title, a full width gold plate, ONE IN 256, and "The first one you have ever
pulled. Nobody has opened this." That is not the gradient rectangle A1 saw.

FIXED (mine): 17.10% of every comic title was grammatically broken. Nine of the
24 heroes and ALL FOURTEEN teams already carry their own article, and two
templates supplied a second one, so the game printed "INCREDIBLE THE
PALLBEARERS", "THE RELUCTANT THE CROSSING GUARD" and "DAUNTLESS THE SHORT
ORDERS". Added deThe() and moved template 4 under the article. Broken rate
17.10% -> 0.00% over 40k comics. They read as period comics now: THE INCREDIBLE
PALLBEARERS, THE MIDNIGHT LAMPLIGHTER, THE UNCANNY NIGHT SHIFT.
Proved the blast radius rather than asserting it: over 60k objects compared
against the committed engine, 1238 names changed (2.06% of all objects, which
is the 17.1% of comics) and ZERO other fields moved. Grade, era, year, class,
lore, sub, flaws all bit for bit identical. The picks happen in the same order;
the surgery is on the string afterwards. check.js still 128 passed / 0 failed.
⛔ I measured this wrong first: a regex `^THE .+ THE ` called 34% broken by
counting "THE SUMP KING VS. THE PAPERWORK", which is a good title. Re-measured
against the actual K_ADJ / K_HERO / K_TEAM banks. Never regex a parseable
structure, including your own bug report.

FOUND: in landscape 915x412 the WIPE OFF THE DUST control sits at y 754 to 806
  in a 412px viewport, 368px BELOW THE FOLD. The page scrolls (scrollHeight
  1056) so it is reachable, but the single action the whole game is built on is
  entirely off screen on arrival. My tap helper refused to fire on it, which is
  how it was found: elementFromPoint at the control's centre returned null.
  This is the measured version of the agent's own landscape FOUND.
FOUND: on the sealed reveal the header still takes the top ~700 of 915 px, so
  the rarest pull in the game begins below the fold. The A1 marketing paragraph
  is gone, but the back chip, the title, the byline, three chips, TODAY'S FIND,
  the wanted line and two CTAs are still above every card.
FOUND: DUST OFF's uncovered ticket stubs are cream on tan and barely more
  legible than the grime. The cleared band reads as lighter dust rather than as
  a find. The scrub is good; the payoff needs contrast.
FOUND: DUST OFF's only control is DONE, styled like a primary CTA, sitting next
  to copy that says six more tickets are worth finding today. An early tap ends
  the panel with no confirm.
FOUND: the comic cover interior is the weakest art on a comic card. One
  silhouette, a sunburst and a banner, inside sleeve furniture (bag, board,
  price box, imprint) that is much more convincing than the cover it holds.
