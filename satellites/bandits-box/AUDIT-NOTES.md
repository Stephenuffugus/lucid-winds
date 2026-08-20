# BANDIT'S BOX — audit and deepening pass, 2026-08-16

Read the source end to end (all 3600 lines of it, plus sw.js, the manifest and
the two planning docs), wrote the findings list first, then fixed worst first.
No browser was available in this lane, so everything below is either proved by
reading, proved by `check.mjs`, or proved by simulating the physics in node.
**Nobody has LOOKED at this build.** That gate is still open and it is named
at the bottom.

---

## What the audit found

Ordered worst first. Everything marked FIXED is fixed in this file.

### 1. FIXED, worst of the lot: the silence watchdog cut live gestures on touch

`window.addEventListener('pointerout', ... if(e.pointerType==='touch') pointerDrop(e))`
with a comment saying it was harmless. It was not.

Calling `setPointerCapture` retargets the pointer, and the browser fires
`pointerout` at the element the gesture STARTED on, one move into the stroke.
Every toy in here captures. So on a phone the pointer register emptied while
the finger was still down, the 600 ms watchdog then concluded nothing was being
touched, and `allQuiet(false)` killed every friction bed mid rub. Any drag
longer than about half a second went silent for the rest of the stroke, on the
continuous friction engine that is the entire point of the app.

It never showed in development because the guard only let `touch` through and a
mouse does not take that path. The balloon's handler quietly setting
`POINTERS[e.pointerId]=true` by hand is the fingerprint of someone hitting the
symptom and patching around it.

Fix: `if(e.pointerType==='touch' && !e.buttons) pointerDrop(e)`. A pressed
finger has not left. The real lift still lands (pointerout after pointerup
carries buttons 0), and pointerup already handled it anyway.

### 2. FIXED: two toys played their sounds over whatever toy you moved on to

Both the spinner and the cradle keep their physics running when you leave them,
which is right. Both also kept making noise there, which is not.

- `spinTick` fired a lobe tick whenever `sp>0.02`, with no check on the current
  toy. Flick the spinner hard, switch to slime, listen to a spinner tick over
  the slime for the next ten seconds.
- `clack()` in the cradle, the same: leave it swinging and it clacks at you from
  another toy.

This is the white noise family of bug that the LIVE registry, the watchdog and
phase C of the build plan were all built to kill, and it walked straight past
all three because it is one-shots, not loops. Ticks are now gated on
`curToy`. The motion still travels; the sound does not.

### 3. FIXED: coming back to a spinning spinner was silent

`allQuiet(true)` on a toy switch stops the whir, but `spinVoice` still held the
stopped object, and `set()` on a stopped voice does nothing. So returning to a
spinner that was still turning gave you a silently spinning spinner until it
stopped and you touched it again. Voices now expose `dead`, the spinner drops a
dead one and builds a fresh whir. The stress ball and the balloon got the same
treatment.

### 4. FIXED: the balloon could be held by nobody

Background the app mid inflate (or lose the pointer any other way) and
`blnHold` stayed true with no pointerup coming. Return, and the balloon inflates
by itself, in silence, to maximum, and stays there until you touch it again.
Now: if no pointer is down, nothing is holding the balloon, and it sputters back
the way an unheld balloon does.

### 5. FIXED: three signature toys could never take a recording

The build plan calls the foley pipeline the special sauce, and phase D rewired
the switch wall through `feel()` so it could take one. Three toys were still
calling the synth directly and were missed:

- **chocolate** (a tier 1 sound on the shot list, "record real chocolate bars,
  three thicknesses") synthesised its crack inline
- **bubble wrap** did the same, plus its own copy of the ripple and the buzz
- **edamame** likewise

They now go through `feel()` as `crack`, `burst`, `bean` and `unbean`, with
their own ripple colours, buzz lengths and manifest lines.

They are deliberately NOT called `snap` and `pop`. `snap` is the press studs on
the latches board and `pop` is the pop-it dome; if chocolate borrowed `snap`,
Stephen's chocolate recording would fire every time you closed a press stud.
**`SFX-SHOT-LIST.md` needs four rows adding** (`crack`, `burst`, `bean`,
`unbean`) plus `rattle`, `ring` and `land` for the new toys. That file is
outside this folder so I could not edit it; the manifest inside the app is
staged and commented, which is the half that actually runs.

### 6. FIXED: house rule 3 was broken in eight places

"Every touch makes a ripple, so the whole app still works with the sound off."
Putting a finger on the slime, the gears, the cradle, the spring, the sand, a
texture tile, the tissue or the dial produced no mark at all until you moved.
The slime was the worst: it made a squish sound with no visual whatsoever, which
is exactly the redundant representation rule the research doc names. All eight
now mark the touch down. The stress ball's release did the same in reverse (a
sound with no ripple) and now goes through `feel()`.

