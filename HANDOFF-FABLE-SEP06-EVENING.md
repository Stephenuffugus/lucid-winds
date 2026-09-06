# HANDOFF, FABLE PICKS UP AFTER STEPHEN'S TEST, Sep 06 2026 evening

**Written by:** Opus, at 16:35 UTC, as Stephen started testing the twelve on his phone and
this codespace approached its context limit.
**For:** Fable, on the next session, when Stephen comes back with notes.
**Branch:** `add-sproing-jumper`. Everything below is committed AND pushed, `main` is level
with the branch, and every game was verified live. Nothing is only in a working tree.

---

## 1. THE FIRST THING TO DO WHEN HE COMES BACK

He is testing right now. He will come back with notes. **The notes are the priority, not
this document and not the build order.** Take them in this shape:

1. **Write each note down verbatim first**, in the game's own plan under SESSION STATE, before
   deciding anything about it. His words are the record; a paraphrase loses the thing he saw.
2. **Sort each one into three piles and tell him which pile it went in:**
   - **A fault** (it does not do what it says, or it is unreachable, or it looks broken). Fix it
     today, gate it, deploy it, tell him it is live.
   - **A taste call** (it works and he does not like it). That is his to decide; write it into
     `docs/DIRECTOR-CALLS-SEP06.md` with a recommendation, and only build it if he says so.
   - **Already known** (it is on the thin list in section 5 below). Say so plainly and say why
     it is still there. Do not re-report it back to him as news.
3. **Anything he says about a NAME, a price, or the shape of a game is a Director call**, not a
   fault. It goes in the one list.
4. When a note is a fault, ask yourself first whether a gate should have caught it. Four times
   today a gate was green over a real bug. If a gate could have caught it, fix the gate too,
   and watch it fail once.

---

## 2. THE ENVIRONMENT, ON A FRESH BOX

```
cd /workspaces/lucid-winds
git status --short | grep -v '^??' | grep -v docs/shots     # must be empty
git pull --rebase --autostash origin add-sproing-jumper
df -h /                                                      # 2 GB free minimum
ls ~/.cache/puppeteer/chrome                                 # must list a version
(python3 -m http.server 8777 --bind 127.0.0.1 >/dev/null 2>&1 &)
```
Memory backup lives at `~/.claude/projects/-workspaces-lucid-winds/memory`, a clone of the
private repo `Stephenuffugus/sws-memory`. Pull it first on a new box, push after every session.

**Read, in this order:** this file; `HANDOFF-OPUS-TAKEOVER-SEP06.md` (the state table and the
laws); `docs/DIRECTOR-CALLS-SEP06.md` (the one list for Stephen); each game's
`plans/<game>/HANDOFF-<GAME>.md` SESSION STATE as you touch it.

---

## 3. WHERE THE TWELVE STAND (all live, all verified at 16:28 UTC)

The arcade door: Browse all, then the **In Development** tab, or the Test Lab door on the
front page. Beta rows never show on the public shelves by design. He opens them with
`localStorage.sws_dev_ok=1` on his phone.

**The stamp in each file is the stamp the host serves.** Checked one by one at the end of the
session, not assumed.

| game | live stamp | what it is now |
|---|---|---|
| Fathom | 20260906e | echo location in the dark, with OCCLUSION: a ping lights what the sound reaches, not everything inside its circle |
| Asterism | 20260906g | the real sky over Columbus; the first screen is now a veil over that sky rather than flat ink |
| Swell | 20260906d | hold to conduct; the playing mood says PLAYING |
| Wardian | 20260906d | the sealed jar; a once only line when the pouch can plant its first seed |
| Doohickey | 20260906g | **thirteen levels**, four using the top of the board and three teaching the spring, the switch plate and the cat; the share link opens cold |
| Airworthy | 20260906g | fold, tunnel, throw, trim; four courses; **eleven challenges including the ring slalom**, the design's fourth type |
| Windup | 20260906e | the music box; auto play on a two clock scheduler; three printed papers |
| Inkswing | 20260906g | the pendulum; the Double Link rig; on a tall phone the ink rail lies down so the drawing is a fifth bigger |
| Gerplunk | 20260906f | the lake; **a share card at 1080x1350 drawn from the model's own trace**, and slow motion when a throw beats your best |
| Whistlestop | 20260906g | the wooden railway; **six puzzles including Swap**; the lever you aim at was eight pixels and is now twenty two |
| Updraft | 20260906f | the kite; moods, journal, five kites, landing, Real Wind behind a toggle, the Daily Wind; dates are spoken |
| Strata | 20260906f | the cliff and the museum; **the field journal** and **rename** on the plinth |

