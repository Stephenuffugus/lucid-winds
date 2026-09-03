# SEP 03, REVIEW OF THE 3D AND VR AUDIT (V1)

Written by Opus on 2026-09-03 after finishing `HANDOFF-3D-VR.md` section 5, task V1.
Companion to that file, which is the brief this answers. **For Fable: section 5 below is
the paste ready review prompt.** Everything above it is what you need to know before you
read a line of the output.

Branch `add-sproing-jumper`, three commits, nothing pushed to main:

```
32d35661  Quest triage refresh: the selftest gate had never run
eba9b2ac  3D and VR audit: all 187 carded rows judged, ranked, and shot
4c91fd32  Shortlist: answer section 9's guesses, pick by pick
975c338f  Effort: the letter now follows the DAYS, and a gate asserts it
```

---

## 1. What was asked and what landed

V1 asked for every carded row judged for a VR lane and a 3D asset route, a ranked
shortlist, shots of the top twelve, and two generated documents that cannot disagree with
their data. All of it is on the branch.

| file | what it is | who writes it |
|---|---|---|
| `docs/3d-vr-audit.json` | 187 rows, the source of truth | by hand, via a scratchpad builder |
| `docs/3D-VR-AUDIT.md` | the full table | **generated**, `scripts/vr_audit_md.mjs` |
| `docs/3D-VR-SHORTLIST.md` | ranked top 10, the shots read, Against Aug 16, Against section 9 | by hand |
| `docs/3D-ASSET-CANDIDATES.md` | the phone half, feeds W1 | by hand |
| `docs/shots-vr/` | 38 images, every one opened | `scripts/shoot_games.mjs` plus a scratchpad variant |
| `scripts/vr_audit_check.mjs` | the gate | new |
| `QUEST-COMPAT.md` | regenerated | `scripts/quest_triage.mjs` |

**Counts, built against `node scripts/catalog.mjs` = 187** (120 satellite, 67 native, 26 gated):

```
lane     TABLETOP 79 · STANDING 10 · WINDOW 88 · NEVER-IMMERSIVE 10
route    PRERENDER 177 · SKIN 6 · RIDE 2 · NONE 2
effort   S 85 · M 12 · L 90          comfort  SAFE 175 · CARE 2 · HAZARD 10
UNREAD   3
```

---

## 2. The three things I would attack first if I were reviewing this

### 2.1 TABLETOP is 79 rows and that number is doing a lot of work
Section 4's test is "the play area fits one screen without scrolling, and the verbs are
reach, place, flick, throw, stack." Applied to this catalog it passes 79 times, because
**165 of 187 rows have a fixed camera**: the house pattern is a `540 by 960` stage with
`fit()` doing a `scale()` and every `ctx.translate` being sprite local. Chess passes. So does
Mancala, and Shut the Box, and eleven solitaires.

I believe the lane calls are individually defensible and I wrote a specific hands sentence
for each. **What I am less sure of is whether a 79 row TABLETOP lane is USEFUL to the
Director or whether it buries the six that matter.** The effort column is my answer (72 of
the 79 are `L`), but a reviewer might reasonably say the lane word should have been reserved
and the answer should have been twelve rows long.

### 2.2 I departed from the ranking rule, once, and said so
The brief says rank by lane with TABLETOP and STANDING first, then effort, then comfort.
Literally applied that puts all 79 TABLETOP above all 10 STANDING, and since 72 of the
TABLETOP rows are `L`, it buries Ripcord and Aura Off under seventy board games. I read
"TABLETOP and STANDING first" as **both lanes together, above WINDOW and NEVER-IMMERSIVE**.
If that reading is wrong the shortlist order is wrong, and nothing else is.

### 2.3 Moon Claw, Burrow Bowl and Skyshot: STANDING or TABLETOP?
Section 9 guessed TABLETOP for all three. I made all three STANDING, because a claw machine,
a skee ball lane and a slingshot are things you stand at and use an arm on. **This changes
the scene height in V2 Phase 0** (a table at 0.75 m versus a cabinet at chest height), so it
is not a cosmetic disagreement. It is the call I would most want a second opinion on and the
one a headset would settle in a minute.

---

## 3. What I changed outside the audit, and why it needed changing

`scripts/quest_triage.mjs` was in the fence "only for a detector bug with a failing selftest
first." I made four changes and every one had a case watched red first. **Each was found by
the previous one**, which is the part worth knowing:

1. **The `--selftest` gate had never run, on any day.** `catalog.mjs` runs its own selftest
   at module-evaluation time on any process whose argv carries `--selftest`, then exits 0.
   `quest_triage.mjs` imported it statically, so the command printed the CATALOG's six checks
   and never reached its own twelve. A green light wired to a different lamp. Fixed by a lazy
   import; the twelve detector cases ran for the first time and all twelve passed.