### 7. FIXED: nine controls under the 48px floor

Measured from the CSS as rendered at 375x667, not eyeballed:

| control | was | now |
|---|---|---|
| toy bars (big/medium/tiny, light/medium/heavy, thick/runny/stiff, finger/rake, milk/dark/white) | about 30px | 48 (min-height) |
| `.mini` (fresh bar, fresh sheet, smooth it over) | about 24px | 48 (min-height) |
| settings toggles `.sw` | 29px | 49 (transparent reach) |
| sequin swatches | 34px | 48 |
| tray chips | 38px | 48 (transparent reach) |
| tissue balls | 34px | 48 (transparent reach) |
| beads | 34px | 40 drawn, 48 reach, wire spacing moved with it |
| `.tgl` toggles | 46px wide | 48 |
| full screen corner buttons | 40px | 48 |

Two techniques on purpose: things in a row grow, things whose drawn size IS the
design keep their size and gain transparent reach through a `::before`, the same
trick the topbar icons already used.

Deliberately NOT enlarged: pop-it bubbles at the "tiny" setting, bubble wrap
cells, sequins, wall switches. Those are the play surface, not chrome, and a
pop-it with big bubbles is a different toy. The player chooses that size.

### 8. FIXED: a dash in player facing copy, and a garbage colour

`press harder and move faster &mdash; it all changes the sound` was the only
player facing dash in the file; it is a middle dot now like every other hint.
`CHOC.white.edge` was the literal string `'#BFA madeup'`, patched over on the
next line by an assignment; the flavour table is clean now and carries its own
`semi` for pitching a recorded crack.

### 9. VERIFIED, both original landmines are genuinely dead

- `window.storage` (the claude.ai artifact API, which does not exist in a
  browser and silently persisted nothing) is gone. Settings are
  `localStorage` under `bandit-set`, with the promise shape kept so the boot
  call still reads `loadS().then(...)`. `check.mjs` now fails if it ever
  comes back.
- The switch wall really does go through `feel()` as `click`/`clack`, with
  ripple colours, buzz lengths and manifest entries. Confirmed by reading, not
  assumed.

### 10. Checked and NOT changed

- **Every one of the 21 toys works and none is a stub.** All have sections,
  handlers, physics and sound. Read every one.
- Multitouch: pop-it, wrap, sequins, wall, textures (3 beds), sand and the
  stress ball all key their state by `pointerId`. Correct.
- No dead ends: every lockout self clears (peri 800 ms, chocolate 220 ms,
  tissue 650 ms, the pop-it cascade can be interrupted by touching it, the
  balloon flight lasts under a second and can be waited out).
- The service worker is clean. Both cache names carry the `banditsbox-` prefix
  and the activate filter is prefix only, so it cannot touch PadLab. Left at
  v1: navigations are network first and rewrite the cached shell on every good
  load, so the new HTML lands without a bump, and bumping would mean bumping the
  registration in lockstep for no gain.
- `_openMystery`-style Dew sinks, earns, tallies of any kind: still absent, on
  purpose. Nothing in this pass adds progression.

---

## What was added

### Two new toys, 22 to 24

Both chosen for a verb the box did not have. Neither is a reskin: the box
already had press, pull, drag, rotate, rip, snap, swing and inflate.

**Rain stick (`shake`).** The first toy here that answers slowly. Turn the tube
over with your finger and ninety grains fall under whatever component of gravity
the angle gives them, stack at the low end instead of collapsing to a point,
scatter off the pins, and drive the friction bed by how many are moving and how
fast. Level is silence. A gentle tip trickles for ten seconds, a full turn
pours out in three. Once you have tipped it, the sound is out of your hands,
which nothing else in the box does.

**Coin (`coin`).** One flick, then it is nothing to do with you. It spins on
edge, runs down, and falls into the wobble every dropped coin does: the contact
point races round faster and faster while the coin lies flatter, ending in that
rush of clicks. Catching it mid spin stops it dead, the same gesture the
spinner already taught. It lands on a face because that is where it stopped.
Nothing counts it, nothing calls it, there is nothing to get right.