---

## 4. WHAT CHANGED TODAY, SO HIS NOTES MAP TO A VERSION

**Morning, Fable, 12:48 to 15:00 UTC.** All twelve listed on the arcade and deployed. Then, found
by playing at 320x568: four games' overlay screens clipped their own tops; Swell's first line sat
invisible to the music chip's probe; the chip sat on Airworthy's result card and in the middle of
Fathom's cave. Fathom got occlusion. Doohickey got four upper board levels and a new tile. Strata
got MAKE A PLATE and framed plates on the hall wall. Airworthy got the Canyon and the Stadium.
Windup got the lookahead scheduler and printed papers. Whistlestop got puzzles three to five.
Gerplunk and Updraft were built from nothing to playable. Inkswing got the Double Link.

**Afternoon, Opus, 15:00 to 16:35 UTC.** Both handoff debts closed first: Gerplunk's seven gates
rerun cold (all green, nothing red), Updraft's seven rerun as a table and then its daily gate
watched to fail under the seed mutation. Then: Gerplunk's share card and slow motion and a new
tile; Strata's field journal and rename; Airworthy's ring slalom; Doohickey's three further levels
and a share gate that opens a link cold; Whistlestop's eight pixel lever and Swap; Inkswing's rail;
Updraft's spoken dates; Asterism's veil.

---

## 5. WHAT WE ALREADY KNOW IS THIN (do not report these back to him as findings)

If he names one of these, the answer is "known, here is why it is still there", not surprise.

- **Nobody has heard any of it.** `satellites/windup/docs/shots/p0-tine.wav` and
  `satellites/swell/docs/shots/p0-swell.wav` are the two to open first. Strata's clink,
  Gerplunk's ticks and Airworthy's whole sound are synthesised and unheard.
- **No painted art anywhere in the twelve.** Every room, plane, kite, bone and stone is drawn by
  code. Each game's `docs/ART_ASSETS.md` says what painting would replace.
- **Whistlestop:** the props are unmotivated and lopsided and they now bind the zoom, so the
  railway is 65 percent of the width where it was 78. The Crossing's two spurs still mirror each
  other. Swap's lower two levers sit thirty pixels apart and read as one cluster.
- **Doohickey:** the portrait board is a 412 by 230 band with more cream around it than board. The
  spring pad reads as a scuff, the fan's cone does not read as wind, the cat does not read as asleep.
- **Gerplunk:** the land at the lee and the bay is a flat dusk silhouette with no texture; the bay's
  far shore is a straight line; there is no stone in the palm view; the thumb's bottom third is
  empty water.
- **Updraft:** the kite at 67 m is a mark with a stub tail; the reel reads as a gold coin; Mabel's
  crown is flat circles; the kite cards want silhouettes.
- **Inkswing:** about 140 px of ground is still empty under the sheet on a tall phone, because the
  sheet's aspect is fixed at 1000 by 1250 and the width binds.
- **Airworthy:** the camera follows the plane, so a still of the slalom only ever shows the last
  gate; canyon-hang's best plane hangs 10.9 seconds, which may be dull to watch.
- **Strata:** the fifty bone crate is one scrolling row and most people will press ALL every time.
- **Fathom:** a screen shows fifteen tiles across, so every cave corner is a big right angle.

---

## 6. THE OPEN DIRECTOR CALLS

They are all in `docs/DIRECTOR-CALLS-SEP06.md`, ranked, each with a recommendation. The ones his
testing is most likely to touch:

- **Inkswing:** the note sliders are equal tempered, so no drawing ever closes. Just intonation
  would close them and shift the note names. It re-grades every drawing the game makes.
- **Gerplunk:** the daily line (everyone throws the same line, or everyone picks their own),
  the dead band under 758 px/s, and `TURN_DEG_PER_M` 480, which only his thumb can settle.
- **Airworthy:** the challenges take the throw off him, and the starting plane needs most of the
  elevator slider to settle.
- **Whistlestop:** fit the whole railway or let him pinch in; pass through instead of bump stop
  for younger children.
- **Wardian:** the quiet middle of the first fortnight.
- **Strata:** which five of the fifty on the variety sheet he would keep.
- **Names:** Fathom, Asterism, Swell, Windup and Whistlestop all have alternates parked.

---

## 7. WHAT TO BUILD WHEN THE NOTES ARE HANDLED