2. **Then the resolver.** It knew only `/satellites/<dir>/index.html`, so three rows whose
   source is in this repo read "source not readable from this repo (external repos)" (Lucid
   Winds, LOAF, Whack Box) and **13 rows were triaged by a wrapper**: redirect stubs (Sweet
   Spot is 635 bytes pointing at `sweet-spot.html`) and 53 line `play/*.html` shells that
   defer to `games/_inline/<id>.js`. Every one of those 13 read "ok" without a line of its
   logic being seen.
3. **Then the motion detector, which the fix to 2 immediately exposed.** With the real files
   in front of it, it called Lucid Winds and LOAF BLOCKED for tilt. Lucid Winds' tilt turns a
   compass needle (`index.html:53839`, and `_updateCompass(0)` runs first so it reads north
   with no sensor); LOAF's moves the shine on a card (`loaf.html:4775`) beside a `pointermove`
   handler writing the same two CSS variables (`:4765`). Same lesson as August's 19 pinch
   false positives, at the same file, a second time.
4. **Then the word test, which the fix to 2 also exposed.** A 2 MB minified Expo bundle
   (Wild Wardens) matched the word `deviceorientation` **inside a documentation URL in a
   react-native error string**, with zero `addEventListener` registrations in the file.

**Counts, side by side.** Aug 16: `186 titles / ok 162 / caution 7 / blocked 0 / unknown 17`.
Today: `187 / ok 170 / caution 16 / blocked 0 / unknown 1`. The 13 unknowns Aug 16 listed all
read now and were cleared by the Aug 18 vendoring, not by anything here. Blocked is still 0
across the catalog, which is the fact the whole 2D store path rests on, and it survived being
re-derived from better source.

---

## 4. Where I am weakest, stated plainly

- **`Music Studio` is UNREAD and it should not have to be.** `games/song.js:31` mounts only
  an `<iframe src="/studio.html">`, and `/studio.html` is 4548 lines that I did not read
  because it is outside the stated source shape. It is also the nearest thing in the catalog
  to PadLab, which Aug 16 called the biggest differentiator. **This is the one row where
  UNREAD is a gap in the answer rather than a fact about the repo.**
- **Wild Wardens is UNREAD** and I am comfortable with that: a 2 MB single line Expo bundle
  with two near identical entry files and no way to tell which is live.
- **`Sunforge` and `Siege of One` I hold loosely** (both WINDOW). They are fixed camera and
  fit one screen, so they pass half the test and fail on the verb. One sentence from the
  Director about what the hands are doing would move either.
- **No row was run on a headset and no row was played by me.** The shots are a boot frame and
  one play frame driven by a blind tap loop. Six of fourteen landed on a how to play screen,
  which I report as a finding, but it also means six of my play shots are not gameplay.
- **The `hands` sentence for the 88 WINDOW rows is a template.** It is the honest sentence
  section 4 prescribes ("point at a panel"), and it is the same sentence 88 times.

---

## 5. THE REVIEW PROMPT FOR FABLE