Both were tuned by simulation, and both were wrong first time:

- the rain stick emptied in one second with the bed pinned at full gain the
  whole way, so a nudge and a full turn sounded identical. Terminal speed is
  now about a tenth of that: 3 to 10 seconds depending on the tilt, peak gain
  0.43 at a lazy angle against 1.0 at a full turn.
- the coin gave exactly seven evenly spaced ticks every single time regardless
  of the flick, which is a metronome. It is about eighteen now, opening 233 ms
  apart and closing to 50 ms.
- **the coin would have flashed.** At half a radian a frame the width of the
  face alternates near zero and near full on consecutive frames: a strobe, in
  an app whose research doc names flashing as a thing to avoid. Real eyes see a
  fast coin as a blurred disc, so a blur floor rises with speed and the flicker
  cannot happen. Worst frame to frame width change is now 11%. Calm motion
  holds it at the blur the whole way.

### Two materials in the friction engine

- **rubber**: grips rather than slides, dull and low, and squeals when you push
  it fast.
- **velvet**: has a NAP. Sweeping with the pile whispers, sweeping against it
  rasps, and the nap is drawn as well as heard. It is the only surface in the
  box that cares which direction you are going, which is why it is worth having.

### A settings surface with nothing coercive in it

- The deal, said out loud where the settings are: no ads, nothing to unlock, no
  toy ever locked, no day ever missed, nothing counted unless you switch the
  tally on yourself, and nothing leaves the phone. The whole category gates its
  toys behind rewarded video; not saying so leaves the best thing about this app
  unsaid.
- **Start fresh**: forgets the settings and the pinned toys. Two taps rather
  than a modal (the button says "sure?" for four seconds). It is the only data
  the app holds, so this really is everything it knows about you.

### `voice()` split out of `feel()`

