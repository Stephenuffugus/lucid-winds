# HANDOFF, PICK IT BACK UP

**Written by:** Opus, at the end of the Sep 07 day, working alone while Stephen was away.
**For:** whoever opens the next session, on this box or a fresh one.
**Branch:** `add-sproing-jumper`. Everything below is committed AND pushed, `main` is level with
the branch, and every one of the twelve was verified live against the host by probe. Nothing is
only in a working tree.

**The one file to read before this one:** `HANDOFF-OPUS-SEP07.md`. Section 6 is the day's ledger
and the morning report; section 2 is the list with every item marked done or open; section 3 is
the look pass. This file is the shorter version plus what to do next.

---

## 1. THE FIVE MINUTES ON A FRESH BOX

```
cd /workspaces/lucid-winds
git status --short | grep -v '^??' | grep -v docs/shots     # must be empty
git pull --rebase --autostash origin add-sproing-jumper
df -h /                                                      # 2 GB free minimum
ls ~/.cache/puppeteer/chrome                                 # must list a version
nproc                                                        # two. plan for two.
(python3 -m http.server 8777 --bind 127.0.0.1 >/dev/null 2>&1 &)
```

Memory lives at `~/.claude/projects/-workspaces-lucid-winds/memory`, a clone of the private repo
`Stephenuffugus/sws-memory`. **On a NEW codespace, clone it there FIRST.** Push it after every
session (`env -u GITHUB_TOKEN -u GH_TOKEN git push`). The day's own note is
`project_opus_day_sep07.md`.

---

## 2. WHERE THE TWELVE STAND

All twelve are live and all twelve carry a Sep 07 stamp. Verified by probe against the host at
the end of the day:

| game | stamp | game | stamp |
|---|---|---|---|
| Fathom | `20260907a` | Windup | `20260907a` |
| Asterism | `20260907b` | Inkswing | `20260907a` |
| Swell | `20260907a` | Gerplunk | `20260907b` |
| Wardian | `20260907a` | Whistlestop | `20260907b` |
| Doohickey | `20260907b` | Updraft | `20260907b` |
| Airworthy | `20260907b` | Strata | `20260907a` |

The portal pins every one of them to the stamp that game actually ships. Ten of them had been
pinned at `20260906b`, a stamp none of them had carried for a day, so the shelf was serving a
stale tile and a stale cache key for each.

**The arcade door:** Browse all, then the In Development tab, or the Test Lab door on the front
page. Beta rows never show on the public shelves by design; he opens them with
`localStorage.sws_dev_ok=1` on his phone.

---

## 3. WHAT IS DONE, AND WHAT IS LEFT

**Done and live:** all of section A (A1 to A12), and C1, C2, C5, C6, C7, C8, C9 and C12 of
section C. The polish loop's first pass.

**Open, and both now MEASURED with their obvious fix RULED OUT by trying it and shooting it:**

- **C10, Asterism's poster preview.** Its smallest type is 5.0 CSS px at 412x915 and 3.56 at the
  short sizes, under the 0.7 rem law. ⛔ Flooring the type at the display scale was tried and
  would have shipped worse than the fault: every size in `renderPoster` is a fraction of the
  poster's width AND every box is sized from the same fractions, so floored type overran the
  myth's box, the footer's three lines landed on top of the myth and each other, and the credit
  ran off both edges. Reverted, and the reason is in the code beside the call. **The fix is a
  REFLOW of the preview at its own scale.** `posterMinPx` and `ASTERISM_DEV.posterType` are in
  the game so you can measure, and `test/layout.mjs` PRINTS the number as a note on every run;
  turn that note into a `say` the day the reflow lands. Half a day.
- **C11, Fathom's arcade tile reads as a broken image on the shelf.** About 85 percent black,
  two pixel lines, the subject above centre. ⛔ Throwing four stones instead of two was tried and
  made it four times WORSE: the hand does not carry four, so throws three and four land on
  nothing, `ringAt` waits its full twenty five seconds twice, and by the shutter the first two
  rings have expired. 0.64 percent lit against the two stone tile's 2.63. **The fix is a tighter
  camera or a heavier line.** The tool's darkness floor was six pixels in a thousand, which only
  catches a blank tile; it is 0.02 now, so the number defends the picture. Two hours.

**Also open, small:** C12's tail is done for eleven of twelve games; Asterism still keeps its
`ART_ASSETS.md` at the satellite root and Gerplunk has neither file.

**Section B is untouched by the rule and waits on Stephen.** Do not start any of it.

---

## 4. WHAT STEPHEN HAS TO DECIDE, RANKED

The full list is `docs/DIRECTOR-CALLS-SEP06.md`. The ranked version is section 6 of
`HANDOFF-OPUS-SEP07.md`. The short version:

1. **His ear on six wavs.** Gerplunk's bed, Windup's tine at the new level AND the new curve,
   Swell's three moods, and now Fathom, Asterism and Windup at their fixed levels. This is still
   the largest unknown in the twelve: three games turned out to be CLIPPING today and nobody had
   ever measured any of it.
