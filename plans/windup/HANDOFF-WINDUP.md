# HANDOFF WINDUP, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from `docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-WINDUP.md`
(Stephen's design, read in full) plus the fleet on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then `plans/fathom/HANDOFF-FATHOM.md` sections 0, 2, 9,
14 and 15 (the shared boilerplate every plan points at), then this file, then the design. Where they differ, this file wins;
every difference is in section 3 with its reason.
**Game folder:** `satellites/windup/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/windup/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-05 Fable: plan written. Nothing built.
- 2026-09-06 Opus: **P0 step 1 done.** The scaffold and `tools/check.js` exist and
  the gate is RED, which is the point of it. **Next action:** P0 step 2, the SIM
  layer: CONFIG, RNG, STRIP, RULES, SEED in `index.html` between the
  `SIM_EXPORT` markers, then the assertion suite `sim.js --test` runs.

---

## 0. RULES OF ENGAGEMENT

As `plans/fathom/HANDOFF-FATHOM.md` section 0 with `windup` for `fathom`. One law particular to Windup: **the strip is the
clock.** A note sounds when the read line crosses its hole, and the read line moves only when the crank turns (or the
auto play runs the strip at a fixed speed). Nothing schedules a note by wall time while the crank is in a hand.

---

## 1. WHAT WINDUP IS, AND WHY IT IS WORTH A NIGHT

From the design: *"A little brass and walnut music box on a velvet cloth. Feed it a paper strip, punch holes with your
finger, each hole a note, then turn the crank yourself and hear your melody plink out, at exactly the speed your finger
cranks. Wrap it as a gift: send a link, and the recipient sees a ribboned box that they unwrap and crank to hear your song
for them."* Positioning line: **"Punch a song. Crank it. Give it away."**

Why it is worth a night: every existing music box strip tool is a utility for people who own a physical box; nobody has made
the object, the crank, or the gift. The whole thing is one small screen, one synthesised voice and one gesture the fleet
already measures (Ripcord's circle winding). It is the first of the second six because it is the smallest, and because the
gift link is a sharing engine for December.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

| Need | Copy from | What to take |
|---|---|---|
| The crank gesture | `satellites/ripcord/src/wind.js` lines 34 to 100 (`fitCircle`, the angle unwrap loop in `grade`) | The unwrap: `d = a - prev; while (d > PI) d -= 2PI; while (d < -PI) d += 2PI; total += d`. Windup's crank hub is a known point, so no circle fit is needed: the angle is `atan2` about the hub and the unwrapped delta is the strip advance. The direction of drawing is the direction of play |
| A synthesised note voice with a limiter and a plate | `satellites/blockspace/index.html` lines 833 to 838 (master chain, `createConvolver` with a generated impulse) and 859 to 870 (the per note oscillator and noise helpers) | The master chain as is; the tine voice in section 4 replaces the note recipe |
| A lookahead scheduler for auto play | `plans/swell/HANDOFF-SWELL.md` section 4, SCHEDULER | Two clocks, 25 ms tick, 100 ms lookahead, used only by the auto play button |
| Audio export | `satellites/blockspace/index.html` lines 838 and 1090 to 1095 | `createMediaStreamDestination` off the master, `MediaRecorder` with the mime list `['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']`, the Blob in `onstop` |
| Save or share a Blob on a phone | `satellites/attic/index.html` lines 1446 to 1466 | `File`, `canShare({files})`, `share`, else download |
| Share by link, no backend | `satellites/blockspace/index.html` lines 1060 to 1080 | `b64u`, `copyLink`, `importFromHash`, `history.replaceState`. Windup uses `#g=` |
| Headless audio gate | `satellites/keepsies/test/audio_budget.mjs` | `OfflineAudioContext` render in headless Chrome under `--autoplay-policy=no-user-gesture-required` |
| Scaffold, RNG, page tests, `sim.js`, `sw.js`, manifest, icons, portal protocol, music hook, gate runner, browser gate shape, thumb and icon tools | `plans/fathom/HANDOFF-FATHOM.md` section 2 | Same files, `windup` in place of `fathom` |
| Silence handshake | `portal/index.html` line 2890 | Windup posts `{ sws: 'game-music', on: true }` on the first crank, because it is the music |

Not inherited: any PDF library (section 4 writes a minimal PDF by hand), any MIDI library.

---

## 3. CORRECTIONS TO THE DESIGN (binding; each forced by a measurement or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Hostinger from `main`, pushed by Fable.

3.2 **Fifteen notes only in the slice.** The design recommends it; taken. The row layout is the real 15 note diatonic box:
C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5 A5 B5 C6, low at the bottom of the strip as on the real paper.

3.3 **The retrigger rule is two grid steps.** A hole in the same row closer than `MIN_GAP_STEPS` eighths to another is
refused with the red outline and the design's line ("the tine is still singing"). Real strips need about 8 mm between holes
in a row; on the printable strip that is two eighths at the default spacing.

3.4 **The printable strip ships as a beta until a real one has been measured.** The published 15 note paper is 41 mm wide
with rows 2 mm apart; the advance per eighth along the strip is a CONFIG number (`MM_PER_STEP`, default 4) that Stephen
checks by printing one strip and laying it on a real Kikkerland strip. The PDF button says "beta, measure before you cut"
until he clears it. The PDF is written by hand (section 4); no library.

3.5 **The signature line is on by default and editable.** The design recommends it; taken: "punched by <name>" from the
save, blank if never set.

3.6 **Auto play exists and is not the point.** A PLAY button runs the strip at 96 eighths a minute through the Swell
scheduler; the crank is the product and the tutorial never mentions the button.

3.7 **The crank has a hub, so the gesture needs no circle fit.** The handle is drawn at a known centre; a finger anywhere
within 140 px of the hub cranks; the unwrapped angle times `MM_PER_RAD` advances the strip. Ripcord's fit is for a free
drawn circle; here the circle is on the box.

3.8 **Determinism.** Per note detune and level jitter come from a seeded stream keyed by hole index, so a gift sounds the
same on the recipient's phone.

3.9 **Copy.** No dashes, no exclamation points. Wrapping names: Birthday, Snowfall, Night Sky.

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/windup/`):

```
index.html            the app
sim.js                --test, --play=<strip> (prints the note events of a strip at a fixed crank speed)
sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
tools/check.js  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/tine.mjs  test/crank.mjs  test/gift.mjs  test/layout.mjs
docs/DECISIONS.md  docs/shots/  BUILD-NOTES.md  ART_ASSETS.md
```

Layers: `CONFIG, RNG, STRIP, RULES, SEED, VOICE, CRANK, PLAYER, BOX, PUNCH, GIFT, EXPORT, SAVE, TEST, BOOT`. `SIM_EXPORT`
markers wrap CONFIG through SEED (the strip model, the rules and the seed melody generator are pure).

**CONFIG (frozen):**

```
GAME_ID 'windup'  SAVE_KEY 'lw_windup_v1'  SAVE_V 1
ROWS 15  ROW_MIDI [60,62,64,65,67,69,71,72,74,76,77,79,81,83,84]
STEP eighth  MIN_GAP_STEPS 2  STRIP_MIN_STEPS 32  STRIP_MAX_STEPS 512  SWING 0.12
MM_PER_STEP 4  PAPER_MM 41  ROW_PITCH_MM 2  HOLE_MM 2.4  MARGIN_MM 6.5
CRANK_R_PX 140  MM_PER_RAD 6  AUTO_BPM 96 (eighths a minute times 2)
TINE_DECAY_LOW_S 1.8  TINE_DECAY_HIGH_S 0.8  DETUNE_CENTS 3  LEVEL_JITTER_DB 1
VOICES_MAX 24  MASTER 0.85
```

**STRIP.** `{ v:1, name, by, holes: [[step, row], ...] sorted by step, wrap, dedication }`. Serialised for the link as
`step u16, row u8` pairs, base64url, under 1 KB for 300 holes.

**RULES.** `canPunch(strip, step, row)` false when another hole in `row` is within `MIN_GAP_STEPS`; `punch`, `unpunch`,
`length(strip)` = last hole plus 8 steps, clamped to the range.

**SEED.** `seedMelody(seed)`: four bars of eighths from a chord tone skeleton (I vi IV V over C major, one chord a bar),
one note a beat on a chord tone, passing tones on half the off beats from the scale, range rows 3 to 12, never violating
the rules. Starter strips in DATA: Happy Birthday, Twinkle Twinkle, a lullaby (Brahms), each hand punched and rule clean.

**VOICE.** The tine: a sine at the row's frequency plus two partials at 4.2 and 6.3 times it at gains 0.18 and 0.07 (a
clamped bar's inharmonic partials, kept to two), a 3 ms noise click through a 4 kHz highpass at the attack, a shimmer
partial at 12 times at gain 0.03 decaying in 0.3 s; the fundamental decays exponentially from `TINE_DECAY_LOW_S` at row 0
to `TINE_DECAY_HIGH_S` at row 14 (linear in row); detune plus or minus `DETUNE_CENTS` and level plus or minus
`LEVEL_JITTER_DB` from the seeded stream keyed by hole index; the plate from Blockspace at wet 0.18; the mechanism bed
(a soft tick per 15 degrees of crank and a spring creak, filtered noise, gain by crank speed) that stops when the crank
stops while the tines ring out. Voices are oscillators created per note and counted; the quietest is stolen past
`VOICES_MAX`.

**CRANK.** Pointer within `CRANK_R_PX` of the hub grabs; each move unwraps the angle; `advanceMm += delta * MM_PER_RAD`;
the strip position in steps is `advanceMm / MM_PER_STEP`; backwards cranking rewinds the strip and plays nothing;
`navigator.vibrate(6)` per revolution where it exists. Crank speed (rad/s, smoothed over 120 ms) drives the bed.

**PLAYER.** Watches the strip position; when it crosses a hole's step in the forward direction, the tine fires at the
exact crossing (`ctx.currentTime` plus the fraction of the frame). Auto play: the Swell scheduler at `AUTO_BPM`.

**BOX.** Canvas: the velvet, the walnut box, the brass comb with 15 tines that flick when their row plays, the strip
window with the paper feeding through, the crank with the handle, the lid (for gift mode), the ribbon.

**PUNCH.** The strip editor: horizontal scroll, 15 lettered rows, the red margin line, tap to punch (the chnk and paper
confetti), tap again to unpunch, the ghost playhead that plinks a hole as it is placed, the refused outline. PLAY, DICE
(seed melody appended after the last hole), CLEAR (confirm), DONE.

**GIFT.** `#g=` link carries the strip, the wrap and the dedication. Gift mode: the wrapped box on the velvet, a ribbon
you drag off (60 px of real drag), the lid opens, the dedication on a card, the crank, "Save to my shelf", "Make your own".

**EXPORT.** Audio (record while the auto play runs once, or while the player cranks; the Blockspace recorder), strip PNG
(the punch card drawn at 4 px a step), printable PDF: a hand written PDF 1.4 with one page, `MediaBox` in points at 72 per
inch, the strip drawn as a rectangle `PAPER_MM` wide, the rows as faint lines at `ROW_PITCH_MM`, holes as filled circles of
`HOLE_MM` at `MM_PER_STEP` per step, cut marks, the song name; pages continue if the strip is longer than 250 mm. No
compression, no fonts beyond Helvetica (a built in PDF font). Section 3.4's beta label.

**SAVE.** `lw_windup_v1`: `{v, by, shelf:[strips], wrapsSeen, settings:{sound, motion}, seen:{how}}`. Read, modify, write.

**TEST.** Deepwell's harness; floor 60.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts.

### P0. The voice and the rules (about 1.5 hours)

1. Scaffold. STRIP, RULES, SEED, VOICE with the master chain, one test keyboard row in the page (TEST mode only).
2. `sim.js --test`: `canPunch` refuses a same row hole one step away and accepts two steps away; `punch` keeps holes
   sorted; the three starter strips are rule clean and inside the row range; 500 seeded melodies are rule clean, in range,
   and 16 to 32 holes long; the same seed gives the same melody; serialisation round trips 200 random strips; `length`
   clamps.
3. `test/tine.mjs` (browser, `OfflineAudioContext`): one C4 note renders with energy above -30 dBFS in its first 50 ms;
   its RMS at 1.2 s is between 5 and 30 percent of its peak window (it rings, and it decays); row 14's decay to 10 percent
   is shorter than row 0's; fifteen simultaneous notes peak under 0.99; the oscillator count never exceeds `VOICES_MAX`
   plus the bed. Watch it fail: set the decay to 0.05 s and the ring assertion goes red; set the master to 3 and the peak
   goes red.
4. **Feel test you cannot hear.** Render one C4, one C5 and the first bar of Twinkle at a steady crank to
   `docs/shots/p0-tine.wav` (under 1 MB). Stephen listens in the morning; the design says one note must sound like a memory,
   and that is his ear, not a gate.

### P1. The box, the crank, the punch (about 2.5 hours)

1. BOX render, CRANK, PLAYER, the mechanism bed, the ring out on stop.
2. PUNCH editor with the ghost playhead, the refusal, DICE, the three starters on the shelf.
3. **Stop and feel test.** Shoot `docs/shots/p1-box.png` and `p1-punch.png` at 375x667. Open them. The box must read as
   an object with weight (walnut grain drawn, brass with a highlight, the strip visibly entering and leaving); if it reads
   as a rectangle with a circle, fix the drawing before the gift.
4. `test/crank.mjs` (browser, real pointers): a real circular drag of two revolutions around the hub advances the strip by
   about `2 * 2PI * MM_PER_RAD / MM_PER_STEP` steps (within 10 percent); the notes whose steps were crossed fired, in
   order, and none others; a reverse revolution rewinds and fires nothing; stopping the finger mid note leaves the master
   output above silence for at least 300 ms then decaying (the ring out); a real tap on a strip cell punches it and a second
   tap unpunches; a tap one step from a same row hole is refused and the outline shows.
5. `test/layout.mjs`: 48 px at 375x667; the bottom left 120x120 empty; the punch rows at least 24 px tall with 48 px
   tap cells (two rows per thumb is acceptable only if `elementFromPoint` lands on the intended cell).

### P2. The gift (about 2 hours)

1. GIFT: name, dedication, the three wraps, the link, the recipient mode with the ribbon and the lid.
2. Shelf, save, signature line.
3. `test/gift.mjs` (browser): a strip saved with a dedication yields a `#g=` link; a fresh context opening it shows the
   wrapped box; a real 80 px drag on the ribbon opens the lid and shows the dedication; a real crank revolution plays the
   same first notes as the sender's strip; "Save to my shelf" puts it in the recipient's save.

### P3. Export and polish (about 1.5 hours; where a night may stop)

1. Audio export, strip PNG, the printable PDF with its beta label (`test/pdf.mjs`: the Blob starts with `%PDF-1.4`, has
   one `/Page` per 250 mm, and the hole count in the content stream equals the strip's hole count).
2. Swing toggle, chord ghost rows (off by default), reduced motion, the whole first minute copy.
3. `tools/shots.mjs` at 412x915, 375x667, 320x568; `tools/thumb.mjs` (the box mid crank, a tine flicking);
   `ART_ASSETS.md`, `BUILD-NOTES.md`, the morning report.

---

## 6. THE SCREENS (portrait, one hand, 48 px rendered at 375 wide)

- **The box (home).** The velvet, the box, the crank at the lower right where a thumb circles comfortably (hub 90 px from
  the right edge, 200 px from the bottom), the strip window above it. Top left: the song name chip (48 px, tap to rename).
  Top right: menu (48 px): Shelf, Give, Export, Settings, About. Bottom centre: PUNCH (56 px). Bottom left empty. First
  boot: "Turn the crank." then, after one revolution, "Now punch your own." and never again.
- **Punch.** The strip fills the screen horizontally (scroll by drag on the paper), rows lettered at the left, the red
  margin, the playhead. Bottom bar: PLAY (48), DICE (48), CLEAR (48), DONE (56).
- **Give.** Name, dedication (two lines max), three wrap cards 72 px tall, SHARE (56 px), and the "punched by" line with
  an edit pencil.
- **Gift (recipient).** The wrapped box, the ribbon end with a small pull glyph, then the open box with the card, the
  crank, SAVE TO MY SHELF (56), MAKE YOUR OWN (48).
- **Shelf.** Rows 64 px: name, hole count, date; tap to load; swipe or a trash glyph to delete with a confirm.
- **Export.** AUDIO, STRIP IMAGE, PRINTABLE STRIP (beta), each 56 px, each ending in the share sheet.
- **Settings.** Sound, Motion, Swing, Chord hints, About: the positioning line, "Sky Wolf Studio".

One page; `ready` once.

---

## 7. ART (what Stephen can make this month; the app never waits on it)

Three sheets in `plans/windup/ART-PACK-WINDUP.md` (a copy in 012Assets as `Windup — Art Pack`). The box is drawn by code
tonight (walnut grain, brass, velvet as gradients and noise); the hero render replaces the drawn box only if it can be cut
into layers (the lid, the body, the comb, the crank), so it is delivered as a layered sheet on white.

| File | Used for | Delivered | In game |
|---|---|---|---|
| `box-layers.png` | the box body, lid, comb and crank as four separate renders on one sheet, white background | 1:1 | `art/box-*.png` cut and keyed by Fable |
| `velvet.png` | the cloth, tiled | 1:1 tile | `art/velvet.jpg` 1024x1024 q75 |
| `wraps.png` | three wrapping papers on one sheet | 3:1 | `art/wrap-<name>.jpg` 512x512 tiles cut by Fable |

The icon is the drawn box; the hero render, if it beats it, becomes the icon.

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit)

```
{nm:"Windup", ds:"Punch holes in a paper strip, turn the crank yourself, and hear your song plink out of a little brass music box. Wrap it up and send it to someone.", cat:"creative", url:"/satellites/windup/?v=<stamp>", ic:"🎁", thumb:"/portal-assets/thumbs/windup.png", beta:true, fresh:true}
```

Must be true first: thumb under 150 KB; the live URL answers with the stamp; ALL GATES PASSED; `test/crank.mjs` and
`test/gift.mjs` passed with real pointers; `docs/shots/p0-tine.wav` exists and Stephen has been told to listen.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- Everything in `plans/fathom/HANDOFF-FATHOM.md` section 9 and the audio scars in `plans/swell/HANDOFF-SWELL.md` section 9
  (a suspended context on iOS, ramps from the last event, single use oscillators, the Blob arrives in `onstop`).
- A crank that reads angle from the pointer's absolute position jumps when the finger crosses the hub; read the delta
  from the previous sample and ignore samples within 20 px of the hub.
- A strip position that advances by wall time while a finger is down is the auto play leaking into the crank; the two
  never run at once.
- A note fired on the frame after the crossing lands up to 16 ms late; compute the crossing fraction and schedule at
  `currentTime + fraction * frameDt`.
- The refusal rule must be checked on the row, not the whole strip; a beginner's first bar is all one row.
- The printable PDF is a real world object; a wrong `MM_PER_STEP` wastes paper and trust, which is why it is beta.
- The gift link is data from a stranger; clamp every step and row before drawing anything.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The design's three open questions take these answers tonight:

1. **Name: WINDUP.** Stephen's folder and title; Tinkerbox and The Little Crank stay in the morning report.
2. **Fifteen notes only.** Section 3.2.
3. **Signature line on by default, editable.** Section 3.5.

Yours without asking: the exact partial ratios and decay curve once the render gate is green, the drawn box, the wrap
patterns, the seed melody's taste inside the rules.

Stephen's, never guessed: price, store, the name, the printable strip's clearance (3.4), the holiday post, anything with
money.

---

## 11. STEPHEN ONLY

Listen to `docs/shots/p0-tine.wav` first. Then the phone: crank Twinkle, punch a bar, give it to Jessie by link, open the
link on her phone and pull the ribbon. Print one strip and lay it on a real one before the PDF leaves beta. The three art
sheets when the Midjourney month allows.

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 1.5 h, P1 about 2.5 h, P2 about 2 h, P3 about 1.5 h: about 7.5 hours. Expect 3,000 to
3,800 lines. **Where a single night stops well:** the end of P2 (the box, the crank, the punch, the gift) is the whole
product; export is a bonus. If the clock says P1 cannot finish, land the crank and the player before the editor; a box
that plays Twinkle when you crank it is already the memory.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0 step 1, the gate that fails first (2026-09-06)

Before a line of the game exists, the thing that will say whether it is
shippable exists and says no. Three gates named, three gates red, and the
runner prints the FAILING lines rather than the tail.

```
sim             FAIL  0s
lint            FAIL  0s
tine            FAIL  0s

================================================================

--- sim (wanted: WINDUP TEST OK) ---
Error: ENOENT: no such file or directory, open '/workspaces/lucid-winds/satellites/windup/index.html'

--- lint (wanted: LINT OK) ---
Error: Cannot find module '/workspaces/lucid-winds/satellites/windup/tools/lint.mjs'

--- tine (wanted: TINE OK) ---
Error: Cannot find module '/workspaces/lucid-winds/satellites/windup/test/tine.mjs'

3 GATES FAILED
```

Scaffold taken from `satellites/airworthy/`, which is the freshest in the fleet:
the harness (a static server that also serves the site root's music files, a
browser, and a tap that is a real pointer press at a point `elementFromPoint`
agrees is reachable), `sw.js` with its own cache name, the manifest, and the
icon tool. `sim.js` reads the SIM and TEST layers out of `index.html` through
marker comments, so there is one implementation of the rules and the bot punches
the same strip a thumb does.

---

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `tine, crank,
gift, pdf, layout`.

---

## 15. THE MORNING REPORT

The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **Listen to:** the WAV.