Repeating ticks (the coin's rattle, and anything like it later) still want a
recording when one exists, but a ripple and a buzz per tick would be a strobe
and a massage. `voice()` is the sound half; `feel()` is `voice()` plus the mark
and the buzz. Every one-per-finger sound still goes through `feel()`.

---

## The check

```
node satellites/bandits-box/check.mjs        # or pass a directory
```

Twelve checks, and **every one was watched failing against a deliberately
broken copy before it was trusted**, then the unmodified folder was re-run
green. One of them (the stub test) passed vacuously on the first attempt
because the last toy's code region ran to the end of the file and picked up the
picker's listeners; that is fixed and the fixed version was watched failing.

1. every script block parses (real parse, not a brace count)
2. no literal `</script>` inside a JS string (it truncates the block, and a
   naive regex checker agrees with the browser on the wrong answer)
3. every toy in TOYS has a section, a pointer handler and a sound
4. no toy region is a stub
5. every name spoken through `feel()`/`voice()` exists in V and has a ripple
   colour (a typo here is a silent no-op)
6. every SFX_MANIFEST name, live or commented, is a real voice
7. no dash characters in player facing copy, in HTML or set from JS
8. the worker only ever deletes `banditsbox-` caches
9. SHELL_VERSION and the registration `?v=` in lockstep
10. the 48px floor, for the controls it knows about
11. `window.storage` is gone and settings are written to localStorage
12. **it boots**: the real source runs against a DOM that knows exactly which
    ids and classes this HTML has and returns null for anything else, with no
    AudioContext at all. One typo in an id gives `null.addEventListener` and
    kills every function below it; this is the only static way to catch that,
    and it walks house rule 1 (the screen comes up with no audio) at the same
    time.

**What it cannot prove:** that anything feels right, that a gesture works, that
a control is reachable in the layout as rendered, or that a new control added
later is 48px (check 10 reads a hand maintained list, and it measures height,
not width). Fingers and screenshots only.

---

## What still worries me

1. **Nobody has looked at this build.** No screenshot of the two new toys, the
   two new texture tiles, the enlarged controls or the settings sheet. The
   things I would shoot first: the toy bars are 18px taller now, so the sand
   tray and the chocolate bar have less room on a short phone; the sequin
   swatch row got bigger and may wrap; the rain stick is a tall shape in a
   viewBox sized for the spring; the coin at rest may sit oddly against its
   shadow.
2. **The pointerout fix is reasoned, not measured.** I am confident about the
   mechanism, but the only real proof is a phone: rub a texture tile slowly for
   three seconds with headphones on and listen for the bed to survive past
   600 ms. That is the single most valuable thing anyone can do with this build.
3. **The strip is 24 tabs long now.** Favourites exist for exactly this, but the
   picker grid is the honest way in and the strip is getting to be a long
   scroll.
4. The velvet nap uses screen x direction, not direction relative to the drawn
   pile angle (97 degrees). Close enough to read, not physically exact.
5. The coin's spin direction comes from which half of the screen you released
   on, not from the swipe direction. Cosmetic, but it is a small lie about your
   own gesture.
6. The rain stick's grains are one path rebuilt per frame (ninety squares). It
   should be cheap, but it has never run on a real phone.
7. **The portal card `?v=` still says 20260816a.** It must be bumped on deploy
   or the host serves the old file. That is outside this folder.

---

# 2026-08-20 — Stephen's first hands-on pass (softball sideline testing)

He played it on his phone; the Aug 16 build had never been LOOKED at, and it
showed. Everything below verified by driving real touch gestures in headless
Chrome and reading the screenshots (scripts/bandit_touch_probe.mjs,
bandit_gear_zoom.mjs, bandit_features_probe.mjs, bandit_retest.mjs).

## Fixed, from his reports
1. **Spinner orbited off screen; spinner and gears turned the wrong way.**
   `#spinGrp`/`#dialGrp`/gear groups had a CSS `transform-origin` stacked on
   the `rotate(a cx cy)` attribute; Chrome maps the attribute onto CSS
   transform, so BOTH pivots applied and everything orbited the bottom-right
   corner of its viewBox instead of turning in place. Measured: the spinner's
   centre swept x 101..712 on a 412px screen. A node simulation can never
   catch this class of bug — it is renderer behaviour.
2. **Spinner flicks were bearing-tracked**, so a flick near the hub wrapped
   half a turn and shot off in a random direction. Now torque (r x v) with a
   floored radius: hub flicks cancel, rim flicks unchanged.
3. **Gears never meshed** — 3.6 units of daylight between "touching" gears,
   every gear counter-rotated from the driven one regardless of the chain,
   and touch coords ignored the letterbox so the wrong gear got picked.
   Rebuilt: pitch-tangent positions computed from the chain, tooth phases
   solved at build, rotation propagated by mesh adjacency (far gear
   co-rotates with the big one), letterbox-correct vbXY() mapping. Ratios
   verified exact (11/16, 11/13); zoomed screenshots confirm interleave.
4. **Newton's cradle swung OPPOSITE the pull.** All the maths assumed
   "positive = ball right" but rotate(+a) about a top pivot swings a hanging
   ball LEFT; the render was the one place the sign had to flip and did not.
   Ball now follows the finger (verified +53px screen movement on a
   rightward pull, full clack cycle at ~1s).
5. **vbXY() letterbox mapping** also applied to slime, stress ball, spring,
   rip strip, and the raccoon's drag scale (sand keeps naive mapping on
   purpose — its preserveAspectRatio is "none").

## Added, per his ask (more activities per toy, better sound)
- **Cradle impact package:** shock ring at the contact interface, the knock
  visibly shivers through the middle strings toward the far ball, and the
  clack now RINGS like steel (two quick inharmonic partials).
- **Bandit reactions:** three quick nose boops = sneeze (ears kick loose,
  'achoo'); a belly scribble = tickle (real raccoon churr trill + giggle
  shake); tail hauled past 85% = a low grumble and a sulk. Calm mode keeps
  sounds, skips theatrics. New voices churr/sneeze/grumble are in the
  manifest, ripple and buzz tables — recordings can land later.
- **Puppet:** slow jaw = a singing register (pentatonic hum ladder up the
  mouth, glides between notes) so wandering drags come out a tune; fast jaw
  still yaps. Googly eye pokes: plink + dizzy spin.
- **Gears:** flywheel coast — release a moving train and it runs down with
  slowing ticks and whir; grabbing it stops it, same grammar as the spinner.
- **A small synthetic room** (0.22s convolver, wet 0.15) behind every synth
  voice so one-shots stop sounding dead-dry. Behind the soften filter, so
  soft mode darkens the tail too.

## Still open
- The gear cluster sits small in a tall phone viewport (square viewBox in a
  portrait letterbox). More gears or a portrait viewBox would fill it.
- SFX recordings (SFX-SHOT-LIST.md) remain the biggest sound upgrade — now
  plus churr/sneeze/grumble rows.