In order of value on his phone. Each game's plan SESSION STATE names the exact next action.

1. **Whistlestop:** give `makeProps` a keep out band around `railBounds()` and place props in
   motivated pairs, then reshoot 412x915 and measure the railway's width fraction before and
   after. This is the one that makes the puzzle bigger on the phone.
2. **Gerplunk P3 step 2 and Updraft P3 step 3:** the shots at every size, the docs and the morning
   reports. Both are otherwise finished.
3. **Strata:** the `ART_ASSETS.md` and `BUILD-NOTES.md` refresh, then its morning report.
4. **Doohickey:** the portrait stage, which is the last thin thing in it.
5. **Airworthy:** the gust whistle unlock, a single earned mid flight nudge, is the only named
   thing in the design still unbuilt.
6. Anything he answers in the one list.

---

## 8. THE LAWS, UNCHANGED

- **One stamp per game in three places:** `var STAMP`, every `?v=` in the head, `sw.js`
  `SHELL_VERSION`. Each game's lint holds it. Today's newest letter is `g`; the next is `h`, then
  the next day's date.
- **Deploy** is `git push origin add-sproing-jumper:main` after `git log HEAD..origin/main` is
  empty, then `curl -s "https://lucidwinds.com/<path>?probe=$RANDOM" | grep -c <a marker only the
  new build has>`. Push the branch too. A changed thumb needs its portal `?v=` bumped.
- **Two cores.** Every command that opens Chrome runs as
  `flock -w 1800 /tmp/sws-gate.lock node <cmd>`, wrapped in `timeout 900`. Never a short timeout: a
  `timeout 120` around a flock that waits three minutes dies silently with no output. One browser
  at a time. A gate that fails inside a suite is rerun alone twice.
- **Look before you gate.** Shoot at 412x915 and 375x667, open the shot, name three faults, fix the
  small ones, then run the gate.
- **Counts in gates are hardcoded.** Widen them to the LAW, not the number, before adding content.
- **Copy:** no dashes, no exclamation points, Sky Wolf Studio singular, no economy claims, 0.7 rem
  minimum, 48 px targets by `elementFromPoint`, the bottom left 120 by 120 left for the music chip.

---

## 9. THE SCARS THIS DAY ADDED, WORTH CARRYING TO EVERY GAME

1. **Anything that rebuilds a record from a whitelist of known fields deletes the rest.** Twice in
   one afternoon: Strata's `saveNow` swallowed the journal's new counters, and Airworthy's
   `sim.js --medals --write` deleted the ring slalom's own gates on its first run with nobody told.
   When you add a field to a record some tool rewrites, find that tool, and prove the fix by
   running the writer again and checking the field survived.
2. **A gate can pin the bug.** Updraft's daily gate required the literal string containing an ISO
   date, so the gate was protecting a copy law violation. When a fix turns a gate red, ask whether
   the assertion held the law or an old string.
3. **A gate that sets state is not a gate that boots into it.** Doohickey's share gate set
   `location.hash` on an open page; a stranger pastes an address and the page boots with the hash
   on it. Different code paths, and only the second is the feature.
4. **A glyph drawn at world scale with a tap radius in screen pixels shrinks exactly when the
   camera pulls back**, which is when the player needs it most. Whistlestop's lever was eight
   pixels in a puzzle and twenty two on the build screen, and its gate read the constant rather
   than the canvas, so it could not see it.
5. **The fleet's music chip chases free space.** It reseats into the freest corner and followed
   Strata's journal title through two rounds of padding. The top band belongs to the chip; put
   nothing of yours in it.
6. **A ratio in a gate is a literal**, never the constant divided out, or the test is arithmetic
   rather than the game.

---

## 10. WHERE THE EVIDENCE IS

- Per game: `satellites/<game>/docs/shots/` (opened, under 200 KB each),
  `satellites/<game>/docs/DECISIONS.md`, `plans/<game>/HANDOFF-<GAME>.md` sections 13 and 15.
- The day's records: `HANDOFF-OPUS-TAKEOVER-SEP06.md` (state and laws),
  `HANDOFF-FABLE-REVIEW-SEP06.md` (the morning review), `HANDOFF-OPUS-NIGHT-SEP05.md` section 5
  (the twelve row table, annotated with every phase).
- The one list for Stephen: `docs/DIRECTOR-CALLS-SEP06.md`.
- Memory: `project_opus_takeover_sep06.md` and `project_twelve_review_sep06.md`, with index lines
  under HOT in `MEMORY.md`.