2. **Gerplunk's turn** (call 22). The one thing he asked for that is not started, because it is
   his number. Two hours once he picks.
3. **Airworthy's WHISTLE_UP is 0.6** and that is a taste. Measured, not picked.
4. **Wardian's pouch still says BUY** (call 37). Ten minutes on his word.
5. **Stream Hop says the plural brand in copy a player reads**, eight days from a Steam release
   (call 38). His game, his call.
6. Calls 39 to 44, all raised today: a Steam probe that may never have passed, the devcontainer
   name, Wardian and Updraft both having no master gain anywhere, Strata's brush at 26.5 percent
   above 3 kHz, and Airworthy being an eighth as loud as Updraft on the same shelf.

---

## 5. THE LAWS, WHICH DO NOT BEND

- **Copy:** no dashes of any kind in player copy, commas instead; no exclamation points in system
  text; Sky Wolf Studio, singular; no economy claims, no coins, no rewards, no store. Text 0.7 rem
  minimum, canvas fonts included, and every game's lint reads canvas fonts now. Touch targets 48
  rendered px at 375x667, proved by `elementFromPoint` at the control's centre, never by calling a
  handler. The bottom left 120 by 120 of every game belongs to the music chip.
- **One stamp per game in three places:** `var STAMP`, every `?v=` in the head, `sw.js`
  `SHELL_VERSION`. The lint holds it. A stamp is the UTC date and a letter. **Today's letters are
  used up to `b`; the next change today is `c`, and on a new UTC day it is that day's date and
  `a`.** ⛔ The system clock is UTC and Stephen is US Eastern: after 8 pm his time the date is
  already tomorrow here.
- **Runtime modules are `.js`, never `.mjs`.** The host serves `.mjs` as text.
- **Two cores.** Every command that opens Chrome runs as
  `timeout 900 flock -w 1800 /tmp/sws-gate.lock node <cmd>`. One browser at a time. Never a short
  timeout around a waiting flock. Never delete `~/.cache/puppeteer`. A gate that fails inside a
  suite is rerun alone twice.
- **Look before you gate.** Shoot 412x915 and 375x667, OPEN the shots, name three faults. A green
  gate is not a look.
- **Every fix asks which gate should have caught it.** Write that assertion, watch it fail once
  under a real mutation, then pass.
- **Deploy:** commit after every green subsystem; `git push origin add-sproing-jumper`; check
  `git log HEAD..origin/main` is empty; `git push origin add-sproing-jumper:main`; then
  `curl -s "https://lucidwinds.com/<path>?probe=$RANDOM"` grepped for a marker only the new build
  carries. Never leave a game red on main.
- **Anything that is a taste, a name, a price, a rule that re grades what a player has kept, or a
  new system** goes to `docs/DIRECTOR-CALLS-SEP06.md` section G with a recommendation and a cost,
  and is not built.
- **Agents:** one fenced builder beside you, for a game you are not touching, hard stop, fenced
  `git add`, no pull, no push, no stash. Only the lead pushes.

---

## 6. THE SCARS SEP 07 ADDED, AND THEY ARE ALL THE SAME SHAPE

Almost every fault found on Sep 07 was invisible to a green gate, and about half of them were
found by opening a picture. The other half were found by writing an assertion and then finding
the assertion was wrong. Carry these:

1. **⛔⛔ A FRESH GainNode's GAIN IS ONE.** Fathom's singback and Asterism's swell each start
   three sines at `t0` and stagger the ENVELOPES, so each voice went out at full scale for 45 to
   90 ms: peaks of 1.293 and 1.907, clipping. Windup's was a waveshaper whose own comment calls
   it "the ceiling" with a slope of 1.649 at the origin, a 4.3 dB BOOST, peak 1.364. **Voice
   counters were green through all of it, because a count is not a level.**
   ⛔ Updraft's record chord is the same shape and the only thing between it and a peak of 2.94
   is one `gn.gain.value = 0` before the first ramp. Nobody delete that line.
2. **⛔ A DUPLICATE KEY IN AN OBJECT LITERAL SILENTLY WINS.** `WARDIAN_TEST` already had a `mist`
   key below the one I added, so my hook was never called, and the gate reported nought motes
   three times while looking like the game was at fault. Nothing in the file, the lint or the
   console says a word.
3. **⛔ MEASURE THE THING, NOT NEAR IT.** Inkswing's nib gate counted TOUCHED PIXELS and reported
   the broad nib at 1.00 times the fine one, because the sheet is drawn sub pixel. Gerplunk's palm
   probe counted warm pixels and was measuring the SUN'S ROAD on the water, 273 with the stone and
   258 without. A stone is a SHAPE: measure the longest run.
4. **⛔ SET THE STATE BEFORE YOU MEASURE.** Airworthy's corner check was widened to every button
   on the page and STILL passed, because it ran on a screen where neither big button is up.
   Wardian's seal check measured a frame with no particles alive. Swell's resting screen check ran
   after the gate had already held the screen and was reading the swell's own wash.