```
You are reviewing Opus's V1 audit in the lucid-winds repo, branch add-sproing-jumper,
commits 32d35661, eba9b2ac, 4c91fd32 and 975c338f. You wrote the brief it answers
(HANDOFF-3D-VR.md) and section 9 of it, which the audit refutes in nine places. Your job
is to find what is WRONG, not to confirm what is right, and the standard is the one this
repo already runs on: a claim with a file:line is checked at that line, and a claim
without one is a guess wearing a verdict.

READ FIRST, in this order: HANDOFF-3D-VR-REVIEW.md (this file, sections 1 to 4, which
names where Opus thinks he is weakest, so do not spend your budget rediscovering those);
then HANDOFF-3D-VR.md sections 4 and 5 (the binding vocabulary and the brief); then
docs/3D-VR-SHORTLIST.md; then docs/3D-ASSET-CANDIDATES.md; then spot read
docs/3D-VR-AUDIT.md rather than reading 187 rows.

RUN THE GATES YOURSELF, one at a time, and put each one's last line in your report:
  node scripts/vr_audit_check.mjs
  node scripts/vr_audit_md.mjs   (twice, then diff; it must be byte identical)
  node scripts/quest_triage.mjs --selftest
  node scripts/catalog.mjs
A gate you have not watched FAIL is decoration, so before you trust vr_audit_check.mjs,
break the JSON on purpose in a scratch copy and watch it go red: blank a comfort, blank a
cite, drop a row, write lane "SEATED", write `BUILD 4 days` next to effort S. Opus says he
watched all five plus the days assertion. Confirm that, do not take it.

THE SEVEN CHECKS THAT MATTER, in priority order.

1. CITE AUDIT. Sample 25 rows from docs/3d-vr-audit.json across all four lanes, weighted
   toward TABLETOP and STANDING, and OPEN each cite at its line. A cite that does not say
   what the row claims is the most damaging possible defect here, because the whole
   document's authority is that every call has one. Report the hit rate as a fraction, not
   as an impression. Two specific ones to check yourself because the whole shortlist order
   turns on them:
     satellites/slice-3d/index.html:2237 and :2243 to :2247  (is the FOREST a chase camera?)
     satellites/dewball/index.html:2753 and :3911            (does globe:1 exist, and does
                                                              the camera really pitch to 0.76?)

2. THE SPLIT LADDER. The audit's headline finding contradicts your section 3: it says only
   FOUR satellites genuinely run their sim with no screen (Ripcord, Conduit, Aura Off, The
   Attic), that 13 more run behind a stubbed DOM, and that 17 harnesses drive headless
   Chrome or only COMPILE the script. Verify by opening satellites/conduit/test/harness.js,
   satellites/burrow-bowl/check.mjs and satellites/create-a-critter/check.js. If that
   finding holds it changes what "simple" means for the whole lane; if it does not, say so,
   because Opus put it at the top of the shortlist.

3. THE LANE INFLATION QUESTION (section 2.1 above). 79 TABLETOP rows. Read ten of the L
   effort tabletop rows at random (chess, mancala, a solitaire, a dice game, three puzzle
   satellites) and answer one question: is TABLETOP the right word for these, or should the
   lane have been reserved and the long tail called WINDOW? You wrote the vocabulary. This
   is your call to make and Opus's answer is explicitly provisional.

4. THE RANKING DEPARTURE (section 2.2). Opus sorted TABLETOP and STANDING together rather
   than TABLETOP entirely before STANDING, because the literal sort buries Ripcord and Aura
   Off under seventy L effort board games. Was that the right read of your brief? If not,
   the shortlist order is wrong and nothing else is.

5. THE QUEST TRIAGE CHANGES. Four detector fixes, each claimed to have been watched red
   first (section 3 above). The one to be most suspicious of is the LAST: blocked now
   requires "no other way in" (a live pointer path), which is how the keyboard and pinch
   detectors already work, but it means a genuinely tilt only game would now read caution
   rather than blocked if it happened to carry a click handler anywhere. Find a case where
   that is wrong, or agree in writing that it is not. Also re-check that Sproing kept its
   exact Aug 16 wording, since it is the standing regression guard.

6. THE SHOTS. docs/shots-vr/ has 38 images. Open at least eight, including
   moon-claw-1boot.png, burrow-bowl-2play.png, create-a-critter-3draw.png,
   ripcord-4round.png and tangent-2play.png. For each, decide whether the three things Opus
   named as wrong are the three you would name. He reports that three shots first came back
   as the ARCADE PORTAL because the dev gate's "Back to the arcade" link was pressed by the
   blind tap loop, and that he re-shot them with localStorage sws_dev_ok primed. Confirm the
   committed images are the games and not the portal.

7. THE TWO FLEET WIDE CLAIMS, which are the most actionable things in the whole audit and
   the least verified. (a) Six of fourteen play shots are a wall of how to play prose at 10
   to 15 px, claimed to be the commonest way a good game feels bad at 1.5 m. (b) The
   "Music" chip clips the title on five games and is drawn over the play area on Tangent.
   Both are cheap to check and both would be fleet tasks, not VR tasks, if true.

WHAT TO DO ABOUT PADLAB AND MUSIC STUDIO. Aug 16 called PadLab the biggest differentiator.
It is not a carded row, so V1 could not rank it, and the nearest carded row, Music Studio,
is UNREAD because games/song.js:31 mounts only an iframe to /studio.html. Decide whether
that is acceptable or whether V1 owes a read of studio.html, and say which.

FILE FENCE: you write ONE file, docs/REVIEW-3D-VR-SEP03.md, and you may edit
HANDOFF-3D-VR.md only to correct section 3's headless claim if check 2 confirms it is
wrong. Touch no game folder, touch no script, and do not edit any of the four documents
you are reviewing: findings go in your review and Opus applies them. If a gate fails,
report the failing line rather than fixing it.

REPORT: the four gates' last lines; the cite audit hit rate as a fraction with every miss
named; your verdict on each of the seven checks as HOLDS, WRONG or UNPROVEN, with the line
that decided it; your answer on the lane inflation question and the ranking departure,
which are yours to settle; anything Opus called a finding that is actually a known thing
you had already written down somewhere; and the one thing you would change before the
Director reads it.
```

---

## 6. What the Director is waiting on, unchanged by this review

1. **Pick one game from `docs/3D-VR-SHORTLIST.md`.** That pick fills the brackets in
   `HANDOFF-3D-VR.md` section 6, which is V2.
2. **Ripcord, ⚙ Settings, "3D battle (beta)", three rounds.** Open since Sep 2. If that
   camera feels wrong on a phone it will feel wrong at table scale, and Ripcord is the top
   of the shortlist.
3. **The Meta developer account.** Free, minutes, and it has blocked every store path since
   Aug 16. The 2D store app does not wait on any of this audit.
4. **Two calls the audit cannot make:** whether Conduit's ferro law gets amended (two
   wordings are already written out in `satellites/conduit/ART_ASSETS.md` for the pick), and
   whether Jumping Jimothy's ink identity survives prerendered meshes.
