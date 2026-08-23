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