5. **⛔ READ THRESHOLDS OFF THE CANVAS.** The palm probe wanted red over 90 when the middle of the
   stone is 78.
6. **⛔ AN ASSERTION WITH A MARGIN OF ONE IS DECORATION** and should be deleted. Gerplunk's step
   count separated 30/28/23 from 20/21/19; only `turns` separated cleanly.
7. **⛔ A GATE'S GESTURE IS NOT THE GESTURE IT INTENDED.** On two cores a 13 ms dispatch step
   becomes 60, and at 24 px that is under Gerplunk's own slow hand threshold, so the game read the
   first inch of a flick as a plant and the end to end assertion was measuring the driver's timers.
8. **⛔ DO NOT SHIP A COMMENT CLAIMING A FAULT YOU HAVE NOT VERIFIED.** I nearly did, about
   Gerplunk's readout line eating a touch. The mutation disproved it.
9. **⛔ A CAMERA THAT HARDCODES A PUZZLE'S INTERNALS breaks the day the puzzle is edited**, which
   is the day somebody most wants to look at it. Whistlestop's shot tool had Swap's answer typed
   into it as the literals 2 and 11.
10. **⛔ SCENERY LAID ONCE AND NEVER AGAIN gets built over.** Whistlestop lays its props once,
    which is right for building beside, but a loop built AROUND a cow left the cow in the middle
    of it for good.

---

## 7. THE PROMPT TO PASTE TO PICK IT BACK UP

```
You are Claude Opus, lead builder on the twelve new games for Sky Wolf Studio, in the lucid-winds
repo at /workspaces/lucid-winds on branch add-sproing-jumper. Stephen is the Director. If he is
not here, never wait on a question: work the list.

READ FIRST, in this order: HANDOFF-OPUS-SEP08.md whole (state, what is left, the laws, the
scars); HANDOFF-OPUS-SEP07.md sections 2, 3 and 6 (the list with every item marked, the look
pass, and the day's ledger with the morning report at its top); docs/DIRECTOR-CALLS-SEP06.md
(everything that waits on Stephen: never start any of it, and add to it when you find a new
call). Then do section 1 of the Sep 08 handoff.

THE WORK, in this order:
1. C10, Asterism's poster preview: REFLOW the preview at its own scale so its type clears 0.7
   rem on the screen. Do not floor the type alone, that was tried and shipped worse; read the
   note in the code beside refreshPoster and the C10 line in the Sep 07 list. When it lands,
   turn the note in test/layout.mjs into an assertion. Half a day.
2. C11, Fathom's arcade tile: a tighter camera or a heavier line, judged against the other
   eleven tiles on the shelf and not on its own. Four stones was tried and made it worse. Two
   hours.
3. Then the polish loop, one game at a time in the spine's order (Fathom, Asterism, Swell,
   Wardian, Doohickey, Airworthy, Windup, Inkswing, Gerplunk, Whistlestop, Updraft, Strata):
   open it at 412x915 and 375x667 from where the player stands, play the first three minutes
   with real pointers, name three things wrong before Stephen would, fix the ones under an hour,
   queue the rest in section C of the Sep 07 list, and move on. When the loop ends, start again.
4. If Stephen has answered any Director call, that jumps the queue.

BEFORE EACH GAME'S BUILD PHASE, THE REFERENCE. If satellites/<game>/docs/REFERENCE.md does not
exist, spend at most forty minutes writing it: the two or three best titles or ideas in the world
that do what this game does, what each does that ours does not, what we adopt, what we refuse and
why. Ideas and mechanics only: no asset, name, character or line of copy from anyone else ever
enters a game, and no other title is named in player copy. Say when a claim comes from memory
rather than a source. Gerplunk, Inkswing and Airworthy already have one.

THE LAWS ARE SECTION 5 OF HANDOFF-OPUS-SEP08.md AND THEY DO NOT BEND. The scars are section 6;
read them, they were all paid for on Sep 07 and every one of them is a gate that was green over a
real fault.

HOW TO REPORT. Every finished item gets a SESSION STATE entry in plans/<game>/HANDOFF-<GAME>.md
(what landed, what was found, the next action) and one line in HANDOFF-OPUS-SEP07.md section 6,
the day's ledger, with the stamp and the live check. Before you stop for any reason, rewrite the
morning report at the top of section 6: what is live, what is half built (there should be
nothing), and what Stephen has to decide, as one ranked list. Do not ask for approval. Start now.
```

---

## 8. WHERE THE EVIDENCE IS

- Per game: `satellites/<game>/docs/shots/` (opened, under 200 KB each),
  `satellites/<game>/docs/DECISIONS.md` (every finding of Sep 07 is written beside the thing it
  guards), `plans/<game>/HANDOFF-<GAME>.md` SESSION STATE.
- The day: `HANDOFF-OPUS-SEP07.md` sections 2, 3 and 6.
- Stephen's list: `docs/DIRECTOR-CALLS-SEP06.md`.
- Memory: `project_opus_day_sep07.md`, indexed under the status board in `MEMORY.md`.
